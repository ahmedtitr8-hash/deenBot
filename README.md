# نور
1. ارفع المجلد كله على GitHub.
2. Codemagic > Add application > اختر المستودع > codemagic.yaml.
3. Teams > Code signing identities > Android keystores: أنشئ keystore واحد وسمّه noor_keystore، واحفظ نسخة منه.
   ملاحظة: الـ signing يحتاج تعديل build.gradle بعد flutter create؛ يُضاف في المرحلة التالية.
4. Start new build.
