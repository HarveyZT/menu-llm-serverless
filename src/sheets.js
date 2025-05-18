export async function sendTelegram(token, chatId, items) {
  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({
      chat_id: chatId,
      text: 'Tu menú semanal:\n' + items.map(d => `- ${d}`).join('\n')
    })
  });
}
