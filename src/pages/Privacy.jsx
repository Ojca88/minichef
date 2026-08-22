import { Link } from 'react-router-dom';
import CollapsibleLegalHeader from '../components/CollapsibleLegalHeader';

export default function Privacy() {
  return (
    <div style={{ paddingBottom: 90 }}>
      <CollapsibleLegalHeader title="Política de privacidad" updatedDate="23 de agosto de 2026" />

      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 22, fontSize: 14, lineHeight: 1.6, color: 'var(--ink)' }}>

        <Section title="1. Quién trata tus datos">
          <p>MiniChef es una aplicación desarrollada de forma independiente.</p>
          <p>
            A efectos de esta Política de Privacidad, el responsable del tratamiento de los
            datos personales tratados a través de MiniChef es <strong>MiniChef</strong>.
          </p>
          <p>
            Para cualquier consulta relacionada con esta política, el tratamiento de tus datos o
            el ejercicio de tus derechos, puedes contactar con MiniChef a través de:
          </p>
          <p><strong>Email de contacto:</strong> minicheforbabies@proton.me</p>
        </Section>

        <Section title="2. Cómo se accede a MiniChef">
          <p>
            MiniChef requiere iniciar sesión con una cuenta de Google para poder usarse — no
            existe ningún modo de uso anónimo ni sin cuenta. Al entrar por primera vez, se te
            pedirá crear un hogar nuevo o aceptar una invitación a uno existente (ver secciones 7-9).
          </p>
        </Section>

        <Section title="3. Datos de tu cuenta (Google)">
          <p>Al iniciar sesión con Google, MiniChef recibe y guarda únicamente:</p>
          <ul style={listStyle}>
            <li>Tu nombre.</li>
            <li>Tu dirección de email.</li>
            <li>La foto de tu perfil.</li>
          </ul>
          <p>
            No se solicita ningún permiso adicional (nada de Gmail, Calendar, Drive, contactos ni
            ningún otro servicio de Google) — verificado directamente en el código: la
            aplicación no pide ningún "scope" extra al conectar con Google, así que solo obtiene
            lo mínimo que Google entrega por defecto para identificarte.
          </p>
        </Section>

        <Section title="4. Datos del menor">
          <p>Asociados a tu hogar, se guarda sobre el bebé únicamente un rango de edad aproximado (ej. "12-18 meses"). No se recoge su nombre, foto, fecha de nacimiento exacta ni ningún dato sanitario.</p>
        </Section>

        <Section title="5. Datos del hogar">
          <p>Compartido entre todos los miembros del mismo hogar, MiniChef guarda:</p>
          <ul style={listStyle}>
            <li>El menú planificado (qué recetas asignáis a cada día y comida).</li>
            <li>La lista de la compra.</li>
            <li>El seguimiento de qué comidas se han hecho.</li>
            <li>La temporada elegida (invierno/verano), como preferencia del hogar.</li>
          </ul>
          <p>
            Cuando una acción se puede atribuir a una persona concreta (por ejemplo, quién marcó
            una comida o quién añadió un artículo a la compra), guardamos esa referencia —
            visible solo para los demás miembros de tu mismo hogar, nunca para nadie más. Esta
            referencia se elimina automáticamente si esa persona borra su cuenta (ver sección 17).
          </p>
          <p>MiniChef no usa herramientas de analítica ni de rastreo de terceros (revisado el código: no hay Google Analytics, Tag Manager, Meta Pixel, Sentry, PostHog, Hotjar, Mixpanel, ni ningún otro SDK de este tipo), y no muestra publicidad ni comparte datos con anunciantes.</p>
        </Section>

        <Section title="6. El código de hogar">
          <p>
            Cada hogar tiene un código identificador de 6 caracteres. Este código{' '}
            <strong>no es una contraseña ni un mecanismo de acceso</strong>: sirve únicamente
            para identificar tu hogar. Conocer el código, por sí solo, no permite a nadie
            entrar ni ver tus datos — el acceso real se concede exclusivamente mediante una
            invitación aceptada (ver sección 7). El propietario del hogar puede regenerar el
            código cuando quiera, sin que esto afecte a quienes ya pertenecen al hogar.
          </p>
          <p>
            Quien crea un hogar pasa a ser su <strong>propietario</strong>; quien se incorpora
            mediante una invitación aceptada es <strong>miembro</strong>. El propietario puede
            invitar, expulsar miembros, regenerar el código y eliminar el hogar; un miembro
            normal puede usar el hogar con normalidad pero no gestionar a las demás personas.
            Por diseño, <strong>cada cuenta solo puede pertenecer a un hogar a la vez</strong> —
            si ya perteneces a uno, no puedes incorporarte a otro sin salir antes del primero.
          </p>
        </Section>

        <Section title="7. Invitaciones por email">
          <p>
            Para añadir a alguien a tu hogar, el propietario introduce su dirección de email desde
            la app. Esto crea una invitación asociada a: el email introducido, quién invita, el
            hogar de destino, y una fecha de caducidad de <strong>48 horas</strong>. Si la
            persona invitada no la acepta a tiempo, la invitación caduca sola y deja de ser
            válida. El propietario también puede cancelarla manualmente en cualquier momento, o
            reenviarla — al reenviar, el enlace anterior deja de funcionar inmediatamente y se
            genera uno nuevo, con una nueva fecha de caducidad.
          </p>
        </Section>

        <Section title="8. El email de la persona invitada">
          <p>
            El email que introduces al invitar a alguien se guarda para poder enviarle la
            invitación y comprobar, cuando la acepte, que inicia sesión con la cuenta de Google
            correspondiente a ese mismo email — así nadie puede aceptar una invitación dirigida
            a otra persona. Este dato se conserva mientras la invitación esté pendiente; una vez
            aceptada, caducada o cancelada, deja de tener utilidad operativa para esa invitación
            concreta, aunque el registro pueda conservarse durante un tiempo con fines de
            seguridad (por ejemplo, para poder investigar un uso indebido del sistema de
            invitaciones).
          </p>
        </Section>

        <Section title="9. Tokens de invitación">
          <p>
            El enlace que recibe la persona invitada contiene un token aleatorio, largo y
            impredecible. MiniChef nunca guarda ese token en texto plano en la base de datos:
            guarda únicamente su huella criptográfica (hash), de forma que ni siquiera con
            acceso a la base de datos se podría reconstruir el enlace original. Cada invitación
            tiene su propio token, y aceptarla, cancelarla o que caduque lo invalida
            inmediatamente.
          </p>
        </Section>

        <Section title="10. Base jurídica del tratamiento">
          <p style={{ fontSize: 12, color: 'var(--ink-muted)', fontStyle: 'italic' }}>
            Esta tabla refleja una clasificación técnica orientativa a partir de cómo funciona
            realmente la aplicación, no un dictamen legal. Los puntos marcados como
            "PENDIENTE DE VALIDACIÓN LEGAL" requieren la revisión de un profesional antes de
            considerarse definitivos.
          </p>
          <TableWrap headers={['Finalidad', 'Datos utilizados', 'Base jurídica', '¿Obligatorio?']}>
            <TR c={['Prestar el servicio (login, menú, compra, seguimiento)', 'Cuenta de Google, datos del hogar', 'PENDIENTE DE VALIDACIÓN LEGAL (probablemente ejecución de una relación contractual/prestación del servicio solicitado, art. 6.1.b RGPD)', 'Sí, imprescindible para usar la app']} />
            <TR c={['Invitar a alguien a tu hogar', 'Email de la persona invitada, token de invitación', 'PENDIENTE DE VALIDACIÓN LEGAL (probablemente interés legítimo del hogar en incorporar miembros, art. 6.1.f)', 'No, solo si decides invitar a alguien']} />
            <TR c={['Atribuir dentro del hogar quién marcó o añadió algo', 'Nombre y foto', 'PENDIENTE DE VALIDACIÓN LEGAL (probablemente interés legítimo en la funcionalidad colaborativa, art. 6.1.f)', 'No es un dato aparte; es tu perfil de Google ya guardado']} />
            <TR c={['Conservación y borrado automático tras 2 años de inactividad', 'Fecha del último inicio de sesión (gestionada por Supabase Auth)', 'PENDIENTE DE VALIDACIÓN LEGAL (probablemente obligación derivada del principio de limitación del plazo de conservación, art. 5.1.e RGPD)', 'No es un dato que se pida, es automático de la infraestructura']} />
          </TableWrap>
        </Section>

        <Section title="11. Proveedores tecnológicos">
          <p>
            MiniChef utiliza determinados proveedores tecnológicos que pueden tratar datos
            personales en la medida necesaria para prestar los servicios de infraestructura,
            alojamiento, autenticación, almacenamiento o envío de email utilizados por la
            aplicación.
          </p>
          <TableWrap headers={['Proveedor', 'Servicio utilizado', 'Finalidad']}>
            <TR c={['Supabase', 'Base de datos (Postgres), autenticación (Google), sincronización en tiempo real, almacenamiento de capturas (Storage), funciones de servidor (Edge Functions)', 'Almacenar y sincronizar los datos del hogar, gestionar el inicio de sesión, guardar capturas adjuntas al feedback, y ejecutar de forma segura acciones que requieren privilegios especiales (borrado de cuenta, invitaciones, limpieza automática)']} />
            <TR c={['Vercel', 'Alojamiento y entrega de la aplicación web (hosting estático + CDN). MiniChef no ejecuta funciones de servidor en Vercel.', 'Servir la aplicación web a los usuarios']} />
            <TR c={['Resend', 'Envío de emails transaccionales (invitaciones a un hogar, y aviso al responsable de MiniChef cuando llega feedback nuevo)', 'Entregar esos emails a su destinatario']} />
          </TableWrap>
          <p style={{ fontSize: 12, color: 'var(--ink-muted)' }}>
            MiniChef no utiliza actualmente ningún servicio de inteligencia artificial de
            terceros que reciba o procese tus datos personales mientras usas la aplicación — las
            recetas son contenido fijo, no generado en tiempo real (más detalle en las{' '}
            <Link to="/condiciones" style={{ color: 'var(--sage-dark)' }}>Condiciones de uso</Link>).
          </p>
        </Section>

        <Section title="12. Capturas adjuntas al feedback">
          <p>
            Si adjuntas una imagen al enviar feedback, se guarda en un almacenamiento privado de
            Supabase (Storage), nunca con una URL pública permanente. Nadie puede acceder a esas
            imágenes directamente desde la app — ni siquiera tú mismo una vez enviadas — salvo el
            responsable de MiniChef, que puede consultarlas de forma segura para revisar tu
            comentario.
          </p>
        </Section>

        <Section title="13. Seguridad">
          <p>
            El acceso a los datos de cada hogar está protegido a nivel de base de datos (Row
            Level Security de Supabase): un usuario solo puede leer o modificar los datos de los
            hogares a los que realmente pertenece, comprobado en el servidor en cada petición.
          </p>
          <p>
            Las operaciones especialmente sensibles (borrar una cuenta, enviar invitaciones,
            aceptar una invitación, la limpieza automática por inactividad) se ejecutan en
            funciones de servidor independientes, con permisos elevados que nunca están
            expuestos ni accesibles desde el navegador.
          </p>
        </Section>

        <Section title="14. Transferencias internacionales de datos">
          <p>Varios de los proveedores que utiliza MiniChef son empresas con sede en Estados Unidos, lo que puede implicar transferencias internacionales de datos:</p>
          <ul style={listStyle}>
            <li>
              <strong>Supabase</strong>: la base de datos de MiniChef está alojada en la región
              de Fráncfort (UE) — pero el soporte técnico y determinados subencargados de
              Supabase pueden tratar datos fuera del Espacio Económico Europeo. Supabase ofrece
              un Acuerdo de Tratamiento de Datos (DPA) y usa Cláusulas Contractuales Tipo para
              estos casos.
            </li>
            <li>
              <strong>Vercel</strong>: aunque MiniChef solo usa alojamiento estático (sin
              funciones de servidor en Vercel), el plano de control, el soporte y los datos de
              cuenta de Vercel se procesan en Estados Unidos. Vercel se apoya en Cláusulas
              Contractuales Tipo y en el marco EU-US Data Privacy Framework.
            </li>
            <li>
              <strong>Resend</strong>: según su propia documentación pública, Resend almacena
              los datos de sus clientes en Estados Unidos, y su Acuerdo de Tratamiento de Datos
              incluye Cláusulas Contractuales Tipo para la exportación de datos desde la UE a
              EE.UU. Esto significa que el email de cualquier persona a la que invites queda
              sujeto a esta transferencia.
            </li>
          </ul>
        </Section>

        <Section title="15. Conservación de los datos">
          <p>
            Los datos de un hogar se conservan mientras el hogar exista y tenga al menos un
            miembro. Los datos ligados a tu cuenta individual (nombre, foto, email, a qué hogar
            perteneces) se conservan mientras uses tu cuenta.
          </p>
          <p>
            <strong>Las cuentas de Google que permanezcan inactivas durante un periodo de 2 años
            podrán ser eliminadas automáticamente</strong>, junto con los datos personales
            asociados exclusivamente a dichas cuentas, según se describe en la sección siguiente.
          </p>
        </Section>

        <Section title="16. Eliminación automática tras 2 años de inactividad">
          <p>
            MiniChef ejecuta periódicamente un proceso automático que identifica cuentas que no
            han iniciado sesión en los últimos 2 años (a partir de la fecha de último inicio de
            sesión que gestiona la propia infraestructura de autenticación de Supabase). Para
            cada cuenta inactiva:
          </p>
          <ul style={listStyle}>
            <li>Se elimina la cuenta de autenticación y el perfil asociado (nombre, email, foto).</li>
            <li>Si esa persona era la única integrante de un hogar, se elimina también ese hogar y todos sus datos.</li>
            <li>Si el hogar tiene más miembros, este simplemente deja de pertenecer a él — el hogar y los datos del resto de miembros se conservan intactos. Si era el propietario, la propiedad pasa automáticamente al miembro más antiguo del hogar.</li>
            <li>Su nombre y foto se eliminan de cualquier registro de "quién marcó esto" que quedara dentro de hogares que siguen existiendo.</li>
          </ul>
          <p>
            <strong>Limitación conocida:</strong> MiniChef no dispone actualmente de un sistema de
            envío de emails de aviso previo antes de esta eliminación automática. Lo documentamos
            aquí de forma transparente en vez de simular una funcionalidad que no existe.
          </p>
        </Section>

        <Section title="17. Baja voluntaria de la cuenta">
          <p>
            Puedes solicitar la eliminación de tu cuenta en cualquier momento desde el icono de
            perfil en Inicio → "Mi cuenta" → "Eliminar mi cuenta". Se te pedirá escribir
            "ELIMINAR" para confirmar — no se puede borrar por accidente con un solo clic.
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

        <Section title="18. Feedback y comentarios">
          <p>
            Desde "💬 Ayúdanos a mejorar MiniChef" puedes enviarnos voluntariamente comentarios,
            sugerencias, reportes de errores o valoraciones positivas. Cuando lo haces, guardamos:
          </p>
          <ul style={listStyle}>
            <li>El texto de tu comentario (y, si reportas un error, lo que estabas haciendo, qué esperabas y qué ocurrió, si lo indicas).</li>
            <li>Una imagen adjunta, si decides añadirla (ver sección 12).</li>
            <li>Tu nombre, email y a qué hogar perteneces en ese momento, para poder contactarte si hace falta.</li>
            <li>Información técnica básica (tipo de dispositivo, navegador, la pantalla desde la que enviaste el comentario) para poder investigar mejor los problemas.</li>
          </ul>
          <p>
            Usamos esto únicamente para recibir tu opinión, mejorar MiniChef, investigar errores,
            priorizar mejoras y contactarte si es necesario — nunca para publicidad. Una vez
            enviado, el comentario no es visible ni editable ni siquiera para ti mismo desde la
            app: es un canal de un solo sentido hacia el responsable de MiniChef. Hay un límite de
            10 comentarios al día por persona, para evitar el uso abusivo del formulario.
          </p>
        </Section>

        <Section title="19. Tus derechos">
          <p>
            Si resides en la Unión Europea, tienes derecho a acceder, rectificar, eliminar,
            limitar u oponerte al tratamiento de tus datos, y a la portabilidad de los mismos.
            Puedes ejercerlos escribiendo a <strong>minicheforbabies@proton.me</strong>,
            o directamente desde la app en el caso de la eliminación de tu cuenta (sección 17).
          </p>
        </Section>

        <Section title="20. Reclamaciones ante la autoridad de control">
          <p>
            Si consideras que el tratamiento de tus datos no se ajusta a la normativa, puedes
            presentar una reclamación ante la Agencia Española de Protección de Datos (AEPD) si
            resides en España, o ante la autoridad de protección de datos de tu país de
            residencia dentro de la Unión Europea.
          </p>
        </Section>

        <Section title="21. Cambios en esta política">
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
