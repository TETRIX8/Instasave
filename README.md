# A-K Project - Instagram Video Downloader

Красивый веб-сайт для скачивания видео с Instagram с анимацией WebGL и современным дизайном.

## 🚀 Особенности

- ✨ Красивый современный дизайн с WebGL анимацией
- 🎨 Анимированный логотип "A-K Project"
- 📱 Адаптивный дизайн для всех устройств
- ⚡ Быстрая обработка ссылок
- 🔒 Безопасная работа без регистрации
- 💎 Высокое качество скачиваемых видео
- 🌐 Готов к деплою на Vercel

## 🛠️ Технологии

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Python Flask
- **WebGL**: Кастомные шейдеры для анимации
- **Deployment**: Vercel

## 📦 Быстрый старт

### Локальная разработка

1. Клонируйте репозиторий:
```bash
git clone <your-repo-url>
cd instagram-downloader
```

2. Создайте виртуальное окружение:
```bash
python3 -m venv venv
source venv/bin/activate  # Linux/Mac
# или
venv\Scripts\activate  # Windows
```

3. Установите зависимости:
```bash
pip install -r requirements.txt
```

4. Запустите сервер:
```bash
python server.py
```

5. Откройте браузер и перейдите на `http://localhost:5000`

### Деплой на Vercel

#### Автоматический деплой (рекомендуется)

1. Убедитесь, что у вас установлен Node.js и npm
2. Запустите скрипт деплоя:
```bash
./deploy.sh
```

#### Ручной деплой

1. Установите Vercel CLI:
```bash
npm i -g vercel
```

2. Войдите в аккаунт Vercel:
```bash
vercel login
```

3. Деплойте проект:
```bash
vercel --prod
```

## 📁 Структура проекта

```
├── index.html              # Главная страница с WebGL
├── fallback.html           # Версия без WebGL
├── style.css               # Стили
├── app.js                  # Основной JavaScript
├── webgl.js                # WebGL анимация
├── server.py               # Flask сервер для локальной разработки
├── api/index.py            # API для Vercel
├── snapsave_downloader.py  # Ваш Python скрипт
├── requirements.txt        # Python зависимости
├── vercel.json            # Конфигурация Vercel
├── deploy.sh              # Скрипт автоматического деплоя
├── test_api.py            # Тестирование API
└── README.md              # Документация
```

## 🔧 API Endpoints

### POST /api/download
Скачивает видео с Instagram

**Request:**
```json
{
  "url": "https://www.instagram.com/p/..."
}
```

**Response:**
```json
{
  "success": true,
  "downloadUrl": "https://example.com/video.mp4",
  "message": "Download link generated successfully"
}
```

### GET /api/health
Проверка состояния сервера

**Response:**
```json
{
  "status": "healthy",
  "message": "A-K Project Instagram Downloader is running"
}
```

## 🎨 Дизайн

- **Цветовая схема**: Градиенты от синего к фиолетовому
- **Шрифты**: Orbitron для логотипа, Roboto для текста
- **Анимации**: WebGL частицы, CSS transitions
- **Эффекты**: Glassmorphism, backdrop-filter
- **Fallback**: CSS анимации для браузеров без WebGL

## 🌟 Особенности WebGL анимации

- 100 анимированных частиц
- Кастомные vertex и fragment шейдеры
- Плавное движение и изменение размера
- Градиентные цвета от синего к фиолетовому
- Автоматический fallback на CSS анимации

## 📱 Адаптивность

Сайт полностью адаптивен и работает на:
- 🖥️ Десктопы
- 📱 Мобильные устройства
- 📱 Планшеты

## 🔒 Безопасность

- Валидация URL на клиенте и сервере
- CORS настройки для безопасных запросов
- Обработка ошибок с информативными сообщениями
- Защита от XSS и CSRF атак

## 🚀 Производительность

- Оптимизированные WebGL шейдеры
- Минифицированные CSS и JS
- Быстрая загрузка страницы
- Эффективная обработка запросов
- Кэширование статических файлов

## 🧪 Тестирование

### Тест API локально
```bash
python test_api.py
```

### Тест WebGL поддержки
Откройте `fallback.html` в браузере для версии без WebGL.

## 🔧 Настройка

### Изменение цветов
Отредактируйте переменные в `style.css`:
```css
:root {
  --primary-color: #667eea;
  --secondary-color: #764ba2;
  --accent-color: #4ecdc4;
}
```

### Изменение анимации
Настройте параметры в `webgl.js`:
```javascript
this.particleCount = 100; // Количество частиц
this.time += 0.016; // Скорость анимации
```

## 📄 Лицензия

© 2024 A-K Project. Все права защищены.

## 🤝 Поддержка

Если у вас есть вопросы или проблемы:

1. Проверьте консоль браузера на ошибки
2. Убедитесь, что все зависимости установлены
3. Проверьте логи сервера
4. Создайте issue в репозитории

## 🎯 Roadmap

- [ ] Поддержка TikTok
- [ ] Поддержка YouTube
- [ ] Пакетное скачивание
- [ ] Прогресс-бар скачивания
- [ ] Темная тема
- [ ] PWA поддержка

---

**Создано с ❤️ для A-K Project**

### 🚀 Готов к деплою!

Ваш сайт полностью готов к публикации на Vercel. Просто запустите `./deploy.sh` и следуйте инструкциям! 