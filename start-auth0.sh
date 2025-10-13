#!/bin/bash

echo "🚀 تشغيل المنصة التعليمية مع Auth0..."

# Check if .env exists in frontend
if [ ! -f "frontend/.env" ]; then
    echo "⚠️  ملف .env غير موجود في frontend/"
    echo "📝 يرجى إنشاء ملف .env من .env.example وإضافة معلومات Auth0"
    echo ""
    echo "خطوات الإعداد:"
    echo "1. انسخ frontend/.env.example إلى frontend/.env"
    echo "2. أضف Auth0 Domain و Client ID"
    echo "3. شغل هذا السكريبت مرة أخرى"
    echo ""
    echo "مثال:"
    echo "cp frontend/.env.example frontend/.env"
    echo "# ثم عدل الملف بمعلومات Auth0 الخاصة بك"
    exit 1
fi

# Start backend
echo "🔧 تشغيل Backend..."
cd backend
npm install
npm run build
npm run dev &
BACKEND_PID=$!

# Wait for backend to start
echo "⏳ انتظار تشغيل Backend..."
sleep 5

# Start frontend
echo "🎨 تشغيل Frontend..."
cd ../frontend
npm install
npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ تم تشغيل المنصة بنجاح!"
echo ""
echo "🌐 الروابط:"
echo "   Frontend: http://localhost:5173"
echo "   Backend:  http://localhost:3000"
echo ""
echo "📋 للإيقاف اضغط Ctrl+C"
echo ""

# Wait for user to stop
trap "echo '🛑 إيقاف الخوادم...'; kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait