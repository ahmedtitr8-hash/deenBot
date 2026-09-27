// جلب نص وصوت السور من alquran.cloud API (مجاني، بدون مفتاح)

export async function getSurahAudioUrl(surahNumber, reciterEdition = "ar.alafasy") {
  // رابط صوت السورة كاملة بصوت قارئ معيّن
  return `https://cdn.islamic.network/quran/audio-surah/128/${reciterEdition}/${surahNumber}.mp3`;
}

export async function getSurahText(surahNumber) {
  const res = await fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}`);
  const data = await res.json();
  if (data.code !== 200) throw new Error("تعذر جلب السورة");
  const s = data.data;
  const ayahs = s.ayahs.map((a) => `(${a.numberInSurah}) ${a.text}`).join("\n");
  return `📖 سورة ${s.name} (${s.englishName})\nعدد الآيات: ${s.numberOfAyahs}\n\n${ayahs}`;
}

export function surahListMessage() {
  return "🎧 أرسل اسم السورة أو رقمها (١-١١٤) وبعطيك النص، أو اكتب:\n«صوت + رقم السورة» عشان أبعثلك التلاوة صوت.";
}
