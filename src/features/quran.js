// القرآن الكريم: قائمة السور بأزرار (صفحات)، نص كل سورة، وصوت التلاوة
// المصدر: alquran.cloud API (مجاني، بدون مفتاح)
import { inlineKeyboard, backButton } from "../lib/telegram.js";

const PAGE_SIZE = 10; // عدد السور بكل صفحة أزرار

let cachedSurahList = null; // كاش بسيط داخل نفس الطلب/الجلسة

async function getAllSurahs() {
  if (cachedSurahList) return cachedSurahList;
  const res = await fetch("https://api.alquran.cloud/v1/surah");
  const data = await res.json();
  cachedSurahList = data.data; // [{number, name, englishName, ...}]
  return cachedSurahList;
}

export async function surahListKeyboard(page = 0) {
  const surahs = await getAllSurahs();
  const totalPages = Math.ceil(surahs.length / PAGE_SIZE);
  const start = page * PAGE_SIZE;
  const pageSurahs = surahs.slice(start, start + PAGE_SIZE);

  const rows = [];
  for (let i = 0; i < pageSurahs.length; i += 2) {
    const row = [pageSurahs[i]];
    if (pageSurahs[i + 1]) row.push(pageSurahs[i + 1]);
    rows.push(
      row.map((s) => ({
        text: `${s.number}. ${s.name}`,
        callback_data: `qsurah_${s.number}_${page}`,
      }))
    );
  }

  const navRow = [];
  if (page > 0) navRow.push({ text: "◀️ السابق", callback_data: `qpage_${page - 1}` });
  if (page < totalPages - 1) navRow.push({ text: "التالي ▶️", callback_data: `qpage_${page + 1}` });
  if (navRow.length) rows.push(navRow);

  rows.push(backButton());
  return inlineKeyboard(rows);
}

export function surahListMessage(page = 0) {
  return `🎧 اختر السورة (صفحة ${page + 1}):`;
}

export function surahOptionsKeyboard(surahNumber, backPage) {
  return inlineKeyboard([
    [
      { text: "📖 النص", callback_data: `qtext_${surahNumber}_${backPage}` },
      { text: "🎧 الاستماع", callback_data: `qaudio_${surahNumber}_${backPage}` },
    ],
    [{ text: "⬅️ رجوع لقائمة السور", callback_data: `qpage_${backPage}` }],
    backButton(),
  ]);
}

export async function surahOptionsMessage(surahNumber) {
  const surahs = await getAllSurahs();
  const s = surahs.find((x) => x.number === surahNumber);
  return `📖 سورة ${s.name} (${s.englishName})\nعدد الآيات: ${s.numberOfAyahs}\n\nاختر:`;
}

export async function getSurahAudioUrl(surahNumber, reciterEdition = "ar.alafasy") {
  return `https://cdn.islamic.network/quran/audio-surah/128/${reciterEdition}/${surahNumber}.mp3`;
}

export async function getSurahText(surahNumber) {
  const res = await fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}`);
  const data = await res.json();
  if (data.code !== 200) throw new Error("تعذر جلب السورة");
  const s = data.data;
  const ayahs = s.ayahs.map((a) => `(${a.numberInSurah}) ${a.text}`).join("\n");
  return `📖 سورة ${s.name} (${s.englishName})\n\n${ayahs}`;
}
