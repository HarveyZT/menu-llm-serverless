/**
 * sendToSheets: envía el menú al Webhook de Google Apps Script para volcar datos en Google Sheets.
 *
 * @param {string} webhookUrl - URL pública del Apps Script (doPost).
 * @param {object} menu - Objeto con la estructura del menú, p.ej.
 *                        { "Lunes": ["plato1", "plato2"], ... }
 * @returns {Promise<string>} - Respuesta del webhook (texto plano o JSON).
 * @throws {Error} - Si la petición falla o el webhook devuelve un estado no OK.
 */
export async function sendToSheets(webhookUrl, menu) {
  // Validación básica de parámetros
  if (!webhookUrl) {
    throw new Error('sendToSheets: falta la URL del webhook.');
  }
  if (typeof menu !== 'object') {
    throw new Error('sendToSheets: el menú debe ser un objeto.');
  }

  // Realizamos la petición POST
  const resp = await fetch(webhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ menu })
  });

  // Comprobamos que la petición fue exitosa
  if (!resp.ok) {
    const text = await resp.text().catch(() => '');
    throw new Error(`Sheets webhook error ${resp.status}: ${text}`);
  }

  // Devolvemos el contenido de la respuesta para debug o confirmación
  return await resp.text();
}