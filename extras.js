/* extras.js — alertas de corte/pago/80%, barras y números animados, activar push */
const FB = "https://www.gstatic.com/firebasejs/12.19.0/";
const st = document.createElement('style');
st.textContent = `
.bar i,.mini i,.lbar i{transition:width 1.2s cubic-bezier(.22,1,.36,1)}
.seg i{transform-origin:left;animation:segIn .9s cubic-bezier(.22,1,.36,1) both}
@keyframes segIn{from{transform:scaleX(0)}}
.chips span{animation:chipIn .5s both}
@keyframes chipIn{from{opacity:0;transform:translateY(6px)}}
.chips span.warn{background:color-mix(in srgb,var(--warn) 24%,var(--surface));border:1px solid var(--warn);color:var(--ink)}
.chips span.warn i{background:var(--warn)}
.chips span.info i{background:var(--accent)}
.mini i.alto{background:var(--warn)!important}
@media (prefers-reduced-motion:reduce){.bar i,.mini i,.lbar i{transition:none}}`;
document.head.appendChild(st);

/* ── días ── */
const dim = (y, m) => new Date(y, m + 1, 0).getDate();
function diasHasta(dia) {
  const h = new Date(); h.setHours(0, 0, 0, 0);
  for (let k = 0; k < 2; k++) {
    const y = h.getFullYear(), m = h.getMonth() + k;
    const f = new Date(y, m, Math.min(dia, dim(y, m)));
    const n = Math.round((f - h) / 864e5);
    if (n >= 0) return n;
  }
  return 99;
}
function fueAyer(dia) {
  const a = new Date(); a.setHours(0, 0, 0, 0); a.setDate(a.getDate() - 1);
  return a.getDate() === Math.min(dia, dim(a.getFullYear(), a.getMonth()));
}

/* ── alertas ── */
function alertas(S) {
  const out = [];
  const ciclo = (t, dia, kind) => {
    if (!dia) return;
    const d = diasHasta(dia), L = kind === 'cut' ? 'statement cut-off' : 'payment due date';
    if (d === 2) out.push(['info', `${t.nombre}: ${L} in 2 days (day ${dia})`]);
    else if (d === 1) out.push(['info', `${t.nombre}: ${L} tomorrow`]);
    else if (d === 0) out.push(['warn', `Today is the ${L} for ${t.nombre}`]);
    else if (kind === 'cut' && fueAyer(dia)) out.push(['info', `Your ${t.nombre} card has cut off`]);
  };
  S.tarjetas.forEach(t => {
    ciclo(t, t.corte, 'cut');
    ciclo(t, t.diaPago, 'pay');
  });
  S.prestamos.forEach(p => {
    if (p.dia) { const d = diasHasta(p.dia); if (d <= 2) out.push([d === 0 ? 'warn' : 'info', `${p.nombre} payment ${d === 0 ? 'today' : d === 1 ? 'tomorrow' : 'in 2 days'}`]); }
  });
  return out;
}
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/* ── animaciones ── */
function animarBarras() {
  const els = [...document.querySelectorAll('.bar i,.mini i,.lbar i')];
  els.forEach(e => { e._w = e.style.width; e.style.transition = 'none'; e.style.width = '0%'; });
  void document.body.offsetWidth;
  requestAnimationFrame(() => els.forEach(e => { e.style.transition = ''; e.style.width = e._w; }));
}
function contarNumeros() {
  if (matchMedia('(prefers-reduced-motion:reduce)').matches) return;
  document.querySelectorAll('.num').forEach(el => {
    const tn = [...el.childNodes].find(n => n.nodeType === 3 && /\d/.test(n.nodeValue));
    if (!tn) return;
    const m = tn.nodeValue.match(/\d[\d,]*(\.\d+)?/);
    if (!m) return;
    const meta = parseFloat(m[0].replace(/,/g, '')), dec = m[1] ? m[1].length - 1 : 0;
    const pre = tn.nodeValue.slice(0, m.index), post = tn.nodeValue.slice(m.index + m[0].length);
    const t0 = performance.now(), dur = 1100;
    const paso = t => {
      const k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3);
      tn.nodeValue = pre + (meta * e).toLocaleString('es-DO', { minimumFractionDigits: dec, maximumFractionDigits: dec }) + post;
      if (k < 1) requestAnimationFrame(paso);
    };
    requestAnimationFrame(paso);
  });
}

/* ── push ── */
async function activarPush(silencioso) {
  const mb = window.__mb;
  if (!mb.UID || !mb.fs) return;
  if (!('Notification' in window) || !('serviceWorker' in navigator))
    return !silencioso && mb.toast('On iPhone, add the app to your Home Screen first');
  if (!mb.cfg.vapidKey) return !silencioso && mb.toast('vapidKey is missing in config.js');
  try {
    if (Notification.permission !== 'granted') {
      if (silencioso) return;
      if (await Notification.requestPermission() !== 'granted') return mb.toast('Permission denied');
    }
    const { getMessaging, getToken } = await import(FB + 'firebase-messaging.js');
    const reg = await navigator.serviceWorker.register('./firebase-messaging-sw.js', { scope: './fcm-push/' });
    if (!reg.active) {
      const w = reg.installing || reg.waiting;
      if (w) await new Promise(r => w.addEventListener('statechange', () => w.state === 'activated' && r()));
    }
    const token = await getToken(getMessaging(mb.fa), { vapidKey: mb.cfg.vapidKey, serviceWorkerRegistration: reg });
    await mb.F.setDoc(mb.F.doc(mb.fs, 'users', mb.UID, 'tokens', token), { token, ua: navigator.userAgent.slice(0, 120), ts: Date.now() });
    localStorage.setItem('mibanco.push', '1');
    if (!silencioso) mb.toast('Notifications enabled on this device');
    pintarPush();
  } catch (e) { console.warn('push', e); if (!silencioso) mb.toast('Could not enable: ' + (e.code || e.message)); }
}
function pintarPush() {
  if (window.__mb.view !== 'mas' || document.getElementById('pushrow')) return;
  const card = document.querySelector('.card'); if (!card) return;
  const on = Notification.permission === 'granted' && localStorage.getItem('mibanco.push');
  const b = document.createElement('button');
  b.className = 'row'; b.id = 'pushrow';
  b.innerHTML = `<div class="av">🔔</div><div class="mid"><p class="t">Notifications</p><p class="s">${on ? 'Active on this device' : 'Tap to enable them here'}</p></div>`;
  b.onclick = () => activarPush(false);
  card.appendChild(b);
}

/* ── ciclo de render ── */
let ultima = '', primera = true;
window.addEventListener('mb:render', () => {
  const mb = window.__mb; if (!mb || !mb.S) return;
  if (mb.view === 'inicio') {
    document.querySelector('.chips')?.remove();
    const a = alertas(mb.S);
    const hero = document.querySelector('.hero');
    if (hero && a.length) hero.insertAdjacentHTML('afterend',
      `<div class="chips">${a.map(([c, t]) => `<span class="${c}"><i></i>${esc(t)}</span>`).join('')}</div>`);
  }
  document.querySelectorAll('.mini i').forEach(i => { if (parseFloat(i.style.width) >= 80 && i.closest('[data-card]')) i.classList.add('alto'); });
  const key = mb.view + (mb.S.config.ocultar ? 'x' : '');
  if (key !== ultima) { ultima = key; animarBarras(); contarNumeros(); }
  pintarPush();
  if (primera) { primera = false; activarPush(true); }
});

/* ── detalle desplegable de movimientos ── */
document.addEventListener('click', e => {
  const r = e.target.closest('.row[data-mov]'); if (!r) return;
  const mb = window.__mb; if (!mb || !mb.movs) return;
  e.stopPropagation();
  const nxt = r.nextElementSibling;
  const abierto = nxt && nxt.classList.contains('det');
  document.querySelectorAll('.det').forEach(d => { d.classList.remove('on'); setTimeout(() => d.remove(), 380); });
  document.querySelectorAll('.row.abierto').forEach(x => x.classList.remove('abierto'));
  if (abierto) return;
  const m = mb.movs().find(x => String(x.id) === r.dataset.mov); if (!m) return;
  const usd = m.moneda === 'USD', a = Math.abs(m.monto), f = n => n.toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const dop = usd ? a * mb.TASA : a, dol = usd ? a : a / mb.TASA;
  const fecha = new Date(m.fecha + 'T00:00:00').toLocaleDateString('es-DO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const filas = [['Date', fecha], ['Amount (RD$)', 'RD$ ' + f(dop)], ['Amount (US$)', 'US$ ' + f(dol)],
    [m.monto < 0 ? 'Debited from' : 'Credited to', m.cuentaNombre || '—'], ['Category', m.categoria || '—'],
    ['Type', m.origen === 'auto' ? 'Automatic (bank)' : 'Manual']];
  const d = document.createElement('div'); d.className = 'det';
  d.innerHTML = `<div><dl>${filas.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl></div>`;
  r.classList.add('abierto'); r.after(d);
  requestAnimationFrame(() => requestAnimationFrame(() => d.classList.add('on')));
}, true);

/* ── categorías: una barra por cada una, nombre y % encima ── */
window.addEventListener('mb:render', () => {
  const seg = document.querySelector('.seg'), leg = document.querySelector('.leg');
  if (!seg || !leg || document.querySelector('.cbars')) return;
  const items = [...leg.children].map((el, i) => ({
    n: el.childNodes[1]?.nodeValue?.trim() || '', v: parseFloat(el.querySelector('b').textContent.replace(/,/g, '')) || 0,
    c: el.querySelector('u').style.background }));
  const tot = items.reduce((s, x) => s + x.v, 0) || 1;
  seg.remove();
  leg.outerHTML = `<div class="cbars">${items.map(x => { const p = Math.round(x.v / tot * 100);
    return `<div><div class="h"><span>${esc(x.n)}</span><b>${p}%</b></div><div class="mini"><i style="width:${p}%;background:${x.c}"></i></div></div>`; }).join('')}</div>`;
  animarBarras();
});
