export async function handleGenerateMenu({ calories, macros }, apiKey) {
  const resp = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'Eres un nutricionista experto.' },
        { role: 'user', content: `
        Crea un menú semanal de 7 días con ${calories} calorías diarias,
        distribuidas en macros: ${macros.carbs}% carbohidratos, ${macros.fats}% grasas, ${macros.protein}% proteínas.
        Devuélvelo como JSON de la forma { dia: [...platos] }.
        ` }
      ]
    })
  });
  const data = await resp.json();
  return JSON.parse(data.choices[0].message.content);
}
