// Importar la función que genera el menú usando OpenAI
import { handleGenerateMenu } from './openai.js';
// Importar la función que envía el menú a Google Sheets
import { sendToSheets } from './sheets.js';

// Cabeceras CORS para permitir peticiones desde el frontend
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type', 
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Preflight CORS: responder OPTIONS para permitir la petición
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: CORS_HEADERS,
      });
    }

    // Generación de menú y envío a Google Sheets
    if (request.method === 'POST' && url.pathname === '/generate-menu') {
      try {
        // Extraemos calorías, macros y la URL del Google Sheets del cuerpo
        const { calories, macros, sheetUrl, dietType, mealsPerDay } = await request.json();

        // 1. Generamos el menú usando OpenAI
        const menu = await handleGenerateMenu({ calories, macros, dietType, mealsPerDay }, env.OPENAI_KEY);

        // 2. Enviamos el menú a Google Sheets (Apps Script Webhook)
        await sendToSheets(env.SHEETS_WEBHOOK, menu, sheetUrl);

        // 3. Devolvemos el menú generado como JSON
        return new Response(JSON.stringify(menu), {
          status: 200,
          headers: {
            ...CORS_HEADERS,
            'Content-Type': 'application/json',
          },
        });

      } catch (err) {
        // En caso de error, devolvemos un 500 con el mensaje de error
        return new Response(err.message, {
          status: 500,
          headers: CORS_HEADERS,
        });
      }
    }

    // Fallback para rutas no encontradas
    return new Response('Not found', {
      status: 404,
      headers: CORS_HEADERS,
    });
  }
};
