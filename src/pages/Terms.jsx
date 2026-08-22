import CollapsibleLegalHeader from '../components/CollapsibleLegalHeader';

export default function Terms() {
  return (
    <div style={{ paddingBottom: 90 }}>
      <CollapsibleLegalHeader title="Condiciones de uso y aviso de responsabilidad" updatedDate="23 de agosto de 2026" />

      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 22, fontSize: 14, lineHeight: 1.6, color: 'var(--ink)' }}>

        <Section title="1. Finalidad de MiniChef">
          <p>
            MiniChef es una herramienta destinada a ayudar a las familias a organizar y
            planificar la alimentación del hogar y, específicamente, a facilitar la consulta y
            planificación de recetas relacionadas con la alimentación infantil.
          </p>
          <p>La información proporcionada por MiniChef tiene carácter exclusivamente informativo y orientativo.</p>
        </Section>

        <Section title="2. La información no constituye consejo médico">
          <p>
            La información proporcionada por MiniChef sobre alimentos, recetas, ingredientes,
            cantidades, preparación, edades orientativas y características nutricionales no
            constituye diagnóstico, tratamiento, consejo médico ni recomendación sanitaria
            individualizada de ningún tipo.
          </p>
          <p>MiniChef no sustituye la valoración de un pediatra, médico, dietista-nutricionista u otro profesional sanitario cualificado.</p>
        </Section>

        <Section title="3. Cada bebé tiene circunstancias diferentes">
          <p>
            Las necesidades alimentarias de cada bebé pueden variar en función de su edad,
            desarrollo, estado de salud, alergias, intolerancias, antecedentes médicos y otras
            circunstancias individuales.
          </p>
          <p>
            Que un alimento, ingrediente o receta aparezca en MiniChef, o esté clasificado bajo un
            determinado rango de edad, no significa que sea automáticamente adecuado para todos
            los menores de esa edad ni garantiza que lo sea para un bebé concreto. Las edades
            indicadas son siempre orientativas y no sustituyen la valoración individual del menor
            por parte de su familia o de un profesional sanitario.
          </p>
          <p>
            El rango de edad de una receta es una etiqueta orientativa de organización del
            contenido, no el resultado de una evaluación individualizada de idoneidad ni de un
            criterio clínico validado para tu bebé concreto.
          </p>
        </Section>

        <Section title="4. Alergias e intolerancias">
          <p>Antes de ofrecer cualquier alimento al bebé, el usuario debe comprobar siempre:</p>
          <ul style={listStyle}>
            <li>Los ingredientes.</li>
            <li>Los alérgenos.</li>
            <li>Posibles trazas de fabricación.</li>
            <li>El etiquetado del producto concreto que vaya a usar (que puede diferir del ingrediente genérico de la receta).</li>
            <li>El riesgo de contaminación cruzada, cuando sea relevante.</li>
          </ul>
          <p>
            En caso de alergia, intolerancia, sospecha de reacción alérgica, enfermedad o
            cualquier otra circunstancia médica, el usuario deberá consultar previamente con un
            profesional sanitario.
          </p>
          <div style={{ fontSize: 13, color: '#9A5A20', background: 'var(--apricot-light)', padding: '10px 12px', borderRadius: 'var(--radius-sm)', lineHeight: 1.5 }}>
            ⚠️ La lista de alérgenos de cada receta es un cálculo automático a partir de sus
            ingredientes. <strong>No es una garantía de seguridad</strong> ni sustituye la
            comprobación del etiquetado del producto real que uses, ni de posibles trazas de
            fabricación.
          </div>
        </Section>

        <Section title="5. Atragantamiento y preparación">
          <p>
            El riesgo asociado a determinados alimentos no depende únicamente de sus
            ingredientes, sino también de:
          </p>
          <ul style={listStyle}>
            <li>El tamaño y la forma en que se corte o presente.</li>
            <li>La textura y consistencia.</li>
            <li>La preparación concreta.</li>
            <li>La capacidad de masticación y deglución del bebé.</li>
            <li>Su desarrollo individual, que no siempre corresponde exactamente a su edad en meses.</li>
          </ul>
          <p>
            Que una receta esté etiquetada para una edad orientativa no significa que todos los
            bebés de esa edad puedan consumirla igual de bien, ni que MiniChef pueda garantizar
            que sea segura para tu bebé en concreto. Esa valoración corresponde siempre a la
            persona responsable del menor, y a un profesional sanitario en caso de duda. El
            usuario deberá adaptar siempre la preparación a su bebé concreto y supervisarlo
            durante la ingesta.
          </p>
          <p>
            Los tiempos y métodos de preparación son orientativos y pueden variar según el
            utensilio, la cantidad o el punto de partida del ingrediente — comprueba siempre el
            punto de cocción antes de ofrecer el alimento.
          </p>
          <p>
            Las cantidades indicadas en las recetas son orientativas y pensadas como punto de
            partida general, no como una prescripción calculada para las necesidades
            nutricionales, el peso, el apetito o el ritmo de crecimiento de un bebé concreto. La
            cantidad real que ofrezcas debe ajustarse a las señales de hambre y saciedad de tu
            bebé, y a las indicaciones de su pediatra si las hay.
          </p>
        </Section>

        <Section title="6. Información nutricional y seguimiento">
          <p>
            La pantalla de Seguimiento de MiniChef refleja únicamente qué comidas has registrado
            como hechas y a qué grupos de alimentos generales pertenecen. No calcula calorías,
            nutrientes, ni nada relacionado con el crecimiento, y no evalúa si la alimentación de
            tu bebé es nutricionalmente suficiente o adecuada. No sustituye la valoración de un
            pediatra o dietista-nutricionista sobre la alimentación real de tu hijo.
          </p>
        </Section>

        <Section title="7. Productos comerciales">
          <p>MiniChef no muestra ni recomienda actualmente productos comerciales concretos (marcas, potitos, ni ningún otro producto de venta). Las recetas usan ingredientes genéricos (por ejemplo "calabacín" o "pechuga de pollo"), no productos de una marca determinada.</p>
        </Section>

        <Section title="8. Elaboración de las recetas">
          <p>
            Las recetas y contenidos de MiniChef son contenidos de carácter orientativo,
            redactados y curados durante el desarrollo de la aplicación. Durante su elaboración
            se han tenido en cuenta criterios generales de carácter orientativo sobre
            alimentación infantil y seguridad alimentaria (por ejemplo, evitar sal y azúcar añadidos, o introducir alérgenos comunes
            de forma progresiva), sin que esto implique una auditoría formal de seguridad
            alimentaria ni una certificación de ningún tipo. Ninguna receta de MiniChef ha sido
            revisada, evaluada ni validada por un profesional sanitario, ni de forma individual
            ni de forma colectiva.
          </p>
          <p>MiniChef no consulta fuentes externas en directo (ni APIs, ni scraping, ni bases de datos de terceros) para generar ni mostrar sus recetas: todo el contenido vive en la propia aplicación, no se genera bajo demanda.</p>
        </Section>

        <Section title="9. Fuentes utilizadas como referencia">
          <p>
            Durante el desarrollo de sus contenidos, MiniChef ha tenido en cuenta criterios y
            recomendaciones generales de carácter público relacionados con la alimentación
            infantil y la seguridad alimentaria.
          </p>
          <p>Esto no significa en ningún caso que:</p>
          <ul style={listStyle}>
            <li>Ninguna organización, sociedad científica o entidad sanitaria respalde MiniChef.</li>
            <li>Dichas organizaciones hayan validado, revisado o aprobado las recetas o el contenido de la aplicación.</li>
            <li>Exista una certificación, acreditación o aprobación oficial de MiniChef por parte de terceros.</li>
          </ul>
          <p style={{ fontSize: 12, color: 'var(--ink-muted)', fontStyle: 'italic' }}>
            MiniChef no cita actualmente fuentes concretas verificables receta por receta dentro
            de la aplicación — si en el futuro se documentan fuentes específicas de forma
            trazable, esta sección se actualizará para reflejarlo con precisión.
          </p>
        </Section>

        <Section title="10. Uso de inteligencia artificial">
          <p>
            MiniChef no utiliza actualmente inteligencia artificial en tiempo real para generar,
            adaptar o personalizar recetas mientras usas la aplicación: el contenido de las
            recetas es fijo y el mismo para todos los usuarios, no se genera bajo demanda ni varía
            de una persona a otra.
          </p>
          <p>Algunas herramientas de asistencia por IA se han usado como apoyo durante el desarrollo del contenido y del código de la aplicación, de la misma forma en que se usaría cualquier otra herramienta de desarrollo de software. Esto no implica que el contenido haya sido validado por un profesional sanitario, ni que una IA haya revisado individualmente cada receta desde un punto de vista médico o nutricional.</p>
        </Section>

        <Section title="11. Información, errores y actualizaciones">
          <p>
            MiniChef trata de mantener sus contenidos correctamente elaborados, pero no garantiza
            que toda la información esté permanentemente libre de errores, omisiones,
            imprecisiones o desactualizaciones. Los contenidos pueden modificarse, actualizarse o
            retirarse en cualquier momento.
          </p>
          <p>
            El usuario debe comprobar la información relevante antes de utilizarla, especialmente
            cuando pueda afectar a la salud o seguridad del menor. Si detectas algún error,
            puedes comunicárnoslo desde "💬 Ayúdanos a mejorar MiniChef" (ver sección 14).
          </p>
        </Section>

        <Section title="12. Contenido introducido por el usuario">
          <p>
            Determinadas funcionalidades de MiniChef permiten introducir contenido propio — por
            ejemplo, platos añadidos a mano al menú, o comentarios enviados a través del
            formulario de feedback.
          </p>
          <p>
            El usuario es responsable del contenido que introduzca. Evita incluir en estos campos
            información médica, sanitaria o personal del menor que no sea necesaria para el uso
            de esa funcionalidad concreta.
          </p>
        </Section>

        <Section title="13. Acceso, hogares e invitaciones">
          <p>
            El acceso a MiniChef requiere iniciar sesión con una cuenta de Google. Cada hogar
            tiene un código identificador de 6 caracteres, pero este código <strong>no es una
            contraseña ni un mecanismo de acceso por sí solo</strong>: sirve únicamente para
            identificar el hogar. La incorporación de una nueva persona a un hogar se realiza
            mediante una invitación enviada por email desde la propia aplicación, que la persona
            invitada debe aceptar iniciando sesión con la cuenta de Google correspondiente a ese
            mismo email.
          </p>
          <p>Para más detalle sobre qué datos se guardan en este proceso (email de la persona invitada, caducidad de la invitación, etc.), consulta la Política de Privacidad.</p>
        </Section>

        <Section title="14. Ayúdanos a mejorar MiniChef">
          <p>
            Desde "💬 Ayúdanos a mejorar MiniChef" puedes enviarnos errores, sugerencias,
            comentarios o valoraciones positivas sobre la aplicación. Esta información se utiliza
            para mejorar MiniChef, solucionar problemas y priorizar mejoras — no para publicidad.
          </p>
        </Section>

        <Section title="15. Responsabilidad del usuario">
          <p>El padre, madre, tutor o responsable del menor es quien debe tomar la decisión final sobre los alimentos que se ofrecen al niño, y es responsable de comprobar que una receta o alimento resulta adecuado para las circunstancias particulares del menor.</p>
          <p>MiniChef debe utilizarse como herramienta de apoyo y planificación, nunca como sustituto del criterio de un profesional sanitario.</p>
        </Section>

        <Section title="16. Limitación de responsabilidad">
          <p>
            En la medida permitida por la legislación aplicable, MiniChef y sus responsables no
            serán responsables de los daños o perjuicios derivados de decisiones tomadas por el
            usuario basándose exclusivamente en información orientativa proporcionada por la
            aplicación, especialmente cuando dicha información se haya utilizado en sustitución
            de la valoración de un profesional sanitario o sin realizar las comprobaciones
            necesarias sobre ingredientes, alérgenos, preparación, edad, desarrollo o
            circunstancias particulares del menor.
          </p>
          <p>Esta limitación no pretende excluir ni limitar aquellas responsabilidades que legalmente no puedan ser excluidas o limitadas conforme a la legislación aplicable.</p>
        </Section>

        <Section title="17. Uso responsable">
          <p>El usuario acepta utilizar MiniChef de forma responsable y comprobar la información relevante antes de ofrecer alimentos al menor. Si existe cualquier duda sobre la alimentación, salud, alergias, intolerancias, desarrollo o seguridad del menor, deberá consultar con un profesional sanitario.</p>
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
