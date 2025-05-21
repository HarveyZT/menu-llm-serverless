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
  - Omnívora: incluye todo tipo de alimentos.
  - Vegetariana: sin carnes ni pescados.
  - Vegana: sin ningún alimento de origen animal.
`.trim()
  };

    // 2. Ejemplo de un día
  const exampleMessage = {
    role: 'user',
    content: `
Ejemplo para 2000 kcal, macros 50% carbs / 30% grasa / 20% proteína, 3 comidas:
{
  "Lunes": [
    "Desayuno: Avena 80 g (312 kcal, 52 c, 5.6 g grasa, 13.6 g prot)",
    "Comida: Pechuga de pollo 150 g + Arroz integral 100 g (456 kcal, 23 c, 8.5 g grasa, 49 g prot)",
    "Cena: Brócoli 200 g + Almendras 30 g (219 kcal, 21 c, 15.4 g grasa, 17.4 g prot)",
    "_totales": { "kcal": 987, "carbs": 96, "fats": 29.5, "protein": 80 },
    "error": "–50.35%"
  ]
}
`.trim()
  };

  // 3. Prompt de usuario solicitando JSON limpio con la estructura deseada
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
Al final de cada día añade:
"_totales": { kcal: XXX, carbs: XX, fats: XX, protein: XX }, 
"error": YY%  
`.trim()
  };

  // 4. Llamada a la API de OpenAI
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

  // 5. Comprobación de error HTTP
  if (!resp.ok) {
    const errText = await resp.text().catch(() => resp.statusText);
    throw new Error(`OpenAI API error ${resp.status}: ${errText}`);
  }

  // 6. Parseo de JSON de respuesta
  const { choices } = await resp.json();
  const raw = choices?.[0]?.message?.content;
  if (!raw) {
    throw new Error('OpenAI API returned no content');
  }

  // 7. Limpiar posibles fences de Markdown
  let jsonString = raw.trim();
  if (jsonString.startsWith('```')) {
    jsonString = jsonString.replace(/^```(?:json)?\r?\n/, '').replace(/\r?\n```$/, '');
  }

  // 8. Convertir a objeto JS
  try {
    return JSON.parse(jsonString);
  } catch (err) {
    throw new Error('Error parsing JSON from OpenAI: ' + err.message);
  }
};