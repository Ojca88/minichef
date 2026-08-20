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
          Última actualización: 20 de agosto de 2026
        </p>
      </header>

      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 22, fontSize: 14, lineHeight: 1.6, color: 'var(--ink)' }}>

        <Section title="Quién trata tus datos">
          <p>
            MiniChef es una aplicación desarrollada de forma independiente por{' '}
            <strong>[PENDIENTE: tu nombre o el de tu entidad]</strong>. Para cualquier
            consulta sobre esta política o tus datos, puedes escribir a{' '}
            <strong>[PENDIENTE: tu email de contacto]</strong>.
          </p>
        </Section>

        <Section title="Cómo funciona el acceso a tus datos">
          <p>
            Al abrir MiniChef por primera vez, se crea automáticamente una sesión anónima
            (sin que tengas que hacer nada) que identifica tu dispositivo de forma técnica.
            Con esa sesión creas o te unes a un <strong>hogar</strong> — el espacio donde vive
            el menú, la lista de la compra y el seguimiento de tu familia.
          </p>
          <p>
            El <strong>código de invitación</strong> de 6 letras sirve únicamente para unirte
            a un hogar la primera vez — no es una contraseña de acceso continuo. Una vez dentro,
            el acceso de cada persona se controla en el servidor según a qué hogar pertenece
            realmente su sesión, no según quién conozca el código en cada momento. El propietario
            del hogar puede regenerar el código cuando quiera sin que los miembros existentes
            pierdan acceso.
          </p>
        </Section>

        <Section title="Qué datos guarda la app">
          <p>Asociados a tu hogar, se guardan:</p>
          <ul style={listStyle}>
            <li>El menú semanal/mensual que planificáis (qué recetas asignáis a cada día y comida).</li>
            <li>La lista de la compra.</li>
            <li>Qué comidas se marcan como "comidas de verdad" (seguimiento nutricional).</li>
            <li>El rango de edad aproximado del bebé (ej. "12-18 meses"). No se recoge el nombre, la foto ni ningún otro dato identificativo del menor, ni información sanitaria (alergias, diagnósticos, peso, etc.).</li>
            <li>La temporada elegida (invierno/verano), como preferencia del hogar.</li>
          </ul>
          <p>
            Cuando una acción se puede atribuir a una persona concreta (por ejemplo, quién marcó
            una comida o quién añadió un artículo a la compra), guardamos esa referencia — visible
            solo para los demás miembros de tu mismo hogar, nunca para nadie más.
          </p>
        </Section>

        <Section title="Si inicias sesión con Google (opcional)">
          <p>
            El login con Google es opcional: la app funciona igual sin él, con la sesión anónima
            automática descrita arriba. Si decides iniciar sesión, Google nos proporciona tu
            nombre, tu dirección de email y la foto de tu perfil. Usamos esto para:
          </p>
          <ul style={listStyle}>
            <li>Identificarte individualmente dentro de tu hogar (por ejemplo, para mostrar quién añadió cada cosa).</li>
            <li>Recordar automáticamente a qué hogar perteneces la próxima vez que inicies sesión, en cualquier dispositivo, sin volver a escribir el código.</li>
          </ul>
          <p>No accedemos a tus contactos, tu Gmail, tu Calendar ni tu Drive, ni usamos tu cuenta de Google para ningún otro fin.</p>
        </Section>

        <Section title="Con quién se comparten estos datos">
          <p>Los datos de tu hogar se guardan en <strong>Supabase</strong> (base de datos y autenticación), y la propia aplicación está alojada en <strong>Vercel</strong>. Ninguno de los dos accede a tus datos con fines propios: solo actúan como infraestructura técnica.</p>
          <p>
            El acceso a los datos de un hogar está restringido a nivel de servidor a las personas
            que realmente pertenecen a ese hogar (mediante reglas de seguridad de la base de
            datos, no solo por desconocimiento del código de invitación por parte de terceros).
          </p>
        </Section>

        <Section title="Analítica y publicidad">
          <p>MiniChef no usa herramientas de analítica ni de rastreo de terceros, y no muestra publicidad ni comparte datos con anunciantes.</p>
        </Section>

        <Section title="Cuánto tiempo se conservan los datos, y cómo eliminarlos">
          <p>
            Los datos de un hogar se conservan mientras exista. Cualquier miembro puede salir de
            un hogar cuando quiera desde "Mi hogar" dentro de la app, y el propietario puede
            eliminar el hogar por completo (borrando menú, compra y seguimiento de todos los
            miembros) desde la misma pantalla, con una confirmación explícita.
          </p>
          <p>
            Si quieres eliminar tu cuenta o tienes dudas sobre tus datos, escríbenos a{' '}
            <strong>[PENDIENTE: tu email de contacto]</strong>.
          </p>
        </Section>

        <Section title="Tus derechos">
          <p>
            Si resides en la Unión Europea, tienes derecho a acceder, rectificar, eliminar,
            limitar u oponerte al tratamiento de tus datos, y a la portabilidad de los mismos.
            Puedes ejercerlos escribiendo a <strong>[PENDIENTE: tu email de contacto]</strong>.
          </p>
        </Section>

        <Section title="Cambios en esta política">
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
