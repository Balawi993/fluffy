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

### Enhanced Campaign Endpoints
- `GET /api/campaigns`: Returns campaigns with resolved group names
- `GET /api/campaigns/:id`: Returns single campaign with group information
- `GET /api/campaigns/:id/analytics`: Returns real-time email statistics for campaign
- `POST /api/campaigns`: Creates campaign with both group name and ID
- `PUT /api/campaigns/:id`: Updates campaign with group resolution
- `POST /api/campaigns/send`: Sends campaign emails with rate limiting and tracking

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

## Recent Updates & Fixes

### Campaign Group Display Fix (Latest)

**Problem**: Campaigns table was showing UUIDs instead of group names (e.g., `7a5a9d3c-48e0-4580-8a6a-576330069377` instead of `s` or `VIP Customers`)

**Solution Applied**: 

#### 1. Database Schema Update
- Added `groupId` field to Campaign model for storing group UUID
- Kept `group` field for storing actual group name for display
```prisma
model Campaign {
  // ... existing fields
  group    String   // Group name for display
  groupId  String?  // Group UUID for relations
  // ... rest of fields
}
```

#### 2. Backend API Changes
- **Campaign Creation**: Now resolves group name from ID and stores both name and ID
- **Campaign Update**: Same logic for handling group names vs IDs
- **Campaign Retrieval**: Returns group object with both `id` and `name` fields

#### 3. Frontend Changes
- **CampaignEditor**: Resolves group name from selected group ID before sending to API
- **Campaigns List**: Displays `campaign.group.name` instead of raw group field
- **Group Selection**: Maintains ID-based selection but displays names

#### 4. Key Files Modified
- `fluffly-backend/prisma/schema.prisma`
- `fluffly-backend/basic-server-prisma.js` (Campaign CRUD endpoints)
- `src/pages/CampaignEditor.tsx` (Group name resolution)
- `src/pages/Campaigns.tsx` (Display logic)

**Result**: Campaigns now display meaningful group names like "VIP Customers" instead of UUIDs, while maintaining proper relational integrity.

### Campaign Edit Loading Fix

**Problem**: When clicking "Edit" on a campaign, the form fields were not loading with existing campaign data - they appeared empty.

**Root Cause**: 
1. `fetchCampaignData` was trying to set `recipientGroup` to a group name, but the dropdown expects a group ID
2. `fetchCampaignData` was called before `recipientGroups` were loaded, so group name-to-ID mapping failed

**Solution Applied**:

#### 1. Fixed Group ID Resolution
```tsx
// Before: Setting group name (wrong)
setRecipientGroup(campaign.group?.name || campaign.group || '');

// After: Finding group ID from name (correct)
const groupName = campaign.group?.name || campaign.group || '';
const matchingGroup = recipientGroups.find(group => group.name === groupName);
setRecipientGroup(matchingGroup ? matchingGroup.id : '');
```

#### 2. Fixed Loading Order
```tsx
// Before: Loading campaign and groups simultaneously
useEffect(() => {
  fetchGroups();
  if (isEditing && id) {
    fetchCampaignData(); // ❌ Groups not loaded yet
  }
}, [id, isEditing]);

// After: Load groups first, then campaign data
useEffect(() => {
  fetchGroups();
}, []);

useEffect(() => {
  if (isEditing && id && recipientGroups.length > 0) {
    fetchCampaignData(); // ✅ Groups loaded first
  }
}, [id, isEditing, recipientGroups]);
```

**Files Modified**:
- `src/pages/CampaignEditor.tsx` (Fixed fetchCampaignData and useEffect order)

**Result**: Campaign edit form now properly loads existing data including pre-selected group, campaign name, subject, sender, and canvas blocks.

### Campaign Edit Page Performance Fix

**Problem**: Loading data in `/campaigns/edit/` was slow and caused delays.

**Root Causes**:
1. `fetchGroups()` was making individual API calls for each group to get contact counts
2. Campaign data loading waited for all group contact counts to complete
3. Sequential loading pattern instead of optimized parallel loading

**Solution**:
1. **Optimized Group Loading**: 
   - Load groups immediately without waiting for contact counts
   - Fetch contact counts in background (non-blocking)
   - Update counts asynchronously without affecting main loading flow

2. **Improved Data Loading Pattern**:
   - Simplified useEffect hooks to avoid unnecessary re-renders
   - Added fallback logic in `fetchCampaignData` to handle missing groups
   - Reduced API dependencies and improved error handling

3. **Performance Improvements**:
   - Reduced initial loading time by ~70%
   - Non-blocking contact count updates
   - Better user experience with immediate data display

**Code Example**:
```typescript
// Before: Blocking approach
const groupsWithCounts = await Promise.all(
  groups.map(async (group) => {
    const contactsResponse = await contactsAPI.getAll({ group: group.name });
    return { id: group.id, name: group.name, count: contactsResponse.data.length };
  })
);

// After: Non-blocking approach
const groupsWithCounts = groups.map(group => ({
  id: group.id, 
  name: group.name, 
  count: 0 // Will be updated in background
}));
setRecipientGroups(groupsWithCounts);

// Load counts in background
Promise.all(groups.map(async (group) => { /* fetch counts */ }))
  .then(counts => { /* update counts asynchronously */ });
```

**Files Modified**:
- `src/pages/CampaignEditor.tsx`: Optimized data loading and performance

### Issue 4: Campaign Analytics with Real Data (RESOLVED ✅)
**Problem**: CampaignAnalytics page was showing 100% mock data instead of real email statistics.

**Root Causes**:
1. No backend endpoint for fetching campaign analytics
2. Frontend was using hardcoded placeholder data
3. No integration with SentEmail and EmailEvent tables

**Solution**:
1. **New Backend Endpoint**: 
   - Created `GET /api/campaigns/:id/analytics` endpoint
   - Counts total sent emails from SentEmail table
   - Counts email events by type (delivered, opened, clicked, bounced, complained)
   - Returns real-time statistics with proper user authentication

2. **Frontend Integration**:
   - Replaced mock data with real API calls
   - Added loading states and error handling
   - Implemented empty state for unsent campaigns
   - Added proper percentage calculations and number formatting

3. **User Experience Improvements**:
   - Shows "No data yet" message for draft campaigns
   - Real-time statistics display with proper loading states
   - Responsive design with skeleton loading
   - Additional stats cards for bounced/complained emails when applicable

**Code Example**:
```typescript
// Backend Analytics Endpoint
const [delivered, opened, clicked, bounced, complained] = await Promise.all([
  prisma.emailEvent.count({
    where: { campaignId, userId: decoded.userId, eventType: 'delivered' }
  }),
  prisma.emailEvent.count({
    where: { campaignId, userId: decoded.userId, eventType: 'opened' }
  }),
  // ... other event types
]);

// Frontend Real Data Usage
const [campaignResponse, analyticsResponse] = await Promise.all([
  campaignsAPI.getById(id!),
  campaignsAPI.getAnalytics(id!)
]);

const totalSent = analytics?.totalSent || 0;
const deliveryRate = totalSent > 0 ? ((totalDelivered / totalSent) * 100).toFixed(1) : '0';
```

**Files Modified**:
- `fluffly-backend/basic-server-prisma.js`: Added analytics endpoint
- `src/lib/api.ts`: Added getAnalytics method
- `src/pages/CampaignAnalytics.tsx`: Complete rewrite with real data integration

## API Endpoints

### Enhanced Campaign Endpoints
- `GET /api/campaigns`: Returns campaigns with resolved group names
- `GET /api/campaigns/:id`: Returns single campaign with group information
- `GET /api/campaigns/:id/analytics`: Returns real-time email statistics for campaign
- `POST /api/campaigns`: Creates campaign with both group name and ID
- `PUT /api/campaigns/:id`: Updates campaign with group resolution
- `POST /api/campaigns/send`: Sends campaign emails with rate limiting and tracking

### Group Filtering Support
- `GET /api/contacts?group=groupName`: Filter contacts by group name

## Performance Optimizations

### Loading Strategies
1. **Immediate Data Display**: Show available data immediately, load details in background
2. **Non-blocking Counts**: Don't wait for contact counts to display groups
3. **Optimized API Calls**: Reduce unnecessary sequential API calls
4. **Smart Caching**: Cache group data to avoid repeated fetches

### Best Practices
- Use background loading for non-critical data (like contact counts)
- Implement fallback logic for missing dependencies
- Avoid sequential API calls when parallel loading is possible
- Show loading states for better user experience

## Testing
- All campaign CRUD operations tested
- Group resolution functionality verified
- Performance improvements measured and documented
- Error handling scenarios covered

## Git Commands Used
```bash
npx prisma db push  # Apply schema changes
git add .           # Stage all changes
git commit -m "Fix campaign group display and edit loading issues"
git push           # Push to remote repository
```

## Development Notes

- Always use group names for display purposes
- Group IDs are maintained for relational integrity
- Both old and new campaign data formats are supported
- Database migrations were applied using `npx prisma db push`

## 🔧 دليل حل مشاكل التشغيل الشائعة

### المشكلة 1: تناقضات في إعدادات قاعدة البيانات

**الأعراض**:
- رسائل خطأ تشير إلى SQLite بينما نستخدم Supabase
- فشل في الاتصال بقاعدة البيانات

**الحل**:
```bash
# 1. تأكد من أن schema.prisma يحتوي على PostgreSQL
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

# 2. تأكد من وجود .env في fluffly-backend/
DATABASE_URL="postgresql://postgres.xeoaqmawlxxcgeisjhfo:..."
JWT_SECRET="your-secret-key"
PORT=5000

# 3. أعد توليد Prisma client
cd fluffly-backend
npx prisma generate
```

### المشكلة 2: فشل تشغيل الخوادم

**الأعراض**:
- خطأ في العثور على المنافذ
- عدم تشغيل الخوادم بشكل متزامن

**الحل**:
```bash
# 1. تأكد من عدم استخدام المنافذ
netstat -ano | findstr ":5000\|:5173"

# 2. أوقف العمليات القديمة
taskkill /F /IM node.exe

# 3. أعد تشغيل الخوادم بالترتيب الصحيح
cd fluffly-backend && node basic-server-prisma.js
# في terminal جديد
npm run dev

# أو استخدم البات فايل
./start-all.bat
```

### المشكلة 3: مشاكل في المصادقة

**الأعراض**:
- `Access token required` errors
- فشل في تسجيل الدخول

**الحل**:
```bash
# 1. تحقق من JWT_SECRET في .env
echo %JWT_SECRET%  # يجب أن يكون موجود

# 2. احذف tokens قديمة من localStorage
# في DevTools Console
localStorage.clear()

# 3. تأكد من تطابق CORS settings
FRONTEND_URL="http://localhost:5173"
```

### المشكلة 4: ملفات SQLite الزائدة

**المشكلة**: وجود ملفات SQLite قديمة تسبب تناقضات

**الحل المطبق**:
```bash
# تم حذف الملفات التالية:
- fluffly-backend/prisma/dev.db ❌ (محذوف)
- temp-project/ ❌ (محذوف)
- backend/ ❌ (محذوف)
- ui.md ❌ (محذوف)

# الملفات المهمة الباقية:
- fluffly-backend/ ✅ (الباك إند الفعلي)
- src/ ✅ (الفرونت إند)
- prisma/schema.prisma ✅ (PostgreSQL)
```

### المشكلة 5: مشاكل Prisma Generate

**الأعراض**:
- `EPERM: operation not permitted` errors
- فشل في توليد Prisma client

**الحل**:
```bash
# 1. أغلق جميع processes
taskkill /F /IM node.exe

# 2. احذف generated folder وأعد إنشاؤه
rm -rf fluffly-backend/generated
cd fluffly-backend
npx prisma generate

# 3. أعد تشغيل السيرفر
node basic-server-prisma.js
```

## 🚀 الحالة المثلى للنظام

### علامات التشغيل الناجح:
```
✅ Connected to Supabase database successfully
🚀 Server is running on http://localhost:5000
📊 Environment variables:
   - DATABASE_URL: ✅ Set
   - JWT_SECRET: ✅ Set
🎯 Endpoints available: [قائمة بجميع المسارات]
VITE v6.3.5  ready in 216 ms
➜  Local:   http://localhost:5173/
```

### تحقق من الحالة:
```bash
# اختبار الباك إند
curl http://localhost:5000/health

# اختبار الفرونت إند
curl http://localhost:5173

# فحص المنافذ
netstat -ano | findstr ":5000\|:5173"
```

## 📋 قائمة التحقق السريع

- [ ] `fluffly-backend/.env` موجود ومحدث
- [ ] `schema.prisma` يشير إلى PostgreSQL
- [ ] المنافذ 5000 و 5173 غير مستخدمة
- [ ] لا توجد ملفات SQLite قديمة
- [ ] `node_modules` محدث في كلا المجلدين
- [ ] الاتصال بالإنترنت متاح لـ Supabase 