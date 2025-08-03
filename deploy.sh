#!/bin/bash

echo "🚀 A-K Project Instagram Downloader - Deploy Script"
echo "=================================================="

# Проверяем, установлен ли Vercel CLI
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI не установлен. Устанавливаем..."
    npm install -g vercel
fi

# Проверяем, авторизован ли пользователь
if ! vercel whoami &> /dev/null; then
    echo "🔐 Требуется авторизация в Vercel..."
    vercel login
fi

echo "📦 Подготовка к деплою..."

# Проверяем наличие всех необходимых файлов
required_files=("index.html" "style.css" "app.js" "webgl.js" "server.py" "snapsave_downloader.py" "requirements.txt" "vercel.json" "api/index.py")

for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        echo "❌ Отсутствует файл: $file"
        exit 1
    fi
done

echo "✅ Все файлы на месте"

# Создаем .gitignore если его нет
if [ ! -f ".gitignore" ]; then
    echo "📝 Создаем .gitignore..."
    cat > .gitignore << EOF
# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
venv/
env/
ENV/

# Vercel
.vercel

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db
EOF
fi

echo "🚀 Запуск деплоя на Vercel..."
vercel --prod

echo "✅ Деплой завершен!"
echo "🌐 Ваш сайт доступен по ссылке выше"
echo ""
echo "📋 Что дальше:"
echo "1. Скопируйте URL из вывода выше"
echo "2. Протестируйте функциональность"
echo "3. Настройте кастомный домен в Vercel Dashboard"
echo ""
echo "🎉 A-K Project готов к использованию!" 