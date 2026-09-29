import { enviarPush, revisarAlertas } from '../lib/push.mjs';
export default async (req) => {
  const u = new URL(req.url);
  if (u.searchParams.get('key') !== process.env.SYNC_KEY) return new Response('no', { status: 401 });
  const uid = process.env.APP_UID;
  if (u.searchParams.get('modo') === 'alertas') return Response.json(await revisarAlertas(uid));
  const n = await enviarPush(uid, { title: 'My Bank test', body: 'If you see this, notifications work.', tag: 'prueba' });
  return Response.json({ dispositivos: n });
};
