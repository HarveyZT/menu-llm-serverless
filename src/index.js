import { handleGenerateMenu } from './openai.js';
import { sendTelegram } from './telegram.js';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/generate-menu' && request.method === 'POST') {
      const { userId, chatId } = await request.json();
      const menu = await handleGenerateMenu({ userId }, env.DB);
      await env.DB.prepare(
        `INSERT INTO menus (id, user_id, menu_date, content) VALUES (?, ?, ?, ?)`
      )
      .bind(menu.id, userId, menu.date, JSON.stringify(menu.items))
      .run();
      await sendTelegram(env.TELEGRAM_TOKEN, chatId, menu.items);
      return new Response(JSON.stringify(menu), { status: 200 });
    }
    return new Response('Not found', { status: 404 });
  }
};
