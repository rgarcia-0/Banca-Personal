// Corre sola cada 5 minutos y trae los consumos nuevos de Bridge.
import { sincronizar } from '../lib/sync.mjs';

export default async () => {
  try {
    console.log('sync ok', JSON.stringify(await sincronizar()));
  } catch (e) {
    console.error('sync error:', e.message);
  }
};

export const config = { schedule: '*/5 * * * *' };
