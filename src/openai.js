/**
 * handleGenerateMenu: genera un menú semanal usando la API de OpenAI.
 * @param {{
 *   calories: number,
 *   macros: { carbs: number, fats: number, protein: number },
 *   dietType: string,
 *   mealsPerDay: number
 * }} options
 * @param {string} apiKey    Clave secreta de OpenAI (env.DB en tu Worker).
 * @returns {Promise<object>} Devuelve un objeto JavaScript con el menú.
 */
export async function handleGenerateMenu(
  { calories, macros, dietType, mealsPerDay },
  apiKey
) {
  // 1. Montamos el prompt de sistema con todas las reglas
  const systemMessage = {
    role: 'system',
    content: `
Eres un nutricionista experto en fitness y salud.
Genera un menú semanal de 7 días, cada día con ${mealsPerDay} comidas.
Cada plato debe llevar su cantidad en gramos (g), excepto los vegetales “a más mejor”.
Solo cuantifica en gramos estos vegetales integrales:
  • Altos en proteína: soja (tofu, tempeh), legumbres.
  • Altos en grasa: frutos secos y derivados.
  • Altos en hidratos: tubérculos y frutas.
Minimiza grasas trans, saturadas y sal añadida.
Si la dieta es “${dietType}”:
  - Omnívora: incluye todo tipo de alimentos.
  - Vegetariana: sin carnes.
  - Vegana: sin ningún alimento de origen animal.
`.trim()
  };

  // 2. Prompt de usuario solicitando JSON limpio con la estructura deseada
  const userMessage = {
    role: 'user',
    content: `
Crea un menú con ${calories} kcal diarias,
distribuidas en macros: ${macros.carbs}% carbs, ${macros.fats}% grasas, ${macros.protein}% proteínas.
Devuélvelo **solo** como JSON con la forma:
{
  "Lunes": ["Desayuno: 200g", "Media mañana: 100g", …],
  "Martes": [ … ],
  …,
  "Domingo": [ … ]
}
`.trim()
  };

  // 3. Llamada a la API de OpenAI
  const resp = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [systemMessage, userMessage],
      temperature: 0.7
    })
  });

  // 4. Comprobación de error HTTP
  if (!resp.ok) {
    const errText = await resp.text().catch(() => resp.statusText);
    throw new Error(`OpenAI API error ${resp.status}: ${errText}`);
  }

  // 5. Parseo de JSON de respuesta
  const { choices } = await resp.json();
  const raw = choices?.[0]?.message?.content;
  if (!raw) {
    throw new Error('OpenAI API returned no content');
  }

  // 6. Limpiar posibles fences de Markdown
  let jsonString = raw.trim();
  if (jsonString.startsWith('```')) {
    jsonString = jsonString.replace(/^```(?:json)?\r?\n/, '').replace(/\r?\n```$/, '');
  }

  // 7. Convertir a objeto JS
  try {
    return JSON.parse(jsonString);
  } catch (err) {
    throw new Error('Error parsing JSON from OpenAI: ' + err.message);
  }
};