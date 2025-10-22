# إعداد Auth0 للمنصة التعليمية

## 🔐 خطوات إعداد Auth0

### 1. إنشاء حساب Auth0
1. اذهب إلى [Auth0.com](https://auth0.com)
2. أنشئ حساب جديد أو سجل دخول
3. أنشئ Tenant جديد

### 2. إعداد Application للـ Frontend
1. اذهب إلى Applications > Create Application
2. اختر "Single Page Application"
3. اختر React كـ Technology
4. في الإعدادات:
   - **Allowed Callback URLs**: `http://localhost:3000/callback`
   - **Allowed Logout URLs**: `http://localhost:3000`
   - **Allowed Web Origins**: `http://localhost:3000`
   - **Allowed Origins (CORS)**: `http://localhost:3000`

### 3. إعداد API للـ Backend
1. اذهب إلى APIs > Create API
2. أدخل:
   - **Name**: Educational Platform API
   - **Identifier**: `https://edu-platform-api.com`
   - **Signing Algorithm**: RS256

### 4. إعداد الأدوار (Roles)
1. اذهب إلى User Management > Roles
2. أنشئ الأدوار التالية:
   - **student**: للطلاب
   - **teacher**: للمدرسين
   - **admin**: للمدراء

### 5. إعداد Rules (اختياري)
يمكنك إنشاء Rules لإضافة الأدوار إلى JWT Token:

```javascript
function addRolesToToken(user, context, callback) {
  const namespace = 'https://edu-platform.com/';
  const assignedRoles = (context.authorization || {}).roles;

  let idTokenClaims = context.idToken || {};
  let accessTokenClaims = context.accessToken || {};

  idTokenClaims[`${namespace}roles`] = assignedRoles;
  accessTokenClaims[`${namespace}roles`] = assignedRoles;

  context.idToken = idTokenClaims;
  context.accessToken = accessTokenClaims;

  callback(null, user, context);
}
```

### 6. إنشاء مستخدمين تجريبيين
1. اذهب إلى User Management > Users
2. أنشئ مستخدمين جدد
3. أعطهم الأدوار المناسبة

### 7. الحصول على المعلومات المطلوبة
من Application Settings:
- **Domain**: `your-domain.auth0.com`
- **Client ID**: `your-client-id`
- **Client Secret**: `your-client-secret` (للـ Backend فقط)

من API Settings:
- **Audience**: `https://edu-platform-api.com`

### 8. تحديث ملف .env
```env
# Auth0 Configuration
AUTH0_DOMAIN=your-domain.auth0.com
AUTH0_CLIENT_ID=your-client-id
AUTH0_CLIENT_SECRET=your-client-secret
AUTH0_AUDIENCE=https://edu-platform-api.com
AUTH0_ISSUER=https://your-domain.auth0.com/

# Frontend Auth0 Configuration
VITE_AUTH0_DOMAIN=your-domain.auth0.com
VITE_AUTH0_CLIENT_ID=your-client-id
```

## 🔧 اختبار الإعداد

### 1. تشغيل المشروع
```bash
docker-compose up -d
```

### 2. فتح التطبيق
- اذهب إلى `http://localhost:3000`
- جرب تسجيل الدخول
- تأكد من ظهور المعلومات الصحيحة

### 3. اختبار API
```bash
# احصل على Access Token من Auth0
curl -X POST https://your-domain.auth0.com/oauth/token \
  -H 'Content-Type: application/json' \
  -d '{
    "client_id": "your-client-id",
    "client_secret": "your-client-secret",
    "audience": "https://edu-platform-api.com",
    "grant_type": "client_credentials"
  }'

# استخدم التوكن لاختبار API
curl -X GET http://localhost:5000/api/courses \
  -H 'Authorization: Bearer YOUR_ACCESS_TOKEN'
```

## 🚨 ملاحظات أمنية

1. **لا تشارك Client Secret**: احتفظ به آمناً
2. **استخدم HTTPS في الإنتاج**: لا تستخدم HTTP في البيئة الحقيقية
3. **راجع Callback URLs**: تأكد من صحتها
4. **فعل MFA**: للحسابات المهمة
5. **راقب Logs**: في Auth0 Dashboard

## 🔗 روابط مفيدة

- [Auth0 React SDK](https://auth0.com/docs/libraries/auth0-react)
- [Auth0 Node.js SDK](https://auth0.com/docs/libraries/auth0-node)
- [Auth0 Management API](https://auth0.com/docs/api/management/v2)
- [Auth0 Rules](https://auth0.com/docs/rules)