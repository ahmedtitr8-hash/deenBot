// أذكار الصباح والمساء - نصوص أساسية (وسّعها براحتك)
import { inlineKeyboard, backButton } from "../lib/telegram.js";

export const MORNING_ADHKAR = [
  "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ",
  "اللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا وَبِكَ نَمُوتُ وَإِلَيْكَ النُّشُورُ",
  "اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ (سيد الاستغفار)",
  "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ (٣ مرات)",
  "حَسْبِيَ اللَّهُ لَا إِلَهَ إِلَّا هُوَ عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ (٧ مرات)",
];

export const EVENING_ADHKAR = [
  "أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ",
  "اللَّهُمَّ بِكَ أَمْسَيْنَا وَبِكَ أَصْبَحْنَا، وَبِكَ نَحْيَا وَبِكَ نَمُوتُ وَإِلَيْكَ الْمَصِيرُ",
  "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ (٣ مرات)",
  "اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي الدُّنْيَا وَالْآخِرَةِ",
  "حَسْبِيَ اللَّهُ لَا إِلَهَ إِلَّا هُوَ عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ (٧ مرات)",
];

export function adhkarMenuKeyboard() {
  return inlineKeyboard([
    [
      { text: "🌅 أذكار الصباح", callback_data: "adhkar_morning" },
      { text: "🌆 أذكار المساء", callback_data: "adhkar_evening" },
    ],
    backButton(),
  ]);
}

export function adhkarMessage(type) {
  const list = type === "morning" ? MORNING_ADHKAR : EVENING_ADHKAR;
  const title = type === "morning" ? "🌅 أذكار الصباح" : "🌆 أذكار المساء";
  return `${title}\n\n` + list.map((a, i) => `${i + 1}. ${a}`).join("\n\n");
}

export function adhkarBackKeyboard() {
  return inlineKeyboard([
    [
      { text: "🌅 صباح", callback_data: "adhkar_morning" },
      { text: "🌆 مساء", callback_data: "adhkar_evening" },
    ],
    backButton(),
  ]);
}
