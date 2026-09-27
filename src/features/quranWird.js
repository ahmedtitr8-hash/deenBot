// ورد القرآن: شخصي + مشترك (مع شريك واحد)
// الفكرة: كل مستخدم عنده هدف يومي (صفحات)، يسجل "خلصت وردي" كل يوم.
// لو مرتبط بشريك، وكلاهما سجّل بنفس اليوم، تزيد سلسلة الإنجاز المشترك (streak)
// ويوصل إشعار لكل واحد إذا خلّص شريكه.

const COLLECTION = "users";

function today() {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

export async function getOrCreateUser(db, chatId) {
  let user = await db.get(COLLECTION, String(chatId));
  if (!user) {
    user = {
      chatId: String(chatId),
      dailyWirdPages: 1,
      lastWirdDate: "",
      streakSolo: 0,
      partnerChatId: "",
      streakShared: 0,
      lastSharedDate: "",
    };
    await db.set(COLLECTION, String(chatId), user);
  }
  return user;
}

export async function setDailyTarget(db, chatId, pages) {
  const user = await getOrCreateUser(db, chatId);
  user.dailyWirdPages = pages;
  await db.set(COLLECTION, String(chatId), user);
  return user;
}

// تسجيل إنجاز وِرد اليوم -> يرجع معلومات تفيد الرسالة (شريك خلّص وياه أو لا)
export async function markWirdDone(db, chatId) {
  const t = today();
  const user = await getOrCreateUser(db, chatId);

  if (user.lastWirdDate === t) {
    return { alreadyDone: true, user };
  }

  // تحديث السلسلة الشخصية
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  user.streakSolo = user.lastWirdDate === yesterday ? user.streakSolo + 1 : 1;
  user.lastWirdDate = t;
  await db.set(COLLECTION, String(chatId), user);

  let partnerCompletedToday = false;
  let sharedStreakUpdated = false;

  if (user.partnerChatId) {
    const partner = await db.get(COLLECTION, user.partnerChatId);
    if (partner && partner.lastWirdDate === t) {
      partnerCompletedToday = true;
      // كلاهما خلّص اليوم -> حدّث السلسلة المشتركة لكلا الطرفين
      const yShared = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
      const newSharedStreak =
        user.lastSharedDate === yShared ? (user.streakShared || 0) + 1 : 1;

      user.streakShared = newSharedStreak;
      user.lastSharedDate = t;
      partner.streakShared = newSharedStreak;
      partner.lastSharedDate = t;

      await db.set(COLLECTION, String(chatId), user);
      await db.set(COLLECTION, user.partnerChatId, partner);
      sharedStreakUpdated = true;
    }
  }

  return { alreadyDone: false, user, partnerCompletedToday, sharedStreakUpdated };
}

// ربط مستخدمين ببعض عن طريق كود = chat_id الطرف الآخر
export async function pairWithPartner(db, chatId, partnerChatId) {
  if (String(partnerChatId) === String(chatId)) {
    return { error: "ما تقدر ترتبط بنفسك 🙂" };
  }
  const partner = await db.get(COLLECTION, String(partnerChatId));
  if (!partner) {
    return { error: "ما لقيت هذا الشخص، خله يبدأ محادثة مع البوت أول ويسوي /start" };
  }

  const user = await getOrCreateUser(db, chatId);
  user.partnerChatId = String(partnerChatId);
  partner.partnerChatId = String(chatId);

  await db.set(COLLECTION, String(chatId), user);
  await db.set(COLLECTION, String(partnerChatId), partner);

  return { success: true, partnerChatId: String(partnerChatId) };
}

export async function unpair(db, chatId) {
  const user = await getOrCreateUser(db, chatId);
  const partnerId = user.partnerChatId;
  user.partnerChatId = "";
  user.streakShared = 0;
  user.lastSharedDate = "";
  await db.set(COLLECTION, String(chatId), user);

  if (partnerId) {
    const partner = await db.get(COLLECTION, partnerId);
    if (partner) {
      partner.partnerChatId = "";
      partner.streakShared = 0;
      partner.lastSharedDate = "";
      await db.set(COLLECTION, partnerId, partner);
    }
  }
  return { partnerId };
}

export function wirdStatusMessage(user) {
  const doneToday = user.lastWirdDate === today();
  const lines = [
    `📖 هدفك اليومي: ${user.dailyWirdPages} صفحة`,
    `اليوم: ${doneToday ? "✅ منجز" : "⏳ لسا"}`,
    `سلسلة الإنجاز الشخصي: ${user.streakSolo || 0} يوم`,
  ];
  if (user.partnerChatId) {
    lines.push(`🤝 مرتبط بشريك | سلسلة الإنجاز المشترك: ${user.streakShared || 0} يوم`);
  } else {
    lines.push(`🤝 ما عندك شريك ورد حاليًا. استخدم /pair <chat_id>`);
  }
  return lines.join("\n");
}
