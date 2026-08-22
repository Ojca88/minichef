import CollapsibleLegalHeader from '../components/CollapsibleLegalHeader';

export default function Terms() {
  return (
    <div style={{ paddingBottom: 90 }}>
      <CollapsibleLegalHeader title="Condiciones de uso y aviso de responsabilidad" updatedDate="21 de agosto de 2026" />

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
            constituye consejo médico, diagnóstico, tratamiento ni recomendación sanitaria
            individualizada.
          </p>
          <p>MiniChef no sustituye la valoración de un pediatra, médico, dietista-nutricionista u otro profesional sanitario cualificado.</p>
        </Section>

        <Section title="3. Cada bebé tiene circunstancias diferentes">
          <p>
            Las necesidades alimentarias de cada bebé pueden variar en función de su edad,
            desarrollo, estado de salud, alergias, intolerancias, antecedentes médicos y otras
            circunstancias individuales.
          </p>
          <p>Que un alimento o receta aparezca en MiniChef no significa que sea adecuado para todos los bebés ni garantiza que lo sea para un bebé concreto. El usuario debe valorar siempre las circunstancias particulares del menor.</p>
        </Section>

        <Section title="4. Alergias e intolerancias">
          <p>Antes de ofrecer cualquier alimento al bebé, el usuario debe comprobar ingredientes, alérgenos, posibles trazas y la adecuación a las circunstancias particulares del menor.</p>
          <p>
            En caso de alergia, intolerancia, sospecha de reacción alérgica, enfermedad o
            cualquier otra circunstancia médica, el usuario deberá consultar previamente con un
            profesional sanitario.
          </p>
          <p>Cada receta de MiniChef indica los alérgenos que sus propios ingredientes contienen, calculados automáticamente a partir de esos ingredientes — no de un análisis del producto final ni de posibles trazas de fabricación. Esta información no debe interpretarse como una garantía de ausencia de alérgenos.</p>
        </Section>

        <Section title="5. Atragantamiento y preparación">
          <p>El riesgo asociado a determinados alimentos no depende únicamente de sus ingredientes: la textura, tamaño, forma, consistencia y preparación también son relevantes para la seguridad del bebé.</p>
          <p>El usuario deberá adaptar siempre la preparación a la edad, desarrollo y capacidades del menor, y supervisarlo durante la ingesta. Ante cualquier duda, consulta con un profesional sanitario.</p>
        </Section>

        <Section title="6. Productos comerciales">
          <p>MiniChef no muestra ni recomienda actualmente productos comerciales concretos (marcas, potitos, ni ningún otro producto de venta). Las recetas usan ingredientes genéricos (por ejemplo "calabacín" o "pechuga de pollo"), no productos de una marca determinada.</p>
        </Section>

        <Section title="7. Elaboración de las recetas">
          <p>
            Las recetas de MiniChef son contenido redactado y curado durante el desarrollo de la
            aplicación, con criterios de seguridad alimentaria infantil de referencia general
            (por ejemplo, evitar sal y azúcar añadidos, texturas apropiadas por edad, e
            introducción progresiva de alérgenos comunes). No proceden de una fuente sanitaria
            oficial concreta consultada en tiempo real ni de una base de datos nutricional
            externa, y no han sido revisadas individualmente por un profesional sanitario.
          </p>
          <p>MiniChef no consulta fuentes externas en directo (ni APIs, ni scraping, ni bases de datos de terceros) para generar ni mostrar sus recetas: todo el contenido vive en la propia aplicación.</p>
        </Section>

        <Section title="8. Uso de inteligencia artificial">
          <p>
            MiniChef no utiliza actualmente inteligencia artificial en tiempo real para generar,
            adaptar o personalizar recetas mientras usas la aplicación: el contenido de las
            recetas es fijo y el mismo para todos los usuarios, no se genera bajo demanda.
          </p>
          <p>Algunas herramientas de asistencia por IA se han usado como apoyo durante el desarrollo del contenido y del código de la aplicación, de la misma forma en que se usaría cualquier otra herramienta de desarrollo de software — esto no implica que el contenido haya sido validado por un profesional sanitario.</p>
        </Section>

        <Section title="9. Responsabilidad del usuario">
          <p>El padre, madre, tutor o responsable del menor es quien debe tomar la decisión final sobre los alimentos que se ofrecen al niño, y es responsable de comprobar que una receta o alimento resulta adecuado para las circunstancias particulares del menor.</p>
          <p>MiniChef debe utilizarse como herramienta de apoyo y planificación, nunca como sustituto del criterio de un profesional sanitario.</p>
        </Section>

        <Section title="10. Limitación de responsabilidad">
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

        <Section title="11. Uso responsable">
          <p>El usuario acepta utilizar MiniChef de forma responsable y comprobar la información relevante antes de ofrecer alimentos al menor. Si existe cualquier duda sobre la alimentación, salud, alergias, intolerancias, desarrollo o seguridad del menor, deberá consultar con un profesional sanitario.</p>
        </Section>

      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <section>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600, marginBottom: 8 }}>{title}</h2>
      {children}
    </section>
  );
}
