import OpenAI from 'openai';

export async function handleGenerateMenu({ userId }, DB) {
  const { results } = await DB.prepare(`SELECT preferences FROM users WHERE id = ?`)
    .bind(userId).all();
  const prefs = JSON.parse(results[0].preferences);

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'Genera un menú semanal...' },
      { role: 'user', content: JSON.stringify(prefs) }
    ]
  });

  const items = JSON.parse(completion.choices[0].message.content);
  return { id: crypto.randomUUID(), date: new Date().toISOString().slice(0,10), items };
}
