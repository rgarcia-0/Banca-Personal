/* ══════════════════════════════════════════════════════════════
   CONFIGURACIÓN — este es el ÚNICO archivo que tienes que tocar.

   Pega aquí los datos que te da Firebase cuando creas el proyecto.
   Están explicados paso a paso en GUIA.md.

   Mientras no lo llenes, la app funciona igual pero guardando solo
   en este dispositivo (modo local).

   Estas claves NO son secretas: Firebase las publica a propósito.
   Quien protege tus datos son las reglas de seguridad que pone la
   GUIA en el paso 4. No las saltes.
   ══════════════════════════════════════════════════════════════ */

export const firebaseConfig = {
  apiKey:            "AIzaSyDr8S5VTRSgSBHhnyYCe4cUC4zzfJBZyck",
  authDomain:        "ransielgacia.firebaseapp.com",
  projectId:         "ransielgacia",
  storageBucket:     "ransielgacia.firebasestorage.app",
  messagingSenderId: "419662745489",
  appId:             "1:419662745489:web:b82118274582b758125430"
};

/* Moneda principal y tasa del dólar (para la tarjeta de doble saldo).
   Cambia 63 por la tasa que quieras usar. */
export const ajustes = {
  tasaUSD: 63.00
};
