#!/bin/bash

echo "🛠️ تشغيل المنصة في وضع التطوير..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js غير مثبت. يرجى تثبيته أولاً."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm غير متاح. يرجى تثبيت Node.js مع npm."
    exit 1
fi

echo "📦 تثبيت dependencies..."

# Install root dependencies
if [ -f "package.json" ]; then
    npm install
fi

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

echo "🚀 تشغيل الخدمات الأساسية..."

# Start infrastructure services only
docker-compose up -d mongo keycloak-db keycloak minio

echo "⏳ انتظار تشغيل الخدمات الأساسية..."
sleep 20

echo "🔍 فحص حالة الخدمات..."
docker-compose ps

echo ""
echo "✅ الخدمات الأساسية جاهزة!"
echo ""
echo "🌐 الروابط المتاحة:"
echo "   🔐 Keycloak: http://localhost:8080"
echo "   📁 MinIO Console: http://localhost:9001"
echo "   🗄️ MongoDB: localhost:27017"
echo ""
echo "🔑 بيانات الدخول:"
echo "   Keycloak Admin: admin/admin"
echo "   MinIO: minioadmin/minioadmin"
echo "   MongoDB: admin/password"
echo ""
echo "🛠️ لتشغيل Backend: cd backend && npm run dev"
echo "🛠️ لتشغيل Frontend: cd frontend && npm run dev"
echo ""
echo "📋 لإيقاف الخدمات: docker-compose down"