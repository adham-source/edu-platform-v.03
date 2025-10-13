#!/bin/bash

echo "🚀 تشغيل المنصة التعليمية (بدون Docker)..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js غير مثبت. يرجى تثبيته أولاً."
    exit 1
fi

echo "📦 تثبيت dependencies..."

# Install backend dependencies
if [ -d "backend" ] && [ -f "backend/package.json" ]; then
    echo "📦 تثبيت backend dependencies..."
    cd backend && npm install && cd ..
fi

# Install frontend dependencies
if [ -d "frontend" ] && [ -f "frontend/package.json" ]; then
    echo "📦 تثبيت frontend dependencies..."
    cd frontend && npm install && cd ..
fi

echo "🔧 بناء المشروع..."

# Build backend
if [ -d "backend" ]; then
    echo "🔧 بناء Backend..."
    cd backend && npm run build && cd ..
fi

# Build frontend
if [ -d "frontend" ]; then
    echo "🔧 بناء Frontend..."
    cd frontend && npm run build && cd ..
fi

echo "🌐 تشغيل Frontend على المنفذ 12000..."
cd frontend && serve -s dist -l 12000 > frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

echo "⏳ انتظار تشغيل Frontend..."
sleep 3

echo ""
echo "✅ تم تشغيل المنصة بنجاح!"
echo ""
echo "🌐 الروابط المتاحة:"
echo "   📱 Frontend: https://work-1-gwkffsfukjvsenss.prod-runtime.all-hands.dev"
echo ""
echo "📋 ملاحظات:"
echo "   - يحتاج Backend إلى MongoDB و Keycloak للعمل بشكل كامل"
echo "   - يمكنك تشغيل Backend منفصلاً عند توفر قواعد البيانات"
echo "   - لإيقاف Frontend: kill $FRONTEND_PID"
echo ""
echo "🎉 استمتع بالتعلم!"