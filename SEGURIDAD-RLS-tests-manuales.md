# Comprobaciones de seguridad manuales (RLS real)

Estas 10 comprobaciones corresponden al punto 25 del documento. No se pueden
automatizar con Vitest porque necesitan políticas RLS ejecutándose de verdad
contra Postgres, con dos usuarios autenticados distintos — Vitest corre en
Node, sin una base de datos real detrás.

**Cómo probarlas:** abre dos pestañas de incógnito distintas (para tener dos
sesiones anónimas de Supabase independientes), o usa el "SQL Editor" de
Supabase con `set local role authenticated; set local "request.jwt.claims" = ...`
para simular cada usuario. La forma más fiable y simple es la primera:
dos navegadores/pestañas de incógnito reales, cada una creando su propia
sesión anónima al abrir la app.

---

### Test 1 — Usuario A accede a los datos de su propio hogar
1. Pestaña A: abre la app, crea un hogar ("Hogar A").
2. Comprueba que ves el menú/compra de ese hogar con normalidad.
✅ Esperado: acceso normal.

### Test 2 — Usuario B no accede a los datos del hogar de A
1. Pestaña B (incógnito, sesión distinta): abre la app, crea otro hogar ("Hogar B") — **sin usar el código de A**.
2. En la consola del navegador de la pestaña B, ejecuta:
   ```js
   await window.supabase.from('households').select('*').eq('id', '<ID_DEL_HOGAR_A>')
   ```
   (el `id` de A lo sacas de la pestaña A, con `cloud.household.id` desde React DevTools, o mirando la Network tab).
✅ Esperado: el resultado viene vacío (`data: []`), no un error — RLS filtra la fila, no la deniega explícitamente.

### Test 3 — Usuario A no puede forzar `household_id` de otro hogar
1. En la pestaña A, intenta en la consola:
   ```js
   await window.supabase.from('households').update({ data: { hackeado: true } }).eq('id', '<ID_DEL_HOGAR_B>')
   ```
✅ Esperado: no se actualiza ninguna fila (`count: 0` / `data: []`), aunque la petición no dé un error HTTP explícito — así es como responde RLS por diseño (finge que la fila no existe).

### Test 4 — Un usuario de Google que crea un hogar se convierte en `owner`
1. Vincula una cuenta de Google en la pestaña A (o inicia sesión con Google desde cero) y crea un hogar.
2. Ejecuta:
   ```js
   await window.supabase.from('household_members').select('role').eq('user_id', (await window.supabase.auth.getUser()).data.user.id)
   ```
✅ Esperado: `role: 'owner'`.

### Test 5 — Un usuario que se une con código se convierte en `member`
1. Desde la pestaña B, únete al hogar de A con su código de invitación.
2. Repite la consulta del Test 4 en la pestaña B.
✅ Esperado: `role: 'member'`.

### Test 6 — Volver a iniciar sesión con Google lleva directo al hogar
1. Cierra sesión en la pestaña A (botón "Cerrar sesión").
2. Vuelve a pulsar "Continuar con Google" con la misma cuenta.
✅ Esperado: entra directo al mismo hogar, sin pedir código.

### Test 7 — El código antiguo deja de servir tras regenerarlo
1. En la pestaña A (owner), pulsa "Regenerar código". Anota el código viejo y el nuevo.
2. Desde una tercera sesión (otra pestaña de incógnito), intenta unirte con el código **viejo**.
✅ Esperado: error "Ese código no existe".

### Test 8 — Salir del hogar quita el acceso
1. En la pestaña B (member), pulsa "Salir de este hogar".
2. Repite la consulta del Test 2 pero apuntando al hogar A desde la pestaña B.
✅ Esperado: igual que el Test 2 — resultado vacío.

### Test 9 — Eliminar un miembro no borra los datos del hogar
1. Con dos miembros en el mismo hogar, que uno salga (o que el owner lo expulse — la expulsión de UI no está implementada todavía, pero se puede probar por SQL con `delete from household_members where user_id = '<ID>' and household_id = '<ID>'` desde el SQL Editor).
2. El otro miembro sigue viendo el menú/compra con normalidad.
✅ Esperado: los datos siguen intactos para quien se queda.

### Test 10 — Eliminar el hogar borra todo en cascada
1. Como owner, usa "Eliminar este hogar" (con la confirmación de escribir el nombre).
2. Ejecuta:
   ```js
   await window.supabase.from('household_members').select('*').eq('household_id', '<ID_BORRADO>')
   ```
✅ Esperado: vacío — la cascada de `household_members` funcionó.

---

Cuando los hayas probado, cuéntame cuáles pasan y cuáles no (si alguno falla, dime el número y qué viste en vez de lo esperado) y seguimos desde ahí.
