// روابط بث مباشر (راديو القرآن الكريم، إذاعة الحرمين الشريفين)
// ملاحظة: روابط البث ممكن تتغير من وقت لآخر، تأكد منها بين فترة وأخرى
import { inlineKeyboard, backButton } from "../lib/telegram.js";

export const RADIO_STATIONS = [
  {
    name: "📻 إذاعة القرآن الكريم (السعودية)",
    url: "https://backup.qurango.net/radio/tarateel",
  },
  {
    name: "🕋 إذاعة الحرمين الشريفين",
    url: "https://n0c.radiojar.com/8s5u5tpdtwzuv?rj-ttl=5&rj-tok=AAABkNQ2example",
  },
  {
    name: "📖 راديو السنة النبوية",
    url: "https://backup.qurango.net/radio/sunnah",
  },
];

export function radioMenuKeyboard() {
  const rows = RADIO_STATIONS.map((s, i) => [
    { text: s.name, callback_data: `radio_${i}` },
  ]);
  rows.push(backButton());
  return inlineKeyboard(rows);
}

export function radioMenuMessage() {
  return "📻 اختر محطة للاستماع:";
}
