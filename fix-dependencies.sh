#!/bin/bash

echo "🔧 إصلاح مشكلة Dependencies..."

# Navigate to backend directory
cd backend

echo "📦 تثبيت Dependencies..."
npm install

echo "🔧 بناء Backend..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ تم إصلاح المشكلة بنجاح!"
    echo ""
    echo "🚀 يمكنك الآن تشغيل Backend بـ:"
    echo "   cd backend && npm run dev"
    echo "   أو"
    echo "   cd backend && npm start"
    echo ""
    echo "🌐 Frontend متاح على:"
    echo "   https://work-1-gwkffsfukjvsenss.prod-runtime.all-hands.dev"
else
    echo "❌ حدث خطأ أثناء البناء. تحقق من الأخطاء أعلاه."
    exit 1
fi