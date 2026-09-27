// دوال أساسية للتواصل مع Telegram Bot API

const API_BASE = "https://api.telegram.org/bot";

export function tg(env) {
  const base = `${API_BASE}${env.BOT_TOKEN}`;

  async function call(method, payload) {
    const res = await fetch(`${base}/${method}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!data.ok) {
      console.error("Telegram API error:", method, data);
    }
    return data;
  }

  return {
    sendMessage(chatId, text, extra = {}) {
      return call("sendMessage", {
        chat_id: chatId,
        text,
        parse_mode: "HTML",
        ...extra,
      });
    },
    sendAudio(chatId, audioUrl, extra = {}) {
      return call("sendAudio", { chat_id: chatId, audio: audioUrl, ...extra });
    },
    sendVoice(chatId, voiceUrl, extra = {}) {
      return call("sendVoice", { chat_id: chatId, voice: voiceUrl, ...extra });
    },
    answerCallbackQuery(id, text = "") {
      return call("answerCallbackQuery", { callback_query_id: id, text });
    },
    setWebhook(url, secretToken) {
      return call("setWebhook", { url, secret_token: secretToken });
    },
  };
}

// لوحة أزرار القائمة الرئيسية
export function mainMenuKeyboard() {
  return {
    keyboard: [
      ["🕌 مواقيت الصلاة", "📿 الأذكار"],
      ["📖 وردي اليومي", "🤝 الورد المشترك"],
      ["📻 راديو الحرمين", "🎧 القرآن الكريم"],
    ],
    resize_keyboard: true,
  };
}
