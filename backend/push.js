// backend/push.js
// Node 18+ já tem fetch global
async function sendPush(expoPushToken, title, body) {
  try {
    if (!expoPushToken) return;
    await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to: expoPushToken, title, body }),
    });
  } catch (e) {
    console.warn('🔔 Falha a enviar push:', e.message);
  }
}

module.exports = { sendPush };


