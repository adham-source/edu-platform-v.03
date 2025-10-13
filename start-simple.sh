#!/bin/bash

echo "🚀 تشغيل المنصة التعليمية (بدون مصادقة)..."

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

# Start frontend with simple auth
echo "🎨 تشغيل Frontend..."
cd ../frontend

# Create simple .env if not exists
if [ ! -f ".env" ]; then
    echo "📝 إنشاء ملف .env بسيط..."
    cat > .env << EOF
REACT_APP_API_URL=http://localhost:3000/api
NODE_ENV=development
REACT_APP_AUTH_MODE=simple
EOF
fi

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
echo "📋 ملاحظة: يعمل بدون مصادقة (للاختبار فقط)"
echo "📋 للإيقاف اضغط Ctrl+C"
echo ""

# Wait for user to stop
trap "echo '🛑 إيقاف الخوادم...'; kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait