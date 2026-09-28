import { tg, mainMenuKeyboard, inlineKeyboard, backButton } from "./lib/telegram.js";
import { firestore } from "./lib/firestore.js";
import { prayerTimesMessage, prayerBackKeyboard } from "./features/prayerTimes.js";
import { adhkarMessage, adhkarMenuKeyboard, adhkarBackKeyboard } from "./features/adhkar.js";
import { radioMenuMessage, radioMenuKeyboard, RADIO_STATIONS } from "./features/radio.js";
import {
  surahListKeyboard,
  surahListMessage,
  surahOptionsKeyboard,
  surahOptionsMessage,
  getSurahText,
  getSurahAudioUrl,
} from "./features/quran.js";
import {
  getOrCreateUser,
  setDailyTarget,
  markWirdDone,
  pairWithPartner,
  unpair,
  wirdStatusMessage,
  wirdStatusKeyboard,
  wirdTargetKeyboard,
  pairMenuMessage,
  pairMenuKeyboard,
} from "./features/quranWird.js";

export default {
  async fetch(request, env, ctx) {
    if (request.method !== "POST") {
      return new Response("Deen Bot is running ✅", { status: 200 });
    }

    const secret = request.headers.get("X-Telegram-Bot-Api-Secret-Token");
    if (env.WEBHOOK_SECRET && secret !== env.WEBHOOK_SECRET) {
      return new Response("Unauthorized", { status: 401 });
    }

    const update = await request.json();
    ctx.waitUntil(handleUpdate(update, env));
    return new Response("ok");
  },

  async scheduled(event, env, ctx) {
    ctx.waitUntil(handleScheduled(event, env));
  },
};

async function handleUpdate(update, env) {
  const bot = tg(env);
  const db = firestore(env);

  if (update.callback_query) {
    await handleCallback(update.callback_query, bot, db, env);
    return;
  }

  const msg = update.message;
  if (!msg || !msg.text) return;

  const chatId = msg.chat.id;
  const text = msg.text.trim();

  await getOrCreateUser(db, chatId);

  if (text.startsWith("/start")) {
    const payload = text.replace("/start", "").trim();

    // ربط تلقائي عبر رابط الدعوة: /start pair_<partnerChatId>
    if (payload.startsWith("pair_")) {
      const partnerChatId = payload.replace("pair_", "");
      const result = await pairWithPartner(db, chatId, partnerChatId);
      if (result.error) {
        await bot.sendMessage(chatId, "❌ " + result.error, {
          reply_markup: mainMenuKeyboard(),
        });
      } else {
        await bot.sendMessage(chatId, "✅ تم الربط! صرتوا فريق ورد واحد 🤝", {
          reply_markup: mainMenuKeyboard(),
        });
        await bot.sendMessage(
          result.partnerChatId,
          "✅ حد قبل دعوتك وصرتوا فريق ورد واحد 🤝"
        );
      }
      return;
    }

    await bot.sendMessage(chatId, "🕌 أهلًا بك في بوت الدين!\n\nاختر من القائمة:", {
      reply_markup: mainMenuKeyboard(),
    });
    return;
  }

  // أي نص ثاني: نرجعه للقائمة (كل شي أزرار الحين)
  await bot.sendMessage(chatId, "استخدم الأزرار تحت 👇", {
    reply_markup: mainMenuKeyboard(),
  });
}

async function handleCallback(cb, bot, db, env) {
  const chatId = cb.message.chat.id;
  const messageId = cb.message.message_id;
  const data = cb.data;

  await bot.answerCallbackQuery(cb.id); // إيقاف علامة التحميل بزر تليجرام

  const edit = (text, keyboard) =>
    bot.editMessageText(chatId, messageId, text, { reply_markup: keyboard });

  // القائمة الرئيسية
  if (data === "main") {
    await edit("🕌 القائمة الرئيسية:", mainMenuKeyboard());
    return;
  }

  // مواقيت الصلاة
  if (data === "prayer") {
    const message = await prayerTimesMessage(env.DEFAULT_CITY, env.DEFAULT_COUNTRY);
    await edit(message, prayerBackKeyboard());
    return;
  }

  // الأذكار
  if (data === "adhkar_menu") {
    await edit("📿 اختر:", adhkarMenuKeyboard());
    return;
  }
  if (data === "adhkar_morning") {
    await edit(adhkarMessage("morning"), adhkarBackKeyboard());
    return;
  }
  if (data === "adhkar_evening") {
    await edit(adhkarMessage("evening"), adhkarBackKeyboard());
    return;
  }

  // راديو
  if (data === "radio_menu") {
    await edit(radioMenuMessage(), radioMenuKeyboard());
    return;
  }
  if (data.startsWith("radio_")) {
    const idx = parseInt(data.replace("radio_", ""), 10);
    const station = RADIO_STATIONS[idx];
    if (station) {
      await bot.sendAudio(chatId, station.url, { title: station.name });
    }
    return;
  }

  // القرآن الكريم - قائمة السور (صفحات)
  if (data.startsWith("qpage_")) {
    const page = parseInt(data.replace("qpage_", ""), 10);
    const keyboard = await surahListKeyboard(page);
    await edit(surahListMessage(page), keyboard);
    return;
  }
  if (data.startsWith("qsurah_")) {
    const [, num, page] = data.split("_");
    const surahNumber = parseInt(num, 10);
    const message = await surahOptionsMessage(surahNumber);
    await edit(message, surahOptionsKeyboard(surahNumber, parseInt(page, 10)));
    return;
  }
  if (data.startsWith("qtext_")) {
    const [, num, page] = data.split("_");
    const surahNumber = parseInt(num, 10);
    const text = await getSurahText(surahNumber);
    await sendLongMessage(bot, chatId, text);
    await bot.sendMessage(chatId, "اختر إجراء آخر:", {
      reply_markup: surahOptionsKeyboard(surahNumber, parseInt(page, 10)),
    });
    return;
  }
  if (data.startsWith("qaudio_")) {
    const [, num, page] = data.split("_");
    const surahNumber = parseInt(num, 10);
    const audioUrl = await getSurahAudioUrl(surahNumber);
    await bot.sendAudio(chatId, audioUrl);
    return;
  }

  // الورد الشخصي
  if (data === "wird_status") {
    const user = await getOrCreateUser(db, chatId);
    await edit(wirdStatusMessage(user), wirdStatusKeyboard(user));
    return;
  }
  if (data === "wird_done") {
    const result = await markWirdDone(db, chatId);
    if (result.alreadyDone) {
      await edit("أنت مسجل وردك اليوم فعلًا ✅", wirdStatusKeyboard(result.user));
      return;
    }
    let message = `🎉 ما شاء الله! سجلنا وردك اليوم.\nسلسلتك: ${result.user.streakSolo} يوم متواصل`;
    if (result.sharedStreakUpdated) {
      message += `\n\n🤝 وشريكك خلّص وياك اليوم! سلسلتكم المشتركة: ${result.user.streakShared} يوم`;
      await bot.sendMessage(
        result.user.partnerChatId,
        `🎉 شريكك في الورد خلّص وِرده اليوم! سلسلتكم المشتركة: ${result.user.streakShared} يوم 🤝`
      );
    } else if (result.user.partnerChatId) {
      message += `\n\nلسا شريكك ما سجل وِرده اليوم.`;
    }
    await edit(message, wirdStatusKeyboard(result.user));
    return;
  }
  if (data === "wird_target_menu") {
    await edit("🎯 اختر عدد الصفحات هدفك اليومي:", wirdTargetKeyboard());
    return;
  }
  if (data.startsWith("wtarget_")) {
    const pages = parseInt(data.replace("wtarget_", ""), 10);
    const user = await setDailyTarget(db, chatId, pages);
    await edit(`تم ضبط هدفك اليومي: ${pages} صفحة 📖`, wirdStatusKeyboard(user));
    return;
  }

  // الورد المشترك
  if (data === "wird_pair_menu") {
    const user = await getOrCreateUser(db, chatId);
    const botUsername = await getBotUsername(bot, env);
    await edit(pairMenuMessage(user, botUsername), pairMenuKeyboard(user, botUsername, chatId));
    return;
  }
  if (data === "wird_unpair") {
    await unpair(db, chatId);
    const user = await getOrCreateUser(db, chatId);
    const botUsername = await getBotUsername(bot, env);
    await edit("تم فك الارتباط مع شريكك.", pairMenuKeyboard(user, botUsername, chatId));
    return;
  }
}

let cachedBotUsername = null;
async function getBotUsername(bot, env) {
  if (cachedBotUsername) return cachedBotUsername;
  if (env.BOT_USERNAME) {
    cachedBotUsername = env.BOT_USERNAME;
    return cachedBotUsername;
  }
  return "";
}

async function sendLongMessage(bot, chatId, text) {
  const CHUNK = 3500;
  for (let i = 0; i < text.length; i += CHUNK) {
    await bot.sendMessage(chatId, text.slice(i, i + CHUNK));
  }
}

async function handleScheduled(event, env) {
  const bot = tg(env);
  const db = firestore(env);
  const users = await db.list("users");

  const hourUTC = new Date(event.scheduledTime).getUTCHours();

  for (const user of users) {
    if (hourUTC === 5) {
      await bot.sendMessage(user.chatId, adhkarMessage("morning"));
    }
    if (hourUTC === 15) {
      await bot.sendMessage(user.chatId, adhkarMessage("evening"));
    }
  }
}
