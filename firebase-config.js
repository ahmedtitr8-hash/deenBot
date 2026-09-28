// 1) console.firebase.google.com ← أنشئ مشروعاً ← أضف تطبيق ويب ← انسخ القيم هنا
// 2) Authentication ← Sign-in method ← فعّل Email/Password و Google
// 3) Firestore Database ← Create ← ثم الصق محتوى firestore.rules في تبويب Rules
// 4) Authentication ← Settings ← Authorized domains ← أضف username.github.io
export const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT",
  appId: "YOUR_APP_ID"
};
