// Para probar a mano desde el navegador. Protegida con SYNC_KEY.
//   ...?key=TU_CLAVE                 -> sincroniza ahora
//   ...?key=TU_CLAVE&modo=cuentas    -> lista tus cuentas en Bridge
//   ...?key=TU_CLAVE&modo=movs       -> últimos movimientos (para revisar signos)
import { sincronizar, listarCuentas, ultimosMovs } from '../lib/sync.mjs';

export default async (req) => {
  const url = new URL(req.url);
  const clave = (process.env.SYNC_KEY || '').trim();
  if (!clave || url.searchParams.get('key') !== clave) {
    return new Response('No autorizado', { status: 401 });
  }
  try {
    const modo = url.searchParams.get('modo');
    if (modo === 'cuentas') return Response.json(await listarCuentas());
    if (modo === 'movs') return Response.json(await ultimosMovs());
    return Response.json(await sincronizar());
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
};
