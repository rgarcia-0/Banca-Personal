import { revisarAlertas } from '../lib/push.mjs';
export default async () => { await revisarAlertas(process.env.APP_UID); return new Response('ok'); };
export const config = { schedule: '0 12 * * *' }; // 8:00 a. m. en República Dominicana
