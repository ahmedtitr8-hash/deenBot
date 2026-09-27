# بوت الدين (Deen Bot) 🕌

بوت تليجرام يشتغل على **Cloudflare Workers** (بدون سيرفر، بدون Termux شغال) وقاعدة بيانات **Firebase Firestore**.

## المزايا الحالية
- 🕌 مواقيت الصلاة (Aladhan API)
- 📿 الأذكار (صباح/مساء) + إرسال تلقائي مجدول
- 📖 ورد القرآن الشخصي (هدف يومي + سلسلة إنجاز)
- 🤝 الورد المشترك (ربط شخصين، إشعار كل ما الطرفين يخلصون وردهم بنفس اليوم)
- 📻 راديو الحرمين ومحطات مسموعة
- 🎧 القرآن الكريم (نص كل سورة + رابط صوت التلاوة)

---

## 1) إنشاء بوت تليجرام
1. كلم [@BotFather](https://t.me/BotFather) على تليجرام.
2. أرسل `/newbot` واتبع التعليمات.
3. خذ الـ **Token** اللي يعطيك ياه.

## 2) إعداد Firebase
1. روح [console.firebase.google.com](https://console.firebase.google.com) وسوي مشروع جديد.
2. فعّل **Firestore Database** (Native mode).
3. من إعدادات المشروع → **Service Accounts** → اضغط "Generate new private key".
4. بينزلك ملف JSON فيه: `project_id`, `client_email`, `private_key`.

## 3) تثبيت الأدوات (من Termux أو أي جهاز)
```bash
npm install
npm install -g wrangler   # لو ما كان مثبت
wrangler login            # يربطك بحساب Cloudflare
```

## 4) ضبط المتغيرات
افتح `wrangler.toml` وحدّث:
```toml
FIREBASE_PROJECT_ID = "ضع project_id هنا"
DEFAULT_CITY = "Riyadh"
DEFAULT_COUNTRY = "Saudi Arabia"
```

أضف الأسرار (لا تكتبها داخل wrangler.toml مباشرة):
```bash
wrangler secret put BOT_TOKEN
wrangler secret put FIREBASE_CLIENT_EMAIL
wrangler secret put FIREBASE_PRIVATE_KEY
wrangler secret put WEBHOOK_SECRET
```
- `BOT_TOKEN`: توكن البوت من BotFather
- `FIREBASE_CLIENT_EMAIL`: من ملف الـ service account (`client_email`)
- `FIREBASE_PRIVATE_KEY`: من نفس الملف (`private_key`) - الصقه كامل بما فيه `-----BEGIN PRIVATE KEY-----`
- `WEBHOOK_SECRET`: أي سلسلة عشوائية من عندك (مثلاً: `openssl rand -hex 16`)

## 5) النشر
```bash
wrangler deploy
```
راح يعطيك رابط شبيه بـ: `https://deen-bot.<your-subdomain>.workers.dev`

## 6) ربط البوت بالرابط (تسجيل الـ webhook)
استبدل `<TOKEN>` و`<WORKER_URL>` و`<SECRET>`:
```bash
curl -X POST "https://api.telegram.org/bot<TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url": "<WORKER_URL>", "secret_token": "<SECRET>"}'
```

## 7) جرّبه
روح كلم بوتك على تليجرام واكتب `/start` 🎉

---

## هيكل المشروع
```
deen-bot/
├── wrangler.toml          # إعدادات Cloudflare + الجدولة (cron)
├── package.json
├── src/
│   ├── index.js           # نقطة الدخول: استقبال الرسائل + الجدولة
│   ├── lib/
│   │   ├── telegram.js    # التواصل مع Telegram API
│   │   └── firestore.js   # التواصل مع Firestore REST API
│   └── features/
│       ├── prayerTimes.js
│       ├── adhkar.js
│       ├── radio.js
│       ├── quran.js
│       └── quranWird.js   # الورد الشخصي والمشترك
```

## أفكار للتطوير لاحقًا
- تذكير مواقيت الصلاة الدقيق حسب مدينة كل مستخدم (حاليًا `handleScheduled` عام لكل المستخدمين بتوقيت واحد)
- دعم أكثر من شريك ورد (مجموعة بدل شخصين)
- أزرار Inline بدل الكيبورد النصي
- حفظ قارئ مفضل للتلاوة
- إحصائيات أسبوعية/شهرية للورد

## ملاحظات
- الحد المجاني لـ Cloudflare Workers: 100,000 طلب/يوم — كافي جدًا لبوت شخصي، وما يحتاج بطاقة بنكية.
- تأكد من صلاحية روابط الراديو في `src/features/radio.js` بين فترة وأخرى، بعض الروابط تتغير.
