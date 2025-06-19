# دليل المطورين - Fluffly Email Marketing Platform

## 📋 نظرة عامة

Fluffly هي منصة تسويق إلكتروني حديثة مبنية بـ React و Node.js مع قاعدة بيانات Supabase PostgreSQL.

## 🏗️ هيكل المشروع

```
fluffly/
├── src/                      # كود الواجهة الأمامية
│   ├── components/           # مكونات React قابلة لإعادة الاستخدام
│   ├── pages/               # صفحات التطبيق
│   ├── lib/                 # مكتبات ووظائف مساعدة
│   └── assets/              # الصور والملفات الثابتة
├── fluffly-backend/         # كود الخادم الخلفي
│   ├── prisma/              # مخطط قاعدة البيانات
│   ├── generated/           # ملفات Prisma المولدة
│   └── basic-server-prisma.js # الخادم الرئيسي
├── public/                  # ملفات عامة للواجهة
└── docs/                    # ملفات التوثيق
```

## 🔧 التقنيات المستخدمة

### الواجهة الأمامية
- **React 19** مع TypeScript
- **Vite** لأدوات البناء
- **Tailwind CSS** للتصميم
- **React Router** للتنقل
- **Axios** لطلبات API
- **Heroicons** للأيقونات

### الخادم الخلفي
- **Node.js** HTTP server
- **Prisma ORM** لقاعدة البيانات
- **JWT** للمصادقة
- **bcryptjs** لتشفير كلمات المرور
- **Resend API** لإرسال البريد الإلكتروني
- **Svix** للتحقق من webhooks

## 🗄️ قاعدة البيانات

### إعداد Supabase
- **النوع**: PostgreSQL
- **المزود**: Supabase
- **الحالة**: ✅ متصلة ومُعدة
- **الرابط**: مُعرف في `.env`

### نماذج البيانات

#### User (المستخدم)
```typescript
{
  id: string          // UUID
  fullName: string    // الاسم الكامل
  email: string       // البريد الإلكتروني (فريد)
  password: string    // كلمة المرور المشفرة
  createdAt: DateTime
  updatedAt: DateTime
}
```

#### Contact (جهة الاتصال)
```typescript
{
  id: string          // UUID
  name: string        // اسم جهة الاتصال
  email: string       // البريد الإلكتروني
  tags: string?       // علامات (اختياري)
  groupId: string?    // معرف المجموعة (اختياري)
  userId: string      // معرف المستخدم المالك
  createdAt: DateTime
  updatedAt: DateTime
}
```

#### Template (القالب)
```typescript
{
  id: string          // UUID
  name: string        // اسم القالب
  subject: string?    // موضوع البريد (اختياري)
  blocks: Json        // محتوى القالب (JSON)
  userId: string      // معرف المستخدم المالك
  createdAt: DateTime
  updatedAt: DateTime
}
```

#### Campaign (الحملة)
```typescript
{
  id: string          // UUID
  name: string        // اسم الحملة
  subject: string     // موضوع البريد
  sender: string      // المرسل
  group: string       // المجموعة المستهدفة
  blocks: Json        // محتوى الحملة (JSON)
  status: string      // حالة الحملة (draft, sent)
  userId: string      // معرف المستخدم المالك
  createdAt: DateTime
  updatedAt: DateTime
}
```

#### SentEmail (البريد المرسل)
```typescript
{
  id: string          // UUID
  messageId: string   // معرف الرسالة من Resend
  contactEmail: string // بريد المستقبل
  status: string      // حالة البريد (sent, delivered, opened, etc.)
  campaignId: string  // معرف الحملة
  userId: string      // معرف المستخدم
  contactId: string   // معرف جهة الاتصال
  sentAt: DateTime    // وقت الإرسال
}
```

#### EmailEvent (أحداث البريد)
```typescript
{
  id: string          // UUID
  eventType: string   // نوع الحدث (opened, clicked, bounced, etc.)
  messageId: string   // معرف الرسالة
  contactEmail: string // بريد المستقبل
  timestamp: DateTime // وقت الحدث
  metadata: Json?     // بيانات إضافية
  campaignId: string  // معرف الحملة
  userId: string      // معرف المستخدم
  contactId: string   // معرف جهة الاتصال
}
```

#### Group (المجموعة)
```typescript
{
  id: string          // UUID
  name: string        // اسم المجموعة
  description: string? // وصف المجموعة (اختياري)
  userId: string      // معرف المستخدم المالك
  createdAt: DateTime
  updatedAt: DateTime
}
```

## 🌐 APIs ونقاط النهاية

### المصادقة (Authentication)

#### POST `/api/auth/signup`
تسجيل مستخدم جديد
```json
// Request
{
  "fullName": "اسم المستخدم",
  "email": "user@example.com",
  "password": "كلمة المرور"
}

// Response
{
  "success": true,
  "token": "JWT_TOKEN",
  "user": {
    "id": "user_id",
    "fullName": "اسم المستخدم",
    "email": "user@example.com"
  }
}
```

#### POST `/api/auth/login`
تسجيل دخول المستخدم
```json
// Request
{
  "email": "user@example.com",
  "password": "كلمة المرور"
}

// Response
{
  "success": true,
  "token": "JWT_TOKEN",
  "user": {
    "id": "user_id",
    "fullName": "اسم المستخدم",
    "email": "user@example.com"
  }
}
```

#### GET `/api/auth/me`
الحصول على معلومات المستخدم الحالي
```json
// Headers
{
  "Authorization": "Bearer JWT_TOKEN"
}

// Response
{
  "success": true,
  "user": {
    "id": "user_id",
    "fullName": "اسم المستخدم",
    "email": "user@example.com"
  }
}
```

### جهات الاتصال (Contacts)

#### GET `/api/contacts`
الحصول على جميع جهات الاتصال للمستخدم
```json
// Headers
{
  "Authorization": "Bearer JWT_TOKEN"
}

// Response
{
  "success": true,
  "contacts": [
    {
      "id": "contact_id",
      "name": "اسم جهة الاتصال",
      "email": "contact@example.com",
      "tags": "علامة1,علامة2",
      "groupId": "group_id",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

#### POST `/api/contacts`
إضافة جهة اتصال جديدة
```json
// Request
{
  "name": "اسم جهة الاتصال",
  "email": "contact@example.com",
  "tags": "علامة1,علامة2",
  "groupId": "group_id"
}

// Response
{
  "success": true,
  "contact": {
    "id": "contact_id",
    "name": "اسم جهة الاتصال",
    "email": "contact@example.com",
    "tags": "علامة1,علامة2",
    "groupId": "group_id"
  }
}
```

#### PUT `/api/contacts/:id`
تحديث جهة اتصال
```json
// Request
{
  "name": "اسم محدث",
  "email": "updated@example.com",
  "tags": "علامة محدثة",
  "groupId": "new_group_id"
}

// Response
{
  "success": true,
  "contact": {
    "id": "contact_id",
    "name": "اسم محدث",
    "email": "updated@example.com"
  }
}
```

#### DELETE `/api/contacts/:id`
حذف جهة اتصال
```json
// Response
{
  "success": true,
  "message": "تم حذف جهة الاتصال بنجاح"
}
```

### القوالب (Templates)

#### GET `/api/templates`
الحصول على جميع القوالب للمستخدم
```json
// Response
{
  "success": true,
  "templates": [
    {
      "id": "template_id",
      "name": "اسم القالب",
      "subject": "موضوع البريد",
      "blocks": {...},
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

#### POST `/api/templates`
إنشاء قالب جديد
```json
// Request
{
  "name": "اسم القالب",
  "subject": "موضوع البريد",
  "blocks": {...}
}
```

### الحملات (Campaigns)

#### GET `/api/campaigns`
الحصول على جميع الحملات للمستخدم
```json
// Response
{
  "success": true,
  "campaigns": [
    {
      "id": "campaign_id",
      "name": "اسم الحملة",
      "subject": "موضوع البريد",
      "status": "draft",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

#### POST `/api/campaigns`
إنشاء حملة جديدة
```json
// Request
{
  "name": "اسم الحملة",
  "subject": "موضوع البريد",
  "sender": "المرسل",
  "group": "المجموعة المستهدفة",
  "blocks": {...}
}
```

## 🛠️ إرشادات التطوير

### إعداد البيئة المحلية

1. **استنساخ المشروع**
   ```bash
   git clone <repository-url>
   cd fluffly
   ```

2. **تثبيت التبعيات**
   ```bash
   # للواجهة الأمامية
   npm install
   
   # للخادم الخلفي
   cd fluffly-backend
   npm install
   ```

3. **إعداد متغيرات البيئة**
   ```bash
   # في fluffly-backend/.env
   DATABASE_URL="postgresql://..."
   JWT_SECRET="your-secret-key"
   PORT=5000
   ```

4. **تشغيل الخوادم**
   ```bash
   # تشغيل الكل معاً
   ./start-all.bat
   
   # أو منفصلة
   npm run dev          # الواجهة الأمامية
   ./start-backend.bat  # الخادم الخلفي
   ```

### قواعد الكود

#### الواجهة الأمامية
- استخدم TypeScript للتحقق من الأنواع
- اتبع نمط React Hooks
- استخدم Tailwind CSS للتصميم
- اتبع تسمية الملفات: `PascalCase` للمكونات

#### الخادم الخلفي
- استخدم async/await للعمليات غير المتزامنة
- تحقق من صحة البيانات المدخلة
- استخدم JWT للمصادقة
- أرجع استجابات JSON منسقة

### اختبار المشروع

#### اختبار الخادم الخلفي
```bash
cd fluffly-backend
node test-db.js     # اختبار قاعدة البيانات
node check-user.js  # فحص المستخدمين
```

#### اختبار APIs
```bash
# تسجيل دخول
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}'

# الحصول على جهات الاتصال
curl -X GET http://localhost:5000/api/contacts \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 🚀 النشر

### متطلبات النشر
- Node.js 16+
- PostgreSQL database
- متغيرات البيئة للإنتاج

### خطوات النشر
1. بناء الواجهة الأمامية: `npm run build`
2. رفع ملفات `dist/` إلى خادم الويب
3. نشر الخادم الخلفي على خدمة الاستضافة
4. تكوين قاعدة البيانات في الإنتاج
5. تحديث متغيرات البيئة

## 📞 الدعم والمساعدة

للحصول على المساعدة أو الإبلاغ عن مشاكل:
- راجع ملف `README.md` للإرشادات الأساسية
- راجع ملف `QUICK_START.md` للبدء السريع
- تحقق من سجلات الخادم للأخطاء
- استخدم أدوات المطور في المتصفح لتتبع مشاكل الواجهة 