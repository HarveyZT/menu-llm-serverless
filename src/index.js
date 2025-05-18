import { handleGenerateMenu } from './openai.js';
import { sendToSheets } from './sheets.js';

export default {
  async fetch(request, env) {
    if (request.method === 'POST' && new URL(request.url).pathname === '/generate-menu') {
      const { calories, macros, sheetUrl } = await request.json();
      // 1. Genera menú con OpenAI
      const menu = await handleGenerateMenu({ calories, macros }, env.OPENAI_KEY);
      // 2. Envía a Google Sheets
      await sendToSheets(env.SHEETS_WEBHOOK, menu, sheetUrl);
      return new Response(JSON.stringify(menu), { status: 200 });
    }
    return new Response('Not found', { status: 404 });
  }
}
