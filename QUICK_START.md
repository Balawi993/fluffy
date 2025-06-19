# Fluffly - تعليمات التشغيل السريع

## 🚀 تشغيل الموقع (خطوات سريعة)

### المتطلبات
- Node.js (v16 أو أحدث)
- npm أو yarn

### 1. تشغيل الخادم الخلفي (Backend)
```bash
cd fluffly-backend
node basic-server-prisma.js
```

### 2. تشغيل الواجهة الأمامية (Frontend)
```bash
# في terminal جديد
npm run dev
```

### 3. فتح الموقع
- الواجهة الأمامية: http://localhost:5173
- API الخلفي: http://localhost:5000

## ✅ حالة قاعدة البيانات

### قاعدة البيانات الحالية
- **النوع**: Supabase PostgreSQL
- **الحالة**: ✅ متصلة وتعمل بشكل صحيح
- **الرابط**: مُعد مسبقاً في ملف `.env`

### البيانات المتاحة
- مستخدمين تجريبيين
- جهات اتصال عينة
- قوالب بريد إلكتروني
- حملات تسويقية

## 🔧 إعداد البيئة

### ملف `.env` للخادم الخلفي
```bash
# في مجلد fluffly-backend
DATABASE_URL="postgresql://postgres.xeoaqmawlxxcgeisjhfo:PQTmUFF5ll7CaVkh@aws-0-us-east-2.pooler.supabase.com:5432/postgres"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production-fluffly-2024"
JWT_EXPIRES_IN="7d"
PORT=5000
NODE_ENV=development
FRONTEND_URL="http://localhost:5173"
RESEND_API_KEY="your-resend-api-key"
RESEND_WEBHOOK_SECRET="your-webhook-signing-secret"
```

### ملف `.env` للواجهة الأمامية (اختياري)
```bash
VITE_API_URL=http://localhost:5000
VITE_APP_NAME=Fluffly
VITE_APP_DESCRIPTION="Modern Email Marketing Platform"
```

## 📋 اختبار النظام

### إنشاء مستخدم جديد
1. اذهب إلى http://localhost:5173
2. اضغط على "Sign Up"
3. أدخل البيانات المطلوبة
4. سجل دخولك

### اختبار الميزات
- ✅ إدارة جهات الاتصال
- ✅ إنشاء قوالب البريد الإلكتروني
- ✅ إنشاء حملات تسويقية
- ✅ إرسال البريد الإلكتروني (يتطلب Resend API key)

## 🛠️ استكشاف الأخطاء

### إذا لم يعمل الخادم الخلفي
```bash
# تأكد من وجود ملف .env
cd fluffly-backend
ls .env

# تأكد من تثبيت الحزم
npm install

# أعد تشغيل الخادم
node basic-server-prisma.js
```

### إذا لم تعمل الواجهة الأمامية
```bash
# تأكد من تثبيت الحزم
npm install

# أعد تشغيل الخادم
npm run dev
```

### فحص الاتصال
```bash
# تحقق من تشغيل الخوادم
netstat -an | findstr ":5000\|:5173"
```

## 📞 الدعم
إذا واجهت أي مشاكل، تأكد من:
1. تشغيل كلا الخادمين (5000 و 5173)
2. وجود ملف `.env` في مجلد `fluffly-backend`
3. الاتصال بالإنترنت لقاعدة بيانات Supabase 