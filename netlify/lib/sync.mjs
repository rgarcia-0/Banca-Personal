// Lógica compartida: le pregunta a Bridge por consumos nuevos y los deja
// en users/{UID}/bandeja, que es la carpeta que tu app ya escucha.
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const API = 'https://api.bridge.com.do';
const env = k => (process.env[k] || '').trim();
const hoy = () => new Date().toISOString().slice(0, 10);
const haceDias = n => new Date(Date.now() - n * 86400000).toISOString().slice(0, 10);

function db() {
  if (!getApps().length) {
    initializeApp({
      credential: cert({
        projectId: env('FB_PROJECT_ID'),
        clientEmail: env('FB_CLIENT_EMAIL'),
        privateKey: env('FB_PRIVATE_KEY').replace(/^"|"$/g, '').replace(/\\n/g, '\n')
      })
    });
  }
  return getFirestore();
}

async function bridge(path, params = {}) {
  const url = new URL(API + path);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const r = await fetch(url, {
    headers: {
      Authorization: `Bearer ${env('BRIDGE_API_KEY')}`,
      'X-Scoped-Token': env('BRIDGE_SCOPED_TOKEN')
    }
  });
  if (!r.ok) {
    const causa = r.status === 401 ? ' (llave de API inválida)'
      : r.status === 403 ? ' (scoped token inválido)' : '';
    throw new Error(`Bridge respondió ${r.status} en ${path}${causa}`);
  }
  return r.json();
}

// Todas las cuentas de todas las conexiones activas.
export async function cuentas() {
  const { connections } = await bridge('/connections');
  const out = [];
  for (const c of connections.filter(c => !c.revokedAt)) {
    const { accounts } = await bridge(`/connections/${c.id}/accounts`);
    for (const a of accounts) out.push({ ...a, banco: c.institution && c.institution.name });
  }
  return out;
}

// Para ver qué números y nombres tiene Bridge (sin saldos).
export async function listarCuentas() {
  return (await cuentas()).map(a => ({
    banco: a.banco, nombre: a.name, tipo: a.type, ultimos4: a.lastFour, moneda: a.currency
  }));
}

async function traer(acc, estado) {
  const params = { limit: '200' };
  if (estado.startsWith('d:')) params['date[gte]'] = estado.slice(2);
  else params.refreshedSince = estado;
  const todas = [];
  for (let i = 0; i < 10; i++) {
    const r = await bridge(`/accounts/${acc.id}/transactions`, params);
    todas.push(...r.transactions);
    if (!r.pagination || !r.pagination.hasMore) break;
    params.cursor = r.pagination.nextCursor;
  }
  return todas;
}

// Para revisar cómo vienen los signos: últimos 14 días, 5 por cuenta.
export async function ultimosMovs() {
  const out = [];
  for (const a of await cuentas()) {
    const t = await traer(a, 'd:' + haceDias(14));
    out.push({
      cuenta: `${a.banco} ${a.name} ·${a.lastFour}`, tipo: a.type,
      movs: t.slice(0, 5).map(x => ({ monto: x.amount, fecha: x.date, descripcion: x.description, estado: x.status }))
    });
  }
  return out;
}

function normalizar(tx, acc) {
  let monto = Number(tx.amount);
  const invertir = acc.type === 'credit' ? env('INVERTIR_CREDITO') : env('INVERTIR_DEBITO');
  if (invertir === 'si') monto = -monto;
  return {
    id: String(tx.id).replace(/[^\w-]/g, '_'),
    monto,                                            // la app espera consumo = negativo
    moneda: acc.currency === 'USD' ? 'USD' : 'DOP',
    comercio: String(tx.description || '').replace(/\s+/g, ' ').trim() || 'Consumo',
    ultimos4: String(acc.lastFour || '').slice(-4),
    fecha: String(tx.date).slice(0, 10),
    estado: tx.status
  };
}

const maximo = lista => lista.filter(Boolean).sort().pop() || null;

export async function sincronizar() {
  const fs = db();
  const uid = env('APP_UID');
  if (!uid) throw new Error('Falta APP_UID');
  const ref = fs.doc(`users/${uid}/sync/bridge`);
  const snap = await ref.get();
  const cursores = (snap.exists && snap.data().cursores) || {};
  const diasIniciales = Number(env('DIAS_INICIALES') || 0);
  const lista = await cuentas();
  let nuevas = 0;

  for (const a of lista) {
    let estado = cursores[a.id];
    if (!estado) {
      if (diasIniciales <= 0) {
        // Primera vez: no se importa el historial, solo se marca "desde aquí".
        cursores[a.id] = a.lastTransactionRefresh || 'd:' + hoy();
        continue;
      }
      estado = 'd:' + haceDias(diasIniciales);
    }
    const txs = await traer(a, estado);
    const validas = txs.filter(t => t.status !== 'void');
    for (let i = 0; i < validas.length; i += 400) {
      const batch = fs.batch();
      for (const t of validas.slice(i, i + 400)) {
        const n = normalizar(t, a);
        batch.set(fs.doc(`users/${uid}/bandeja/${n.id}`), n);
      }
      await batch.commit();
    }
    nuevas += validas.length;
    cursores[a.id] = maximo([...txs.map(t => t.transactionRefresh), estado.startsWith('d:') ? null : estado])
      || a.lastTransactionRefresh || estado;
  }

  await ref.set({ cursores, ultima: new Date().toISOString(), nuevas }, { merge: true });
  return { cuentas: lista.length, nuevas };
}
