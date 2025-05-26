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
Eres un nutricionista experto en fitness y salud. Te daré una propina de $20 si realizas bien tu trabajo.
Genera un menú semanal de 7 días, cada día con ${mealsPerDay} comidas.
Cada alimento debe llevar su cantidad en gramos (g), es *imprescindible* que seas preciso con los macronutrientes aunque te lleve más tiempo.
Minimiza grasas trans, saturadas y sal añadida.
Si la dieta es “${dietType}”:
  - "Omnívora": incluye todo tipo de alimentos.
  - "Vegetariana": sin ningún tipo de carnes, ni aves, ni pescados, ni pollo de ningún tipo.
  - "Vegana": sin ningún alimento de origen animal.
`.trim()
  };

  // 2. Prompt de usuario solicitando JSON limpio con la estructura deseada
  const userMessage = {
    role: 'user',
    content: `
Crea un menú con ${calories} kcal diarias,
distribuidas en macros: ${macros.carbs}% carbs, ${macros.fats}% grasas, ${macros.protein}% proteínas. Es importante que indiques los gramos de cada alimento.
Devuélvelo **solo** como JSON con la forma:
{
  "Lunes": ["Desayuno: 200g", "Media mañana: 100g", …],
  "Martes": [ … ],
  …,
  "Domingo": [ … ]
}
IMPORTANTE: devuélveme solo un JSON válido, sin texto adicional, sin code-fences ni comas finales. 
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

  // 6. Limpiar fences de Markdown y extraer sólo el JSON entre la primera { y la última }
  let jsonString = raw.trim();
  if (jsonString.startsWith('```')) {
    jsonString = jsonString
      .replace(/^```(?:json)?\r?\n/, '')
      .replace(/\r?\n```$/, '');
  }
  const start = jsonString.indexOf('{');
  const end   = jsonString.lastIndexOf('}');
  if (start === -1 || end === -1) {
    console.error('RAW:', raw);
    console.error('Sin fences:', jsonString);
    throw new Error('Formato inesperado: no detecto un objeto JSON');
  }
  jsonString = jsonString.slice(start, end + 1);

  // 6.1. Eliminar comas colgantes antes de } o ]
  jsonString = jsonString.replace(/,(\s*[}\]])/, '$1');

  // 6.2. Eliminar la letra “g” tras valores numéricos (250g → 250)
  jsonString = jsonString.replace(/(\d+)g\b/, '$1');


  // 7. Convertir a objeto JS
  try {
    return JSON.parse(jsonString);
  } catch (err) {
    console.error('RAW completo:', raw);
    console.error('JSON procesado:', jsonString);
    throw new Error('Error parsing JSON from OpenAI: ' + err.message);
  }

};