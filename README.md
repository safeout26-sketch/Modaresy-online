# المدرسة الفرنسية أونلاين

فصل أونلاين: فيديو وصوت جماعي (LiveKit)، سبورة تفاعلية، PDF متزامن، شات، رفع يد، ومفردات فرنسي/عربي.

## التشغيل المحلي (٥ دقائق)

1. أنشئ مشروعًا مجانيًا على https://cloud.livekit.io وانسخ **URL** و**API Key** و**Secret**.
2. شغّل:
   ```bash
   npm install
   cp .env.example .env     # ثم املأ القيم الثلاث
   npm start
   ```
3. افتح http://localhost:3000. الكاميرا والميكروفون يحتاجان `localhost` أو **HTTPS**.
4. ادخل كـ«مدرّس» → اضغط «غرفة جديدة» → «مشاركة الرابط» وأرسله للطلاب.

> المفتاح السري لا يظهر في المتصفح أبدًا: الخادم (`server/server.js`) هو الذي يصدر التوكن.

## تعريف المدرّس
ضع `TEACHER_CODE` في `.env`. من يدخل كمدرّس لازم يكتبه. الطلاب لا يقدرون على مسح السبورة أو تغيير صفحة الـPDF أو فتح ملف، والرسم لهم يفعّله المدرّس بزر «السماح للطلاب بالرسم».

## Firebase (اختياري)
بدون Firebase: المفردات تُحفظ على الجهاز، والـPDF يُرفع إلى مجلد `server/uploads`.
مع Firebase: كلمات ونتائج كل مستخدم في Firestore، والـPDF في Storage.

```bash
npm i -g firebase-tools && firebase login
firebase use --add                      # اختر مشروعك
firebase deploy --only firestore,storage
```
ثم:
- فعّل **Authentication → Anonymous** من لوحة Firebase.
- الصق إعدادات تطبيق الويب في `public/config.js` (`firebase: {...}`).
- لتشغيل PDF من Storage أضف CORS: `gsutil cors set firebase/cors.json gs://YOUR-BUCKET`.

القواعد في `firebase/firestore.rules` و`firebase/storage.rules`: كل مستخدم يقرأ ويكتب بياناته فقط، والـPDF حتى ٢٥ ميجا ونوعه PDF فقط.
تنبيه: الرفع إلى Storage مفتوح لأي مستخدم مجهول. للتقييد على المدرّسين فقط استخدم الرفع عبر الخادم (الوضع الافتراضي بدون Firebase) أو Custom Claims.

## النشر
الخادم يقدّم الواجهة والـAPI معًا، فيصلح لأي استضافة Node.js (Render, Railway, Fly.io, Cloud Run). اضبط متغيرات `.env` كـEnvironment Variables. الاستضافة لازم تكون HTTPS. على Render المجاني وأمثاله مجلد `server/uploads` يُمسح عند إعادة التشغيل، فاستخدم Firebase Storage للملفات الدائمة.

## المكتبة
`public/js/data.js`: روابط المصادر الرسمية، المفردات (٦١ كلمة)، والتمارين. الكتب الرسمية لا تُنسخ داخل التطبيق، والروابط تفتح مصدرها. راجع رابط المنصة الرسمية وعدّله إن لزم.

## هيكل الملفات
```
server/server.js        توكن LiveKit + رفع PDF
public/index.html       الواجهة
public/style.css
public/js/app.js        الفيديو، السبورة، PDF، الشات، المفردات
public/js/firebase.js   Auth/Firestore/Storage
public/js/data.js       المفردات والمكتبة والتمارين
firebase/               القواعد وCORS
```

## ملاحظات
- مشاركة الشاشة غير مدعومة في أغلب متصفحات الموبايل (الزر يختفي تلقائيًا).
- السبورة والـPDF والشات تعمل عبر قناة بيانات LiveKit، ومن يدخل متأخرًا يستلم الحالة من المدرّس. لو المدرّس خرج، الحالة لا تُحفظ.
