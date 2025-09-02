#!/bin/bash

echo "🚀 Запуск локального окружения Park Hotel"
echo ""
echo "📦 Устанавливаем зависимости..."
npm install

echo ""
echo "🔧 Запуск Convex в dev режиме..."
npx convex dev &
CONVEX_PID=$!

echo ""
echo "⏳ Ждем запуска Convex..."
sleep 5

echo ""
echo "🌐 Запуск Next.js..."
npm run dev &
NEXT_PID=$!

echo ""
echo "✅ Все запущено!"
echo ""
echo "📍 Сайт доступен на: http://localhost:3000"
echo "📍 Админка туров: http://localhost:3000/admin/tours"
echo "📍 Админка номеров: http://localhost:3000/admin/spaces"
echo ""
echo "📝 Для остановки нажмите Ctrl+C"
echo ""
echo "🔍 КОНСОЛЬ ЛОГИ БУДУТ ВИДНЫ ЗДЕСЬ!"
echo "=================================="
echo ""

# Ожидаем завершения
wait $CONVEX_PID $NEXT_PID