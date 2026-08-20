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
          Última actualización: 18 de agosto de 2026
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

        <Section title="Qué datos guarda la app">
          <p>Cuando usas MiniChef, se guardan estos datos, asociados a un código de hogar de 6 letras (no a tu identidad, salvo que inicies sesión con Google):</p>
          <ul style={listStyle}>
            <li>El menú semanal/mensual que planificas (qué recetas asignas a cada día y comida).</li>
            <li>La lista de la compra que crees.</li>
            <li>Qué comidas marcas como "comidas de verdad" (seguimiento nutricional).</li>
            <li>El rango de edad aproximado del bebé que indiques (ej. "12-18 meses"). No se recoge el nombre, la foto ni ningún otro dato identificativo del menor.</li>
            <li>La temporada elegida (invierno/verano), como preferencia de la app.</li>
          </ul>
        </Section>

        <Section title="Si inicias sesión con Google (opcional)">
          <p>
            El login con Google es opcional: la app funciona igual sin él, usando solo el
            código de 6 letras. Si decides iniciar sesión, Google nos proporciona tu nombre,
            tu dirección de email y la foto de tu perfil. Usamos esto para:
          </p>
          <ul style={listStyle}>
            <li>Recordar automáticamente a qué hogar perteneces, sin que tengas que escribir el código cada vez.</li>
            <li>Mostrar quién de tu hogar marcó cada comida o añadió cada artículo a la compra.</li>
          </ul>
          <p>No usamos tu cuenta de Google para ningún otro fin, ni la compartimos con nadie fuera de tu propio hogar.</p>
        </Section>

        <Section title="Con quién se comparten estos datos">
          <p>Los datos de tu hogar se guardan en <strong>Supabase</strong> (base de datos y, si usas login, autenticación), y la propia aplicación está alojada en <strong>Vercel</strong>. Ninguno de los dos accede a tus datos con fines propios: solo actúan como infraestructura técnica.</p>
          <p>
            <strong>Importante sobre el código de hogar:</strong> cualquier persona que conozca
            tu código de 6 letras puede ver y modificar los datos de ese hogar — es el mismo
            modelo de confianza que compartir un PIN. No hay un sistema de permisos por
            persona más allá de eso, salvo la atribución de "quién marcó qué" si has iniciado
            sesión con Google.
          </p>
        </Section>

        <Section title="Analítica y publicidad">
          <p>MiniChef no usa herramientas de analítica ni de rastreo de terceros, y no muestra publicidad ni comparte datos con anunciantes.</p>
        </Section>

        <Section title="Cuánto tiempo se conservan los datos">
          <p>Los datos de tu hogar se conservan mientras uses la app. Si quieres eliminarlos por completo, escríbenos a <strong>[PENDIENTE: tu email de contacto]</strong> indicando tu código de hogar (o tu cuenta de Google, si la usaste) y los borraremos de la base de datos.</p>
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
