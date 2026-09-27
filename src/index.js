import { tg, mainMenuKeyboard } from "./lib/telegram.js";
import { firestore } from "./lib/firestore.js";
import { prayerTimesMessage } from "./features/prayerTimes.js";
import { adhkarMessage } from "./features/adhkar.js";
import { radioMenuMessage, RADIO_STATIONS } from "./features/radio.js";
import { getSurahText, getSurahAudioUrl, surahListMessage } from "./features/quran.js";
import {
  getOrCreateUser,
  setDailyTarget,
  markWirdDone,
  pairWithPartner,
  unpair,
  wirdStatusMessage,
} from "./features/quranWird.js";

export default {
  async fetch(request, env, ctx) {
    if (request.method !== "POST") {
      return new Response("Deen Bot is running ✅", { status: 200 });
    }

    // تحقق من سر الـ webhook (لحماية الرابط من طلبات غريبة)
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

  const msg = update.message;
  if (!msg || !msg.text) return;

  const chatId = msg.chat.id;
  const text = msg.text.trim();

  await getOrCreateUser(db, chatId); // يضمن وجود المستخدم بالقاعدة من أول رسالة

  // أوامر أساسية
  if (text === "/start") {
    await bot.sendMessage(
      chatId,
      "🕌 أهلًا بك في بوت الدين!\n\nاختر من القائمة:",
      { reply_markup: mainMenuKeyboard() }
    );
    return;
  }

  if (text === "🕌 مواقيت الصلاة" || text === "/prayer") {
    const message = await prayerTimesMessage(env.DEFAULT_CITY, env.DEFAULT_COUNTRY);
    await bot.sendMessage(chatId, message);
    return;
  }

  if (text === "📿 الأذكار" || text === "/adhkar") {
    await bot.sendMessage(chatId, "اختر: اكتب «صباح» أو «مساء»");
    return;
  }
  if (text === "صباح") return bot.sendMessage(chatId, adhkarMessage("morning"));
  if (text === "مساء") return bot.sendMessage(chatId, adhkarMessage("evening"));

  if (text === "📻 راديو الحرمين" || text === "/radio") {
    await bot.sendMessage(chatId, radioMenuMessage());
    return;
  }
  if (/^[1-9]$/.test(text)) {
    const idx = parseInt(text, 10) - 1;
    if (RADIO_STATIONS[idx]) {
      await bot.sendAudio(chatId, RADIO_STATIONS[idx].url, {
        title: RADIO_STATIONS[idx].name,
      });
      return;
    }
  }

  if (text === "🎧 القرآن الكريم" || text === "/quran") {
    await bot.sendMessage(chatId, surahListMessage());
    return;
  }
  if (/^صوت\s*\d+$/.test(text)) {
    const surahNum = parseInt(text.replace(/\D/g, ""), 10);
    const audioUrl = await getSurahAudioUrl(surahNum);
    await bot.sendAudio(chatId, audioUrl);
    return;
  }
  if (/^\d+$/.test(text) && parseInt(text, 10) >= 1 && parseInt(text, 10) <= 114) {
    const surahText = await getSurahText(parseInt(text, 10));
    // تليجرام يحدد طول الرسالة بـ ٤٠٩٦ حرف، فنقسمها لو طويلة
    await sendLongMessage(bot, chatId, surahText);
    return;
  }

  // الورد الشخصي والمشترك
  if (text === "📖 وردي اليومي" || text === "/wird") {
    const user = await getOrCreateUser(db, chatId);
    await bot.sendMessage(chatId, wirdStatusMessage(user), {
      reply_markup: {
        keyboard: [["✅ خلصت وردي اليوم"], ["⬅️ رجوع للقائمة"]],
        resize_keyboard: true,
      },
    });
    return;
  }

  if (text === "✅ خلصت وردي اليوم") {
    const result = await markWirdDone(db, chatId);
    if (result.alreadyDone) {
      await bot.sendMessage(chatId, "أنت مسجل وردك اليوم فعلًا ✅");
      return;
    }
    let message = `🎉 ما شاء الله! سجلنا وردك اليوم.\nسلسلتك: ${result.user.streakSolo} يوم متواصل`;
    if (result.sharedStreakUpdated) {
      message += `\n\n🤝 وشريكك خلّص وياك اليوم! سلسلتكم المشتركة: ${result.user.streakShared} يوم`;
      // إشعار الشريك
      await bot.sendMessage(
        result.user.partnerChatId,
        `🎉 شريكك في الورد خلّص وِرده اليوم! سلسلتكم المشتركة: ${result.user.streakShared} يوم 🤝`
      );
    } else if (result.user.partnerChatId) {
      message += `\n\nلسا شريكك ما سجل وِرده اليوم، ذكّره 😊`;
    }
    await bot.sendMessage(chatId, message);
    return;
  }

  if (text.startsWith("/setwird")) {
    const pages = parseInt(text.replace("/setwird", "").trim(), 10) || 1;
    await setDailyTarget(db, chatId, pages);
    await bot.sendMessage(chatId, `تم ضبط هدفك اليومي: ${pages} صفحة 📖`);
    return;
  }

  if (text === "🤝 الورد المشترك") {
    await bot.sendMessage(
      chatId,
      `للربط مع شخص:\n1️⃣ خلّه يسوي /start مع البوت\n2️⃣ خذ الـ chat_id تبعه (اطلب منه يرسل /myid)\n3️⃣ أرسل: /pair <chat_id>\n\nid حسابك: <code>${chatId}</code>`
    );
    return;
  }

  if (text === "/myid") {
    await bot.sendMessage(chatId, `chat_id تبعك: <code>${chatId}</code>`);
    return;
  }

  if (text.startsWith("/pair")) {
    const partnerId = text.replace("/pair", "").trim();
    if (!partnerId) {
      await bot.sendMessage(chatId, "استخدم: /pair <chat_id>");
      return;
    }
    const result = await pairWithPartner(db, chatId, partnerId);
    if (result.error) {
      await bot.sendMessage(chatId, "❌ " + result.error);
    } else {
      await bot.sendMessage(chatId, "✅ تم الربط! صرتوا فريق ورد واحد 🤝");
      await bot.sendMessage(result.partnerChatId, "✅ حد ربط وردك القرآن وياك! تحقق بـ /wird");
    }
    return;
  }

  if (text === "/unpair") {
    await unpair(db, chatId);
    await bot.sendMessage(chatId, "تم فك الارتباط مع شريكك.");
    return;
  }

  if (text === "⬅️ رجوع للقائمة") {
    await bot.sendMessage(chatId, "القائمة الرئيسية:", { reply_markup: mainMenuKeyboard() });
    return;
  }

  // رد افتراضي
  await bot.sendMessage(chatId, "اكتب /start عشان تشوف القائمة الرئيسية 🙂");
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
    // أذكار الصباح والمساء (حسب الكرون في wrangler.toml: ٥ص و٣عصرًا UTC)
    if (hourUTC === 5) {
      await bot.sendMessage(user.chatId, adhkarMessage("morning"));
    }
    if (hourUTC === 15) {
      await bot.sendMessage(user.chatId, adhkarMessage("evening"));
    }
    // ملاحظة: تذكير مواقيت الصلاة الدقيق (قبل كل أذان) يحتاج تحسب توقيت كل مستخدم
    // حسب مدينته + منطقته الزمنية، هذا جزء تقدر تطوره لاحقًا في هذي الدالة
  }
}
