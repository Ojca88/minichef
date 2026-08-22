# Comprobaciones de seguridad manuales (RLS real) — actualizado al sistema de invitaciones

Con el cambio a "solo Google + invitación por email", el test que usaba el
código para unirse ya no aplica (esa función se eliminó de la base de
datos). Esta es la versión al día.

**Importante — ya no valen dos pestañas de incógnito solas.** Antes, dos
pestañas de incógnito creaban dos sesiones anónimas distintas, suficiente
para simular "dos personas". Ahora todo el mundo tiene que entrar con
Google, así que necesitas **dos cuentas de Google reales** (la tuya, y una
segunda — un Gmail personal, o pídele a alguien de confianza que te ayude
un momento con la suya). Pestaña normal = cuenta A, pestaña de incógnito =
cuenta B, cada una con su propio login de Google.

---

### Test 1 — Usuario A accede a los datos de su propio hogar
Pestaña A: entra con Google, crea un hogar ("Hogar A"). Comprueba que ves el menú/compra con normalidad.
✅ Esperado: acceso normal.

### Test 2 — Usuario B no accede a los datos del hogar de A
Pestaña B (con la segunda cuenta de Google): crea otro hogar ("Hogar B") — **sin que A lo invite**. En su consola (F12 → Console):
```js
await window.supabase.from('households').select('*').eq('id', '<ID_DEL_HOGAR_A>')
```
(saca el ID de A con `await window.supabase.rpc('my_household').maybeSingle().then(r => console.log(r.data.id))` desde la pestaña A).
✅ Esperado: `data: []` (vacío, sin error).

### Test 3 — Usuario A no puede forzar el `household_id` de otro hogar
En la pestaña A, con el ID del Hogar B:
```js
await window.supabase.from('households').update({ data: { hackeado: true } }).eq('id', '<ID_DEL_HOGAR_B>')
```
✅ Esperado: no se actualiza nada.

### Test 4 — Quien crea un hogar se convierte en `owner`
```js
await window.supabase.from('household_members').select('role').eq('user_id', (await window.supabase.auth.getUser()).data.user.id)
```
✅ Esperado: `role: 'owner'`.

### Test 5 — Aceptar una invitación por email te convierte en `member`
Desde la pestaña A (owner del Hogar A), invita al email de la cuenta B ("Invitar a alguien" en el panel). Copia el enlace que te muestra (o espera el email si ya tienes Resend configurado). Ábrelo en la pestaña B, inicia sesión con la cuenta B si no lo estabas.
✅ Esperado: B pasa a formar parte del Hogar A automáticamente. Repite la consulta del Test 4 en B.
✅ Esperado: `role: 'member'`.

### Test 6 — Volver a iniciar sesión con Google lleva directo al hogar
Cierra sesión en A, vuelve a pulsar "Continuar con Google" con la misma cuenta.
✅ Esperado: entra directo al mismo hogar, sin pedir nada.

### Test 7 — Una invitación caducada o revocada no deja unirse
En A, invita a un tercer email de prueba, y **cancela la invitación** inmediatamente ("Cancelar" en la lista de pendientes). Intenta usar ese mismo enlace para aceptar.
✅ Esperado: mensaje de "invitación cancelada", no te añade al hogar.

### Test 8 — Salir del hogar quita el acceso
En B, pulsa "Salir de este hogar". Repite la consulta del Test 2 desde B apuntando al Hogar A.
✅ Esperado: vacío otra vez.

### Test 9 — Expulsar a un miembro no borra los datos del hogar
Vuelve a invitar y aceptar con B (como en el Test 5). Desde A, usa el botón "Expulsar" sobre B.
✅ Esperado: B deja de ver el menú; A sigue viéndolo con normalidad.

### Test 10 — Eliminar el hogar borra todo en cascada
Como owner en A, usa "Eliminar este hogar" (con la confirmación de escribir el nombre).
```js
await window.supabase.from('household_members').select('*').eq('household_id', '<ID_BORRADO>')
```
✅ Esperado: vacío.

---

### Extra — específicos del sistema de invitaciones

**Test 11 — Solo el propietario puede invitar.** Con B como member (no owner) del Hogar A, intenta invitar a un tercer email desde el panel de B. No debería aparecer la opción de invitar para B en absoluto (los miembros no ven el formulario), pero si quieres comprobarlo a más bajo nivel:
```js
await window.supabase.functions.invoke('send-household-invitation', { body: { email: 'test@ejemplo.com' } })
```
✅ Esperado: error `SOLO_EL_PROPIETARIO_PUEDE_INVITAR`.

**Test 12 — El email tiene que coincidir exactamente.** Invita desde A a un email que NO sea el de la cuenta B (por ejemplo, invita a `otra-persona@gmail.com` pero abre el enlace con la cuenta B).
✅ Esperado: "Esta invitación está dirigida a otra cuenta de Google", no te añade.

**Test 13 — Reenviar invalida el enlace anterior.** Invita a un email, copia ese primer enlace. Sin que se acepte, invita **otra vez al mismo email** (esto reenvía). Intenta usar el enlace viejo (el primero).
✅ Esperado: el enlace viejo da error (invitación revocada/inválida); solo el nuevo funciona.

---

Ve a tu ritmo. Cuéntame cuáles pasan y, si alguno falla, dime el número y qué viste en vez de lo esperado.
