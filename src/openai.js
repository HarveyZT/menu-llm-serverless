/**
 * handleGenerateMenu: genera un menú semanal usando la API de OpenAI.
 * @param {{ calories: number, macros: { carbs: number, fats: number, protein: number }}} options
 * @param {string} options.calories - Calorías diarias deseadas.
 * @param {object} options.macros - Distribución de macronutrientes en %.
 * @param {string} apiKey - Clave secreta de OpenAI accesible via env.
 * @returns {Promise<object>} Devuelve un objeto JavaScript con el menú.
 */
export async function handleGenerateMenu({ calories, macros }, apiKey) {
  // Preparamos la petición a OpenAI
  const resp = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',      // Modelo a usar
      messages: [
        // Mensaje de sistema: instrucciones generales para el LLM
        {
          role: 'system',
          content: `Eres un nutricionista experto con experiencia en fitness y salud. ` +
                   `Minimiza grasas trans y saturadas y sal añadida. ` +
                   `Solo considera vegetales altos en proteína y tubérculos; otros vegetales de uso libre.`
        },
        // Mensaje de usuario: parámetros concretos del menú
        {
          role: 'user',
          content: `Crea un menú semanal de 7 días con ${calories} calorías diarias, ` +
                   `distribuidas en macros: ${macros.carbs}% carbohidratos, ` +
                   `${macros.fats}% grasas, ${macros.protein}% proteínas. ` +
                   `Devuélvelo como JSON con la forma { "Lunes": ["plato1", ...], ..., "Domingo": [...] }.`
        }
      ]
    })
  });

  // Comprobamos que la petición fue exitosa
  if (!resp.ok) {
    const errText = await resp.text().catch(() => resp.statusText);
    throw new Error(`OpenAI API error ${resp.status}: ${errText}`);
  }

  // Parseamos la respuesta JSON
  const data = await resp.json();

  // Extraemos el contenido generado
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('OpenAI API returned no content');
  }

  // Limpieza de posibles code fences de Markdown
  let jsonString = content.trim();
  if (jsonString.startsWith('```')) {
    // Eliminamos el primer code fence con optional 'json'
    jsonString = jsonString.replace(/^```(?:json)?\r?\n/, '');
    // Eliminamos el code fence de cierre
    jsonString = jsonString.replace(/\r?\n```$/, '');
  }

  // Convertimos la cadena JSON a objeto JavaScript
  let menu;
  try {
    menu = JSON.parse(jsonString);
  } catch (err) {
    throw new Error('Error parsing JSON from OpenAI: ' + err.message);
  }

  return menu;
}

