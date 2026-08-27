const ALERT_TIMEOUT_MS = 5_000;

async function postJson(url, body) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ALERT_TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`Alert provider returned ${response.status}`);
  } finally {
    clearTimeout(timeout);
  }
}

export async function sendContactAlerts({ name, email, subject, message }) {
  const summary = `New portfolio contact\nName: ${name}\nEmail: ${email}\nSubject: ${subject}\n\n${message.slice(0, 1_200)}`;
  const tasks = [];
  const discordWebhook = process.env.DISCORD_CONTACT_WEBHOOK_URL;
  if (discordWebhook) tasks.push(postJson(discordWebhook, { content: summary }));

  const telegramToken = process.env.TELEGRAM_BOT_TOKEN;
  const telegramChatId = process.env.TELEGRAM_CHAT_ID;
  if (telegramToken && telegramChatId) {
    tasks.push(postJson(
      `https://api.telegram.org/bot${encodeURIComponent(telegramToken)}/sendMessage`,
      { chat_id: telegramChatId, text: summary, disable_web_page_preview: true },
    ));
  }

  if (!tasks.length) return;
  const results = await Promise.allSettled(tasks);
  if (results.some((result) => result.status === "rejected")) {
    console.error("Contact alert delivery failed", { failedProviders: results.filter((result) => result.status === "rejected").length });
  }
}
