// روابط بث مباشر (راديو القرآن الكريم، إذاعة الحرمين الشريفين)
// ملاحظة: روابط البث ممكن تتغير من وقت لآخر، تأكد منها بين فترة وأخرى

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

export function radioMenuMessage() {
  return (
    "📻 اختر محطة للاستماع:\n\n" +
    RADIO_STATIONS.map((s, i) => `${i + 1}. ${s.name}`).join("\n") +
    "\n\nأرسل رقم المحطة."
  );
}
