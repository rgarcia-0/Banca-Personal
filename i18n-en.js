/* i18n-en.js — shows the whole app in English without touching index.html strings */
const _d = Date.prototype.toLocaleDateString;
Date.prototype.toLocaleDateString = function (l, o) { return _d.call(this, l === 'es-DO' ? 'en-US' : l, o); };

const T = {
'Abriendo tu banco…':'Opening your bank…','Entra a tu cuenta':'Sign in to your account','Crea tu cuenta':'Create your account',
'Tus datos se guardan en tu servidor privado y se ven iguales en el celular, la tablet y la computadora.':'Your data is stored on your private server and looks the same on your phone, tablet and computer.',
'Correo':'Email','Contraseña':'Password','Entrar':'Sign in','Crear una cuenta nueva':'Create a new account','Crear cuenta':'Create account',
'Ya tengo una cuenta':'I already have an account','Usar sin cuenta (solo en este dispositivo)':'Use without an account (this device only)',
'Mínimo 6 caracteres':'At least 6 characters','tucorreo@ejemplo.com':'you@example.com',
'Correo o contraseña incorrectos.':'Wrong email or password.','La contraseña necesita al menos 6 caracteres.':'Password needs at least 6 characters.',
'Revisa el correo, parece mal escrito.':'Check the email, it looks misspelled.','Sin internet. Intenta de nuevo.':'No internet. Try again.',
'Inicio':'Home','Tarjetas':'Cards','Préstamos':'Loans','Historial':'History','Transacciones':'Transactions','Más':'More',
'Buenos días':'Good morning','Buenas tardes':'Good afternoon','Buenas noches':'Good evening',
'Tu dinero disponible':'Your available money','Agregar':'Add','Enviar':'Send','Compra':'Purchase','Pagar':'Pay',
'Detalle':'Details','Ver tarjetas':'View cards','Ver todos':'See all','Ver todo':'See all','Consumo en tarjetas':'Card spending',
'Últimos movimientos':'Recent activity','Sin préstamos registrados.':'No loans registered.','Primer mes con datos':'First month with data',
'Registra una compra y aquí verás en qué se va tu plata.':'Log a purchase and you will see where your money goes.',
'Todavía no hay movimientos.':'No transactions yet.','Agrega dinero o registra una compra para empezar.':'Add money or log a purchase to get started.',
'Cuenta de Ahorros':'Savings Account','Deuda total':'Total debt','Cuotas al mes':'Monthly payments','Agregar préstamo':'Add loan',
'Aún no tienes préstamos aquí.':'You have no loans here yet.','Toca “Agregar préstamo”.':'Tap “Add loan”.',
'Tarjetas de crédito':'Credit cards','Disponible':'Available','Disponible RD$':'Available RD$','Disponible US$':'Available US$',
'Balance usado':'Balance used','Balance en dólares':'USD balance','Pago mínimo':'Minimum payment','Registrar compra':'Log purchase',
'Descuenta del disponible':'Deducts from available credit','Pagar tarjeta':'Pay card','Desde tu cuenta de ahorros':'From your savings account',
'Movimientos':'History','Ingresos del mes':'Income this month','Gastos del mes':'Spending this month','Todos':'All','Ingresos':'Income','Gastos':'Spending',
'No hay movimientos con este filtro.':'No transactions match this filter.','Hoy':'Today','Ayer':'Yesterday',
'Supermercado':'Groceries','Restaurante':'Restaurants','Combustible':'Fuel','Transporte':'Transport','Salud':'Health','Servicios':'Utilities',
'Compras':'Shopping','Entretenimiento':'Entertainment','Cajero':'ATM','Transferencia':'Transfer','Depósito':'Deposit','Pago':'Payment','Otro':'Other',
'Ajustes':'Settings','Editar productos':'Edit products','Saldos, límites, cuotas y nombres':'Balances, limits, payments and names',
'Tu nombre':'Your name','Consumos automáticos':'Automatic transactions','Conecta tu banco y tarjetas':'Connect your bank and cards',
'Instalar en tu teléfono':'Install on your phone','Con su propio ícono, sin App Store':'With its own icon, no App Store',
'Apariencia':'Appearance','Automático':'Automatic','Claro':'Light','Oscuro':'Dark','Datos y cuenta':'Data & account',
'Copiar mis datos':'Copy my data','Respaldo en formato JSON':'JSON backup','Cerrar sesión':'Sign out','Reiniciar todo':'Reset everything',
'Borra movimientos y vuelve a los valores de prueba':'Deletes transactions and restores sample values',
'Modo local: guardado solo en este dispositivo':'Local mode: saved on this device only','Guardado en tu servidor':'Saved on your server',
'se ve igual en todos tus dispositivos':'looks the same on all your devices','Sin conexión al servidor':'Not connected to the server',
'Agregar dinero':'Add money','Entra a tu cuenta de ahorros':'Goes into your savings account','Retirar dinero':'Withdraw money','Retirar':'Withdraw',
'Sale de tu cuenta de ahorros':'Comes out of your savings account','Transferir':'Transfer','Enviar transferencia':'Send transfer',
'Compra con tarjeta':'Card purchase','Suma al balance de la tarjeta':'Adds to the card balance',
'Sale del ahorro y baja el balance':'Comes out of savings and lowers the balance','Pagar cuota del préstamo':'Pay loan installment','Pagar cuota':'Pay installment',
'Monto':'Amount','Tarjeta':'Card','Préstamo':'Loan','Moneda':'Currency','Pesos (RD$)':'Pesos (RD$)','Dólares (US$)':'Dollars (US$)','Cuenta':'Account',
'Concepto':'Description','Categoría':'Category','Fecha':'Date','Ej. Supermercado Nacional':'E.g. Grocery store','Ej. Pago de nómina':'E.g. Paycheck',
'Últimos consumos':'Recent spending','Tarjeta de doble saldo':'Dual-currency card','Del ciclo actual':'Current cycle','Disponible en dólares':'Available in dollars',
'Balance pendiente':'Outstanding balance','Ya pagado':'Already paid','Cuota mensual':'Monthly payment','Eliminar préstamo':'Delete loan',
'Se quita de tu lista. Los pagos ya registrados se conservan.':'It is removed from your list. Payments already logged are kept.',
'Sí, eliminar':'Yes, delete','Cancelar':'Cancel','Entendido':'Got it','Guardar':'Save','Guardar cambios':'Save changes',
'Nuevo préstamo':'New loan','Agrega todos los que tengas.':'Add all the ones you have.','Nombre':'Name','Monto original (RD$)':'Original amount (RD$)',
'Balance pendiente (RD$)':'Outstanding balance (RD$)','Cuota mensual (RD$)':'Monthly payment (RD$)','Tasa anual (%)':'Annual rate (%)',
'Cuotas totales':'Total payments','Cuotas pagadas':'Payments made','Día de pago (1-31)':'Payment day (1-31)','Monto original':'Original amount',
'Cada compra llega sola, con el nombre del comercio.':'Every purchase arrives by itself, with the merchant name.',
'Cuando tu banco avisa de un consumo, la app lo registra en la tarjeta o cuenta que coincida con los últimos 4 dígitos, y le pone categoría.':'When your bank reports a transaction, the app logs it on the card or account matching the last 4 digits and assigns a category.',
'La app consulta a Bridge sola cada 15 minutos. Los consumos nuevos aparecen sin que hagas nada.':'The app checks Bridge by itself every 15 minutes. New transactions appear without you doing anything.',
'Simular un consumo':'Simulate a purchase','Consumo recibido':'Purchase received',
'Pon aquí tus montos reales. Se guardan al instante.':'Enter your real amounts here. They save instantly.',
'Cuenta de ahorros':'Savings account','Últimos 4 dígitos':'Last 4 digits','Saldo actual (RD$)':'Current balance (RD$)','Límite (RD$)':'Limit (RD$)',
'Balance usado (RD$)':'Balance used (RD$)','Límite (US$)':'Limit (US$)','Balance usado (US$)':'Balance used (US$)','Pago mínimo (RD$)':'Minimum payment (RD$)',
'Día de corte':'Cut-off day','Día de pago (opcional)':'Payment day (optional)','Aparece en el saludo de inicio.':'Shown in the home greeting.',
'Queda con su propio ícono, a pantalla completa.':'It gets its own icon and runs full screen.',
'Tus datos quedan guardados en el servidor.':'Your data stays saved on the server.',
'Se borran los movimientos y los saldos vuelven a los valores de prueba.':'Transactions are deleted and balances return to sample values.',
'Esto no se puede deshacer. Si quieres conservar algo, primero usa “Copiar mis datos”.':'This cannot be undone. To keep anything, use “Copy my data” first.',
'Sí, reiniciar todo':'Yes, reset everything','Eliminar préstamo ':'Delete loan',
'Escribe un monto mayor que cero.':'Enter an amount greater than zero.','No tienes saldo suficiente en la cuenta de ahorros.':'Not enough balance in the savings account.',
'No tienes saldo suficiente en el débito.':'Not enough balance on the debit card.',
'Datos copiados al portapapeles':'Data copied to clipboard','No se pudo copiar aquí':'Could not copy here','Cambios guardados':'Changes saved',
'Dinero agregado':'Money added','Retiro registrado':'Withdrawal logged','Transferencia enviada':'Transfer sent','Compra registrada':'Purchase logged',
'Pago aplicado':'Payment applied','Cuota pagada':'Installment paid','Préstamo agregado':'Loan added','Préstamo eliminado':'Loan deleted',
'Nombre actualizado':'Name updated','Todo reiniciado':'Everything reset','Modo local activado':'Local mode on','No tienes tarjetas registradas':'No cards registered',
'No tienes préstamos registrados':'No loans registered','Sin conexión: se guardó aquí y subirá luego':'Offline: saved here and will upload later',
'Consumo':'Purchase','Depósito ':'Deposit','Auto':'Auto'
};
const dia = x => x === 'hoy' ? 'today' : x === 'mañana' ? 'tomorrow' : x.replace(/en (\d+) días/, 'in $1 days');
const R = [
[/^Gastos de (.+)$/, (m,a)=>`Spending in ${a}`],
[/^([↓↑]) (\d+)% (menos|más) que el mes pasado$/, (m,a,b,c)=>`${a} ${b}% ${c==='menos'?'less':'more'} than last month`],
[/^Corte (hoy|mañana|en \d+ días) · (\d+)% usado$/, (m,a,b)=>`Cut-off ${dia(a)} · ${b}% used`],
[/^(\d+) de (\d+) cuotas pagadas · (.+)% anual$/, (m,a,b,c)=>`${a} of ${b} payments made · ${c}% APR`],
[/^(\d+) de (\d+) cuotas · (.+)% anual$/, (m,a,b,c)=>`${a} of ${b} payments · ${c}% APR`],
[/^(\d+) de (\d+) cuotas$/, (m,a,b)=>`${a} of ${b} payments`],
[/^Debes en total (.*)$/, (m,a)=>`You owe ${a} in total`],
[/^Ahorros ••(.*)$/, (m,a)=>`Savings ••${a}`],[/^Débito ••(.*)$/, (m,a)=>`Debit ••${a}`],
[/^Límite (.*)$/, (m,a)=>`Limit ${a}`],[/^Corte el día (\d+) de cada mes$/, (m,a)=>`Cut-off on day ${a} of each month`],
[/^Terminada en (.+)$/, (m,a)=>`Ends in ${a}`],[/^corte el día (\d+)$/, (m,a)=>`cut-off on day ${a}`],
[/^(\d+)% del límite$/, (m,a)=>`${a}% of limit`],[/^Tarjeta (\d+)( · doble saldo)?$/, (m,a,b)=>`Card ${a}${b?' · dual currency':''}`],
[/^Préstamo (\d+)$/, (m,a)=>`Loan ${a}`],
[/^En dólares se usa la tasa de (RD\$ [\d.,]+) por US\$1\. La cambias en config\.js\.$/, (m,a)=>`Dollars use a rate of ${a} per US$1. Change it in config.js.`],
[/^Supera el disponible de la tarjeta \((.+)\)\.$/, (m,a)=>`Exceeds the card's available credit (${a}).`],
[/^El pago supera el balance de la tarjeta \((.+)\)\.$/, (m,a)=>`Payment exceeds the card balance (${a}).`],
[/^Pago a (.+)$/, (m,a)=>`Payment to ${a}`],[/^Cuota de (.+)$/, (m,a)=>`Installment for ${a}`],
[/^Compra con (tarjeta|débito)$/, (m,a)=>`${a==='tarjeta'?'Card':'Debit'} purchase`],
];
function tr(v) {
  const t = v.trim(); if (!t) return v;
  let o = T[t];
  if (o == null) for (const [re, f] of R) if (re.test(t)) { o = t.replace(re, f); break; }
  if (o == null && t.includes(' · ')) { const parts = t.split(' · ').map(p => tr(p)); o = parts.join(' · '); }
  return o == null || o === t ? v : v.replace(t, o);
}
function pasar(root) {
  if (root.nodeType === 3) { const n = tr(root.nodeValue); if (n !== root.nodeValue) root.nodeValue = n; return; }
  if (root.nodeType !== 1 || /^(SCRIPT|STYLE|INPUT|TEXTAREA)$/.test(root.tagName) && !root.placeholder) return;
  ['placeholder', 'aria-label', 'title'].forEach(a => { const v = root.getAttribute && root.getAttribute(a); if (v) { const n = tr(v); if (n !== v) root.setAttribute(a, n); } });
  root.childNodes.forEach(pasar);
}
const obs = new MutationObserver(ms => ms.forEach(m => m.addedNodes.forEach(pasar)));
obs.observe(document.body, { childList: true, subtree: true });
pasar(document.body);
document.documentElement.lang = 'en';
