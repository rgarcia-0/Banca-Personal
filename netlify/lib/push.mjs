import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getMessaging } from 'firebase-admin/messaging';

const app = () => getApps()[0] || initializeApp({ credential: cert({
  projectId: process.env.FB_PROJECT_ID, clientEmail: process.env.FB_CLIENT_EMAIL,
  privateKey: (process.env.FB_PRIVATE_KEY || '').replace(/\\n/g, '\n') }) });
const db = () => getFirestore(app());
const nf = n => Number(n || 0).toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const ES_PAGO_TC = /pago.{0,20}(tarjeta|t\/?c\b|visa|master|amex|cr[eé]dito)|\bpago\s*tc\b|abono.{0,20}tarjeta/i;

export async function enviarPush(uid, { title, body, tag }) {
  const col = db().collection(`users/${uid}/tokens`);
  const snap = await col.get();
  const tokens = snap.docs.map(d => d.id);
  if (!tokens.length) return 0;
  const r = await getMessaging(app()).sendEachForMulticast({
    tokens, data: { title, body, tag: tag || '' }, webpush: { headers: { Urgency: 'high', TTL: '86400' } } });
  await Promise.all(r.responses.map((x, i) => {
    const c = x.error?.code || '';
    return (c.includes('not-registered') || c.includes('invalid-argument')) ? col.doc(tokens[i]).delete() : null;
  }));
  return r.successCount;
}

async function primeraVez(uid, key) {
  const ref = db().doc(`users/${uid}/datos/alertas`);
  const s = await ref.get();
  if (s.exists && s.data()[key]) return false;
  await ref.set({ [key]: Date.now() }, { merge: true });
  return true;
}
const estado = async uid => (await db().doc(`users/${uid}/datos/estado`).get()).data() || {};

/* Llamar por cada movimiento nuevo que llega de Bridge */
export async function notificarTx(uid, tx) {
  const S = await estado(uid);
  const t = (S.tarjetas || []).find(x => String(x.numero) === String(tx.ultimos4));
  const usd = tx.moneda === 'USD' ? 'US$' : 'RD$', monto = `${usd} ${nf(Math.abs(tx.monto))}`;
  const lugar = tx.comercio || 'merchant';
  if (t) {
    if (tx.monto < 0) {
      await enviarPush(uid, { title: `Purchase on ${t.nombre}`, body: `${monto} at ${lugar}`, tag: 'tx-' + tx.id });
      const nuevo = ((t.usado || 0) + (usd === 'RD$' ? Math.abs(tx.monto) : 0)) / (t.limite || Infinity) * 100;
      const mes = new Date().toISOString().slice(0, 7);
      if (nuevo >= 80 && await primeraVez(uid, `u80_${t.id}_${mes}`))
        await enviarPush(uid, { title: `⚠️ ${t.nombre} at ${Math.round(nuevo)}%`, body: 'You are close to your card limit.', tag: 'u80-' + t.id });
    } else await enviarPush(uid, { title: `Payment to ${t.nombre}`, body: `${monto} applied`, tag: 'tx-' + tx.id });
  } else if (tx.monto < 0 && ES_PAGO_TC.test(lugar)) {
    await enviarPush(uid, { title: 'Card payment', body: `${monto} · ${lugar}`, tag: 'tx-' + tx.id });
  } else {
    await enviarPush(uid, { title: tx.monto < 0 ? 'Debit purchase' : 'Deposit to your account', body: `${monto} · ${lugar}`, tag: 'tx-' + tx.id });
  }
}

/* Corte, pago y 80%: una vez al día (hora de República Dominicana, UTC-4) */
const dim = (y, m) => new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
function hoyRD() { const d = new Date(Date.now() - 4 * 36e5); return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())); }
function diasHasta(dia, hoy) {
  for (let k = 0; k < 2; k++) {
    const y = hoy.getUTCFullYear(), m = hoy.getUTCMonth() + k;
    const n = Math.round((Date.UTC(y, m, Math.min(dia, dim(y, m))) - hoy) / 864e5);
    if (n >= 0) return n;
  } return 99;
}
function fueAyer(dia, hoy) { const a = new Date(hoy - 864e5); return a.getUTCDate() === Math.min(dia, dim(a.getUTCFullYear(), a.getUTCMonth())); }

export async function revisarAlertas(uid) {
  const S = await estado(uid), hoy = hoyRD(), iso = hoy.toISOString().slice(0, 10), enviados = [];
  const push = async (key, title, body) => { if (await primeraVez(uid, key)) { await enviarPush(uid, { title, body, tag: key }); enviados.push(title); } };
  for (const t of S.tarjetas || []) {
    for (const [dia, et] of [[t.corte, 'corte'], [t.diaPago, 'pago']]) {
      if (!dia) continue;
      const d = diasHasta(dia, hoy), k = `${et}_${t.id}_${iso}`, L = et === 'corte' ? 'statement cut-off' : 'payment due date';
      if (d === 2) await push(k, `${t.nombre}: ${L} in 2 days`, `Day ${dia} is your ${L}.`);
      else if (d === 1) await push(k, `${t.nombre}: ${L} tomorrow`, `Tomorrow is your ${L}.`);
      else if (d === 0) await push(k, `Today is your ${L}`, `${t.nombre}: today is your ${L}.`);
      else if (et === 'corte' && fueAyer(dia, hoy)) await push(k, `${t.nombre} has cut off`, 'Your card cut off yesterday. Check your statement.');
    }
    const p = t.limite ? (t.usado / t.limite) * 100 : 0;
    if (p >= 80) await push(`u80_${t.id}_${iso.slice(0, 7)}`, `⚠️ ${t.nombre} at ${Math.round(p)}%`, 'You are close to the maximum of your limit.');
  }
  return enviados;
}
