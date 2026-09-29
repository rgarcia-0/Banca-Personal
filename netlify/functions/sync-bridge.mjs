// Corre sola cada 15 minutos y trae los consumos nuevos de Bridge.
import { sincronizar } from '../lib/sync.mjs';

export default async () => {
  try {
    console.log('sync ok', JSON.stringify(await sincronizar()));
  } catch (e) {
    console.error('sync error:', e.message);
  }
};

export const config = { schedule: '*/15 * * * *' };
