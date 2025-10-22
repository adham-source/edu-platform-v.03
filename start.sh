#!/bin/bash

echo "🚀 بدء تشغيل منصة التعلم الذكية..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker غير متاح. يرجى تثبيت وتشغيل Docker أولاً."
    exit 1
fi

# Check if Docker Compose is available
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose غير متاح. يرجى تثبيته أولاً."
    exit 1
fi

echo "📦 بناء وتشغيل الحاويات..."

# Build and start all services
docker-compose up -d --build

echo "⏳ انتظار تشغيل جميع الخدمات..."
sleep 30

echo "🔍 فحص حالة الخدمات..."
docker-compose ps

echo ""
echo "✅ تم تشغيل المنصة بنجاح!"
echo ""
echo "🌐 الروابط المتاحة:"
echo "   📱 Frontend: http://localhost:3000"
echo "   🔧 Backend API: http://localhost:5000"
echo "   📁 MinIO Console: http://localhost:9001"
echo "   🗄️ MongoDB: localhost:27017"
echo ""
echo "🔑 بيانات الدخول الافتراضية:"
echo "   MinIO: minioadmin/minioadmin"
echo "   MongoDB: admin/password"
echo ""
echo "🔐 Auth0 Configuration:"
echo "   يرجى تكوين Auth0 في ملف .env قبل الاستخدام"
echo ""
echo "📋 لإيقاف المنصة: ./stop.sh"
echo "📋 لعرض السجلات: docker-compose logs -f"
echo ""
echo "🎉 استمتع بالتعلم!"