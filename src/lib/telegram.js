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
      console.error("Telegram API error:", method, JSON.stringify(data));
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
    editMessageText(chatId, messageId, text, extra = {}) {
      return call("editMessageText", {
        chat_id: chatId,
        message_id: messageId,
        text,
        parse_mode: "HTML",
        ...extra,
      });
    },
    sendAudio(chatId, audioUrl, extra = {}) {
      return call("sendAudio", { chat_id: chatId, audio: audioUrl, ...extra });
    },
    answerCallbackQuery(id, text = "", showAlert = false) {
      return call("answerCallbackQuery", {
        callback_query_id: id,
        text,
        show_alert: showAlert,
      });
    },
    setWebhook(url, secretToken) {
      return call("setWebhook", { url, secret_token: secretToken });
    },
  };
}

// أزرار Inline (تعمل كـ callback_query، ما تحتاج المستخدم يكتب شي)
export function inlineKeyboard(rows) {
  return { inline_keyboard: rows };
}

export const MAIN_MENU_ROWS = [
  [
    { text: "🕌 مواقيت الصلاة", callback_data: "prayer" },
    { text: "📿 الأذكار", callback_data: "adhkar_menu" },
  ],
  [
    { text: "📖 وردي اليومي", callback_data: "wird_status" },
    { text: "🤝 الورد المشترك", callback_data: "wird_pair_menu" },
  ],
  [
    { text: "📻 راديو الحرمين", callback_data: "radio_menu" },
    { text: "🎧 القرآن الكريم", callback_data: "quran_page_0" },
  ],
];

export function mainMenuKeyboard() {
  return inlineKeyboard(MAIN_MENU_ROWS);
}

export function backButton(callbackData = "main") {
  return [{ text: "⬅️ رجوع للقائمة", callback_data: callbackData }];
}
