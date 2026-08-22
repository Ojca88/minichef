import { Link } from 'react-router-dom';

export default function Privacy() {
  return (
    <div style={{ paddingBottom: 90 }}>
      <header style={{
        padding: '22px 16px 26px', marginBottom: 18,
        background: 'var(--gradient-sage)',
        borderRadius: '0 0 var(--radius-xl) var(--radius-xl)',
        boxShadow: 'var(--shadow-sage)',
      }}>
        <h1 style={{ fontSize: 24, color: 'var(--white)' }}>Política de privacidad</h1>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', marginTop: 4 }}>
          Última actualización: 21 de agosto de 2026
        </p>
      </header>

      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 22, fontSize: 14, lineHeight: 1.6, color: 'var(--ink)' }}>

        <Section title="1. Responsable del tratamiento">
          <p>
            MiniChef es una aplicación desarrollada de forma independiente por{' '}
            <strong>[PENDIENTE: tu nombre o el de tu entidad]</strong>. Para cualquier
            consulta sobre esta política o tus datos, puedes escribir a{' '}
            <strong>minicheforbabies@proton.me</strong>.
          </p>
        </Section>

        <Section title="2. Datos recopilados">
          <p>Asociados a tu hogar, se guardan:</p>
          <ul style={listStyle}>
            <li>El menú semanal/mensual que planificáis (qué recetas asignáis a cada día y comida).</li>
            <li>La lista de la compra.</li>
            <li>Qué comidas se marcan como "comidas de verdad" (seguimiento nutricional).</li>
            <li>El rango de edad aproximado del bebé (ej. "12-18 meses"). No se recoge el nombre, la foto, la fecha de nacimiento exacta ni ningún otro dato identificativo del menor, ni información sanitaria (alergias, diagnósticos, tratamientos, peso, historial médico).</li>
            <li>La temporada elegida (invierno/verano), como preferencia del hogar.</li>
          </ul>
          <p>
            Cuando una acción se puede atribuir a una persona concreta (por ejemplo, quién marcó
            una comida o quién añadió un artículo a la compra), guardamos esa referencia — visible
            solo para los demás miembros de tu mismo hogar, nunca para nadie más. Esta referencia
            se elimina automáticamente si esa persona borra su cuenta (ver sección 9).
          </p>
          <p>
            MiniChef no necesita conocer el nombre, la fotografía ni otros datos identificativos
            del menor para funcionar, y no incluye ningún campo para introducir información
            sanitaria (alergias, diagnósticos, tratamientos, peso, historial médico). Si en el
            futuro se añadiera alguna funcionalidad de este tipo, se actualizaría esta política
            antes de activarla. Mientras tanto, evita introducir en los campos de texto libres
            de la app (como los platos "puestos a mano") información médica que no sea necesaria.
          </p>
          <p>MiniChef no usa herramientas de analítica ni de rastreo de terceros (revisado el código: no hay Google Analytics, Tag Manager, Meta Pixel, Sentry, PostHog, Hotjar, Mixpanel, ni ningún otro SDK de este tipo), y no muestra publicidad ni comparte datos con anunciantes.</p>
          <p style={{ fontSize: 12, color: 'var(--ink-muted)' }}>
            Esta política se complementa con las{' '}
            <Link to="/condiciones" style={{ color: 'var(--sage-dark)', textDecoration: 'underline' }}>Condiciones de uso y aviso de responsabilidad</Link>,
            especialmente relevantes si vas a usar las recetas de la app.
          </p>
        </Section>

        <Section title="3. Funcionamiento del hogar y el código de invitación">
          <p>
            Al abrir MiniChef por primera vez, se crea automáticamente una sesión anónima
            (sin que tengas que hacer nada) que identifica tu dispositivo de forma técnica.
            Con esa sesión creas o te unes a un <strong>hogar</strong> — el espacio compartido
            donde vive el menú, la lista de la compra y el seguimiento de tu familia. Varias
            personas pueden pertenecer al mismo hogar y ver y modificar la misma información.
          </p>
          <p>
            El <strong>código de invitación</strong> de 6 letras es un mecanismo para
            identificar un hogar concreto y solicitar unirte a él — no es una contraseña
            personal ni un mecanismo de acceso continuo. Una vez que te has unido, el acceso
            efectivo a los datos del hogar está controlado por tu pertenencia real a ese
            hogar y por las reglas de seguridad de la base de datos (Row Level Security de
            Supabase), no por si sigues conociendo el código. El propietario del hogar puede
            regenerar el código cuando quiera: el código anterior deja de servir para que se
            una gente nueva, pero los miembros que ya estaban dentro no pierden acceso.
          </p>
          <p>
            Si inicias sesión con Google, tu cuenta mantiene una identidad individual dentro
            del hogar (ver sección 6), aunque los datos funcionales del hogar en sí sean
            compartidos por todos sus miembros.
          </p>
        </Section>

        <Section title="4. Base jurídica del tratamiento">
          <p style={{ fontSize: 12, color: 'var(--ink-muted)', fontStyle: 'italic' }}>
            Esta tabla refleja una clasificación técnica orientativa a partir de cómo funciona
            realmente la aplicación, no un dictamen legal. Los puntos marcados como
            "PENDIENTE DE VALIDACIÓN LEGAL" requieren la revisión de un profesional antes de
            considerarse definitivos.
          </p>
          <TableWrap headers={['Finalidad', 'Datos utilizados', 'Base jurídica', '¿Obligatorio?']}>
            <TR c={['Prestar el servicio (menú, compra, seguimiento)', 'Sesión anónima, datos del hogar', 'PENDIENTE DE VALIDACIÓN LEGAL (probablemente ejecución de una relación contractual/prestación del servicio solicitado, art. 6.1.b RGPD)', 'Sí, para usar la función correspondiente']} />
            <TR c={['Identificación individual y sincronización entre dispositivos con Google', 'Nombre, email, foto de perfil', 'Consentimiento (art. 6.1.a RGPD) — es una acción explícita y opcional del usuario', 'No, es opcional']} />
            <TR c={['Atribuir dentro del hogar quién marcó o añadió algo', 'Nombre y foto (solo si usaste Google)', 'PENDIENTE DE VALIDACIÓN LEGAL (probablemente interés legítimo en la funcionalidad colaborativa, art. 6.1.f, condicionado a que ya diste tu consentimiento para el login)', 'No, solo ocurre si usas Google']} />
            <TR c={['Conservación y borrado automático tras 2 años de inactividad', 'Fecha del último inicio de sesión (gestionada por Supabase Auth)', 'PENDIENTE DE VALIDACIÓN LEGAL (probablemente obligación derivada del principio de limitación del plazo de conservación, art. 5.1.e RGPD)', 'No es un dato que se pida, es automático de la infraestructura']} />
          </TableWrap>
        </Section>

        <Section title="5. Proveedores tecnológicos">
          <p>
            MiniChef utiliza determinados proveedores tecnológicos que pueden tratar datos
            personales en la medida necesaria para prestar los servicios de infraestructura,
            alojamiento, autenticación o almacenamiento utilizados por la aplicación.
          </p>
          <TableWrap headers={['Proveedor', 'Servicio utilizado', 'Finalidad']}>
            <TR c={['Supabase', 'Base de datos (Postgres), autenticación (anónima y Google), sincronización en tiempo real, funciones de servidor (Edge Functions) para el borrado de cuenta y la limpieza automática', 'Almacenar y sincronizar los datos del hogar, gestionar el inicio de sesión, y ejecutar de forma segura acciones que requieren privilegios especiales']} />
            <TR c={['Vercel', 'Alojamiento y entrega de la aplicación web (hosting estático + CDN). MiniChef no ejecuta funciones de servidor en Vercel.', 'Servir la aplicación web a los usuarios']} />
          </TableWrap>
        </Section>

        <Section title="6. Transferencias internacionales de datos">
          <p>
            Tanto Supabase como Vercel son empresas con sede en Estados Unidos. Esto puede
            implicar transferencias internacionales de datos incluso cuando la infraestructura
            elegida está en la Unión Europea:
          </p>
          <ul style={listStyle}>
            <li>
              <strong>Supabase</strong>: confirmado directamente en el panel del proyecto — la
              base de datos primaria de MiniChef está alojada en la región Central EU
              (Fráncfort, Alemania — AWS eu-central-1). Aun así, el soporte técnico y
              determinados subencargados de Supabase pueden tratar datos fuera del Espacio
              Económico Europeo. Supabase ofrece un Acuerdo de Tratamiento de Datos (DPA) y usa
              Cláusulas Contractuales Tipo para estos casos.
            </li>
            <li>
              <strong>Vercel</strong>: MiniChef no usa funciones de servidor de Vercel, solo
              alojamiento estático — pero el plano de control, el soporte y los datos de cuenta
              de Vercel se procesan en Estados Unidos igualmente. Vercel se apoya en Cláusulas
              Contractuales Tipo y en el marco EU-US Data Privacy Framework.
            </li>
          </ul>
        </Section>

        <Section title="7. Seguridad">
          <p>
            El acceso a los datos de cada hogar está protegido a nivel de base de datos
            (Row Level Security de Supabase), no solo por el desconocimiento de un código: un
            usuario solo puede leer o modificar los datos de los hogares a los que realmente
            pertenece, y esto se comprueba en el servidor en cada petición, no confiando en lo
            que la propia aplicación diga desde el navegador.
          </p>
          <p>
            Las operaciones especialmente sensibles (borrar una cuenta, la limpieza automática
            por inactividad) se ejecutan en funciones de servidor independientes, con permisos
            elevados que nunca están expuestos ni accesibles desde el navegador.
          </p>
        </Section>

        <Section title="8. Conservación de los datos">
          <p>
            Los datos de un hogar se conservan mientras el hogar exista y tenga al menos un
            miembro. Los datos ligados a tu cuenta individual (nombre, foto, email, a qué
            hogares perteneces) se conservan mientras uses tu cuenta.
          </p>
          <p>
            <strong>Las cuentas de usuarios autenticados con Google que permanezcan inactivas
            durante un periodo de 2 años podrán ser eliminadas automáticamente</strong>, junto
            con los datos personales asociados exclusivamente a dichas cuentas, según se
            describe en la sección siguiente.
          </p>
        </Section>

        <Section title="9. Eliminación automática tras 2 años de inactividad">
          <p>
            MiniChef ejecuta periódicamente un proceso automático que identifica cuentas de
            Google que no han iniciado sesión en los últimos 2 años (a partir de la fecha de
            último inicio de sesión que gestiona la propia infraestructura de autenticación).
            Para cada cuenta inactiva:
          </p>
          <ul style={listStyle}>
            <li>Se elimina la cuenta de autenticación y el perfil asociado (nombre, email, foto).</li>
            <li>Si esa persona era la única integrante de un hogar, se elimina también ese hogar y todos sus datos.</li>
            <li>Si el hogar tiene más miembros, este simplemente deja de pertenecer a él — el hogar y los datos del resto de miembros se conservan intactos. Si era el propietario, la propiedad pasa automáticamente al miembro más antiguo del hogar.</li>
            <li>Su nombre y foto se eliminan de cualquier registro de "quién marcó esto" que quedara dentro de hogares que siguen existiendo.</li>
          </ul>
          <p>
            <strong>Alcance:</strong> este borrado automático aplica solo a cuentas identificadas
            con Google — las sesiones puramente anónimas no guardan datos personales
            identificables más allá de lo que ya vive dentro de un hogar, por lo que el motivo
            de este borrado (limitar la conservación de datos personales) no aplica de la misma
            forma, y borrarlas automáticamente cortaría el acceso a hogares que pueden seguir
            en uso desde otro dispositivo.
          </p>
          <p>
            <strong>Limitación conocida:</strong> actualmente MiniChef no dispone de un sistema
            de envío de emails, por lo que no se envía ningún aviso previo antes de la
            eliminación automática. Lo documentamos aquí de forma transparente en vez de
            simular una funcionalidad que no existe.
          </p>
        </Section>

        <Section title="10. Baja voluntaria de la cuenta">
          <p>
            Puedes solicitar la eliminación de tu cuenta en cualquier momento desde Inicio →
            panel de sincronización → "Eliminar mi cuenta", si has iniciado sesión con Google.
            Se te pedirá escribir "ELIMINAR" para confirmar — no se puede borrar por accidente
            con un solo clic.
          </p>
          <p>Al eliminar tu cuenta:</p>
          <ul style={listStyle}>
            <li>Se borran tu cuenta de autenticación, tu perfil (nombre, email, foto) y tu pertenencia a cualquier hogar.</li>
            <li>Se elimina tu nombre y foto de cualquier "quién marcó esto" que quedara dentro de hogares que siguen existiendo.</li>
            <li>Los datos compartidos del hogar (menú, compra, seguimiento) se mantienen intactos para el resto de miembros, salvo que fueras la única persona del hogar, en cuyo caso el hogar se elimina por completo.</li>
            <li>Si eras propietario de un hogar con más miembros, la app te pedirá antes transferir la propiedad a otra persona, o confirmar explícitamente que quieres eliminar el hogar entero para todos.</li>
          </ul>
          <p>Esta acción es permanente y no se puede deshacer.</p>
        </Section>

        <Section title="11. Inicio de sesión con Google">
          <p>
            El login con Google es opcional: la app funciona igual sin él, con la sesión anónima
            automática descrita en la sección 3. Al iniciar sesión, MiniChef solicita únicamente
            los permisos mínimos de identidad (no se piden permisos de Gmail, Calendar, Drive,
            contactos ni ningún otro servicio de Google). De los datos que Google proporciona,
            MiniChef solo utiliza y almacena:
          </p>
          <ul style={listStyle}>
            <li>Tu nombre.</li>
            <li>Tu dirección de email.</li>
            <li>La foto de tu perfil.</li>
          </ul>
          <p>Esto se usa exclusivamente para:</p>
          <ul style={listStyle}>
            <li>Identificarte individualmente dentro de tu hogar (por ejemplo, para mostrar quién añadió cada cosa).</li>
            <li>Recordar automáticamente a qué hogar perteneces la próxima vez que inicies sesión, en cualquier dispositivo, sin volver a escribir el código.</li>
          </ul>
        </Section>

        <Section title="12. Tus derechos">
          <p>
            Si resides en la Unión Europea, tienes derecho a acceder, rectificar, eliminar,
            limitar u oponerte al tratamiento de tus datos, y a la portabilidad de los mismos.
            Puedes ejercerlos escribiendo a <strong>minicheforbabies@proton.me</strong>,
            o directamente desde la app en el caso de la eliminación de tu cuenta (sección 10).
          </p>
        </Section>

        <Section title="13. Reclamaciones ante la autoridad de control">
          <p>
            Si consideras que el tratamiento de tus datos no se ajusta a la normativa, puedes
            presentar una reclamación ante la Agencia Española de Protección de Datos (AEPD) si
            resides en España, o ante la autoridad de protección de datos de tu país de
            residencia dentro de la Unión Europea.
          </p>
        </Section>

        <Section title="14. Cambios en esta política">
          <p>Si esta política cambia de forma relevante, actualizaremos la fecha de arriba y, si el cambio es significativo, te lo indicaremos dentro de la propia app.</p>
        </Section>

      </div>
    </div>
  );
}

const listStyle = { margin: '8px 0', paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 6 };

function Section({ title, children }) {
  return (
    <section>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600, marginBottom: 8 }}>{title}</h2>
      {children}
    </section>
  );
}

function TableWrap({ headers, children }) {
  return (
    <div style={{ overflowX: 'auto', marginTop: 8 }}>
      <table style={{ width: '100%', minWidth: 480, borderCollapse: 'collapse', fontSize: 12.5 }}>
        <thead>
          <tr>
            {headers.map((h) => (
              <th key={h} style={{ textAlign: 'left', padding: '6px 8px', borderBottom: '2px solid var(--line)', color: 'var(--ink-muted)', fontWeight: 600 }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

function TR({ c }) {
  return (
    <tr>
      {c.map((cell, i) => (
        <td key={i} style={{ padding: '8px', borderBottom: '1px solid var(--line)', verticalAlign: 'top' }}>{cell}</td>
      ))}
    </tr>
  );
}
