# Conectar Bridge (Qik + Banco Popular) con tu app

## Cómo funciona

```
Qik / Popular  →  Bridge  →  función en Netlify (cada 15 min)  →  Firestore /bandeja  →  tu app
```

Bridge no avisa cuando hay un consumo. Una función tuya le pregunta cada 15
minutos si hay algo nuevo y lo deja en la bandeja que tu app ya escucha.
Los consumos llegan con unos minutos de retraso, no al instante.

Tus llaves de Bridge viven **solo** en Netlify. Nunca van en `public/index.html`
ni en `public/config.js`, y nunca las pegues en un chat.

## Qué hay en esta carpeta

| Archivo | Para qué |
|---|---|
| `netlify/functions/sync-bridge.mjs` | La función que corre sola cada 15 min |
| `netlify/functions/sync-manual.mjs` | Para probar a mano desde el navegador |
| `netlify/lib/sync.mjs` | La lógica compartida |
| `netlify.toml`, `package.json` | Configuración de Netlify |
| `public/` | Lo único que se publica en la web (la app, iconos, etc.) |
| `public/conectar.html` | Página de un solo uso para conectar los bancos |
| `public/index.html` | Tu app, con un solo texto cambiado |

Copia todo esto encima de tu carpeta actual y **borra `ingest.js`**: ya no se usa.

---

## Paso 1 — Subir el proyecto a GitHub y Netlify

Las funciones necesitan instalar `firebase-admin`, y Netlify Drop (arrastrar
la carpeta) no instala nada. Por eso ahora se sube por GitHub.

1. Crea una cuenta en **github.com** y un repositorio **privado** llamado `mibanco`.
2. En el repositorio: **Add file › Upload files**, arrastra todo el contenido
   de la carpeta (incluida `netlify/`) y confirma.
3. En **app.netlify.com**: **Add new site › Import an existing project › GitHub**,
   elige `mibanco`. No cambies nada y despliega.

Esto te da una dirección nueva. Dos cosas que hacer con ella:

- En Firebase: **Authentication › Configuración › Dominios autorizados ›
  Agregar dominio**, y pones la nueva dirección de Netlify. Sin esto no podrás
  iniciar sesión.
- En tu iPhone, vuelve a añadir la app a la pantalla de inicio desde la
  dirección nueva. Tus datos siguen ahí, porque son de tu cuenta.

## Paso 2 — Liberar espacio en Bridge y conectar los bancos

Tu panel muestra **2/3 conexiones activas**. El Scoped Token solo se ve una
vez, y no lo guardaste (si sí lo tienes anotado, salta al Paso 3).
Hay que conectar de nuevo, y para eso cabe una conexión más, no dos.

1. En **dash.bridge.com.do › Conexiones**, revoca las dos viejas con el menú **⋯**.
2. En **Aplicación**, copia tu ID de aplicación (empieza con `app_`).
3. Abre `conectar.html` en tu computadora con un editor de texto y cambia
   `PEGA_AQUI_TU_APP_ID` por ese ID. Súbelo a GitHub.
4. Abre `https://TU-SITIO.netlify.app/conectar.html`, toca **Conectar un banco**
   y conecta **Qik**. Al terminar aparece el **token**. Cópialo ya.
5. Repite con **Banco Popular**. En esta segunda conexión no sale token nuevo:
   sirve el de la primera, porque usamos el mismo `externalUserId`.
6. **Borra `conectar.html`** del repositorio.

## Paso 3 — Los datos que faltan

**Cuenta de servicio de Firebase.** En Firebase: engranaje › **Configuración
del proyecto › Cuentas de servicio › Generar nueva clave privada**. Se
descarga un archivo `.json`. Ábrelo y usa estos tres valores:
`project_id`, `client_email`, `private_key`.
Es una llave con acceso total a tu base de datos: no la subas a GitHub.

**Tu UID.** Firebase › **Authentication › Usuarios**, columna *UID de usuario*
de tu cuenta.

## Paso 4 — Variables en Netlify

En Netlify: **Site configuration › Environment variables**. Crea estas:

| Nombre | Valor |
|---|---|
| `BRIDGE_API_KEY` | Tu llave `brdg_...` completa |
| `BRIDGE_SCOPED_TOKEN` | El token del Paso 2 |
| `FB_PROJECT_ID` | `project_id` del JSON |
| `FB_CLIENT_EMAIL` | `client_email` del JSON |
| `FB_PRIVATE_KEY` | `private_key` del JSON, completa, con los `\n` tal cual |
| `APP_UID` | Tu UID |
| `SYNC_KEY` | Una clave inventada por ti, larga, para el modo de prueba |

Si no tienes la llave `brdg_` completa, crea una nueva en **Llaves de acceso ›
Nueva llave**. Después haz **Deploys › Trigger deploy** para que las lea.

## Paso 5 — Probar

Cambia `TU-SITIO` y `TU_CLAVE`:

1. **Ver tus cuentas:**
   `https://TU-SITIO.netlify.app/.netlify/functions/sync-manual?key=TU_CLAVE&modo=cuentas`
   Deben salir las 4 cuentas (2 de Qik, 2 de Popular) con su tipo y últimos 4 dígitos.
2. **Poner esos últimos 4 en la app:** **Más › Editar productos**. Cada
   tarjeta y el débito deben tener exactamente los últimos 4 que Bridge muestra.
   Si no coinciden, el consumo cae en la cuenta de ahorros.
3. **Primera sincronización:**
   `...sync-manual?key=TU_CLAVE`
   Debe responder `{"cuentas":4,"nuevas":0}`. Cero es lo correcto: la primera
   vez solo marca "desde aquí" y no importa tu historial. Si importara el
   historial, tus saldos se descuadrarían.
4. **Haz una compra pequeña** con la tarjeta y espera unos minutos.
5. **Revisa los signos:**
   `...sync-manual?key=TU_CLAVE&modo=movs`
   Mira esa compra. La app espera que un **consumo sea negativo** y un
   pago o depósito positivo. Si en tu caso es al revés, agrega en Netlify
   `INVERTIR_CREDITO` = `si` (tarjetas) y/o `INVERTIR_DEBITO` = `si` (débito
   y ahorro) y vuelve a desplegar.
6. **Sincroniza otra vez** con `...sync-manual?key=TU_CLAVE`. Debe salir `nuevas: 1`
   y la compra aparece en la app con el nombre del comercio.

Desde ahí corre sola cada 15 minutos. Los registros están en Netlify, en
**Logs › Functions › sync-bridge**.

## Si algo falla

| Lo que ves | Qué pasa |
|---|---|
| `Bridge respondió 401` | La llave de API está mal o está incompleta |
| `Bridge respondió 403` | El scoped token está mal, o no es de las conexiones actuales |
| Error de `FB_PRIVATE_KEY` | Se pegó incompleta; copia el valor entero de `private_key` |
| `nuevas: 0` siempre | Todavía no hay movimientos posteriores a la primera sincronización |
| Sale un consumo como ingreso | Falta `INVERTIR_CREDITO` o `INVERTIR_DEBITO` |
| El consumo cae en Ahorros | Los últimos 4 de la app no coinciden con los de Bridge |
| Una conexión deja de traer datos | Expiró el acceso al banco. Se reconecta con Bridge Connect pasando el `connectionId`, sin perder el token |

## Detalles que conviene saber

- **Pendientes y confirmados:** una compra puede aparecer primero como
  `pending` y luego como `posted`. La app no la duplica si mantiene el mismo id
  (Bridge no lo garantiza en su documentación; si ves duplicados, avísame).
  Las anuladas (`void`) se ignoran.
- **Historial:** si quieres traer los últimos días la primera vez, agrega
  `DIAS_INICIALES` = `7` antes de la primera sincronización. Tus saldos en la
  app son manuales, así que esos movimientos se sumarían encima.
- **Seguridad:** el modo de prueba `sync-manual` queda protegido por
  `SYNC_KEY`. Si dejas de usarlo, bórralo.
