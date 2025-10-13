# إعداد Keycloak للمنصة التعليمية

## 1. الوصول إلى Keycloak Admin Console
- افتح http://localhost:8080
- سجل دخول بـ: admin / admin

## 2. إنشاء Realm جديد
1. اضغط على "Create Realm"
2. اسم الـ Realm: `edu-platform`
3. اضغط "Create"

## 3. إنشاء Clients

### Frontend Client
1. اذهب إلى Clients → Create Client
2. Client ID: `edu-platform-frontend`
3. Client Type: `OpenID Connect`
4. اضغط Next
5. Client authentication: OFF
6. Authorization: OFF
7. Standard flow: ON
8. Direct access grants: ON
9. اضغط Save
10. في تبويب Settings:
    - Valid redirect URIs: `http://localhost:3000/*`
    - Valid post logout redirect URIs: `http://localhost:3000/*`
    - Web origins: `http://localhost:3000`

### Backend Client
1. اذهب إلى Clients → Create Client
2. Client ID: `edu-platform-backend`
3. Client Type: `OpenID Connect`
4. اضغط Next
5. Client authentication: ON
6. Authorization: OFF
7. Service accounts roles: ON
8. اضغط Save
9. اذهب إلى تبويب Credentials وانسخ Client Secret

## 4. إنشاء Realm Roles
1. اذهب إلى Realm Roles
2. أنشئ الأدوار التالية:
   - `admin` - مدير النظام
   - `teacher` - مدرس
   - `student` - طالب

## 5. إنشاء المستخدمين

### مدير النظام
1. اذهب إلى Users → Add User
2. Username: `admin`
3. Email: `admin@edu-platform.com`
4. First name: `System`
5. Last name: `Administrator`
6. Email verified: ON
7. اضغط Create
8. اذهب إلى تبويب Credentials
9. اضبط كلمة مرور: `admin123`
10. Temporary: OFF
11. اذهب إلى تبويب Role mapping
12. أضف role: `admin`

### مدرس تجريبي
1. اذهب إلى Users → Add User
2. Username: `teacher1`
3. Email: `teacher@edu-platform.com`
4. First name: `أحمد`
5. Last name: `المدرس`
6. Email verified: ON
7. اضغط Create
8. اضبط كلمة مرور: `teacher123`
9. أضف role: `teacher`

### طالب تجريبي
1. اذهب إلى Users → Add User
2. Username: `student1`
3. Email: `student@edu-platform.com`
4. First name: `محمد`
5. Last name: `الطالب`
6. Email verified: ON
7. اضغط Create
8. اضبط كلمة مرور: `student123`
9. أضف role: `student`

## 6. إعدادات إضافية

### تخصيص صفحة تسجيل الدخول
1. اذهب إلى Realm Settings → Themes
2. Login theme: اختر theme مناسب أو اتركه default

### إعدادات الأمان
1. اذهب إلى Realm Settings → Security Defenses
2. فعّل Brute Force Detection
3. اضبط Max Login Failures: 5
4. اضبط Wait Increment: 60 seconds

### إعدادات الجلسة
1. اذهب إلى Realm Settings → Sessions
2. SSO Session Idle: 30 minutes
3. SSO Session Max: 10 hours

## 7. اختبار الإعداد
1. افتح http://localhost:3000
2. جرب تسجيل الدخول بالمستخدمين المختلفين
3. تأكد من ظهور الأدوار الصحيحة في واجهة المستخدم

## ملاحظات مهمة
- احفظ Client Secret للـ backend client في ملف .env
- تأكد من صحة الـ redirect URIs
- يمكنك إضافة المزيد من المستخدمين حسب الحاجة
- لا تنس تحديث كلمات المرور في بيئة الإنتاج