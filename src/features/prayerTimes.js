// مواقيت الصلاة عبر Aladhan API (مجاني، بدون مفتاح API)
import { inlineKeyboard, backButton } from "../lib/telegram.js";

const PRAYER_NAMES_AR = {
  Fajr: "الفجر",
  Dhuhr: "الظهر",
  Asr: "العصر",
  Maghrib: "المغرب",
  Isha: "العشاء",
};

export async function getPrayerTimes(city, country) {
  const url = `https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(
    city
  )}&country=${encodeURIComponent(country)}&method=4`; // method=4: أم القرى

  const res = await fetch(url);
  const data = await res.json();
  const t = data.data.timings;

  return Object.entries(PRAYER_NAMES_AR).map(([key, nameAr]) => ({
    key,
    nameAr,
    time: t[key],
  }));
}

export async function prayerTimesMessage(city, country) {
  const timings = await getPrayerTimes(city, country);
  const lines = timings.map((p) => `${p.nameAr}: <b>${p.time}</b>`).join("\n");
  return `🕌 مواقيت الصلاة - ${city}\n\n${lines}`;
}

export function prayerBackKeyboard() {
  return inlineKeyboard([backButton()]);
}
