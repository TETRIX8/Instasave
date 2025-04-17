import os
import random
import requests
import snapsave_downloader
import nest_asyncio
from telegram import Update
from telegram.ext import ApplicationBuilder, CommandHandler, MessageHandler, ContextTypes
from telegram.ext import filters
import re
import json
from datetime import datetime

# Применяем nest_asyncio
nest_asyncio.apply()

API_TOKEN = '8175382946:AAEojtokkTqyvYCZQUv0RR6oMX1gJQW2hMk'  # Замените на ваш токен
ADMIN_IDS = [5045561884]  # Замените на ваш ID администратора

# Путь к файлу с данными пользователей
USERS_FILE = 'users.json'

# Словарь для хранения состояния каждого пользователя
user_state = {}

# Список стикеров
STICKERS = [
    "CAACAgIAAxkBAAEOUnVoAXW8algg-cglzasyJI3o9DNGwgACTgIAAladvQow_mttgTIDbzYE",
    "CAACAgIAAxkBAAENB5dnIA2XPTs40pOjKDjMQOtIh-UtjwACTgADWbv8JQ3rz9n50HgqNgQ"
]

def load_users():
    """Загружает данные пользователей из файла"""
    default_data = {
        "users": [],
        "stats": {
            "total_users": 0,
            "last_update": str(datetime.now())
        }
    }
    
    try:
        if os.path.exists(USERS_FILE):
            with open(USERS_FILE, 'r') as f:
                data = json.load(f)
                # Проверяем структуру данных
                if "users" not in data or "stats" not in data:
                    return default_data
                return data
    except Exception as e:
        print(f"Ошибка загрузки файла пользователей: {e}")
    
    return default_data

def save_users(users_data):
    """Сохраняет данные пользователей в файл"""
    try:
        with open(USERS_FILE, 'w') as f:
            json.dump(users_data, f, indent=4)
    except Exception as e:
        print(f"Ошибка сохранения файла пользователей: {e}")

def add_user(user_id, username):
    """Добавляет нового пользователя в базу"""
    users_data = load_users()
    
    # Проверяем, есть ли уже такой пользователь
    if not any(user['id'] == user_id for user in users_data["users"]):
        users_data["users"].append({
            "id": user_id,
            "username": username or "нет username",
            "first_seen": str(datetime.now()),
            "last_activity": str(datetime.now())
        })
        users_data["stats"]["total_users"] = len(users_data["users"])
        users_data["stats"]["last_update"] = str(datetime.now())
        save_users(users_data)

async def send_random_sticker(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Отправляет случайный стикер"""
    sticker_id = random.choice(STICKERS)
    await update.message.reply_sticker(sticker_id)

def download_video(url):
    try:
        response = requests.get(url, stream=True)
        if response.status_code == 200:
            return response.content
        else:
            print("Не удалось скачать видео. HTTP статус:", response.status_code)
            return None
    except Exception as e:
        print(f"Произошла ошибка: {e}")
        return None

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Обработчик команды /start"""
    user = update.message.from_user
    add_user(user.id, user.username)
    
    beautiful_text = """
✨ Добро пожаловать в Instagram Downloader Bot! ✨

Я помогу вам скачать:
• Видео из Instagram 🎥
• Фото из Instagram 📸
• Истории из Instagram 🎞️

Просто отправьте мне ссылку на публикацию, и я мгновенно загружу её для вас!

👇 Отправьте ссылку сейчас 👇
"""
    await update.message.reply_text(beautiful_text)
    await send_random_sticker(update, context)

def is_instagram_url(url):
    instagram_pattern = r'https?://(www\.)?(instagram\.com|instagr\.am)/.*'
    return re.match(instagram_pattern, url) is not None

async def handle_video_url(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    user = update.message.from_user
    add_user(user.id, user.username)
    
    user_id = user.id
    
    if user_id in user_state and user_state[user_id] == "processing":
        await update.message.reply_text("⏳ Пожалуйста, подождите, пока я загружаю первое видео...")
        return

    user_state[user_id] = "processing"

    instagram_video_url = update.message.text
    await update.message.reply_text("🔍 Анализирую вашу ссылку...")
    await send_random_sticker(update, context)

    if not is_instagram_url(instagram_video_url):
        await update.message.reply_text("❌ Пожалуйста, отправьте корректную ссылку на контент из Instagram.")
        user_state[user_id] = "idle"
        return

    print(f"Обработка ссылки на видео: {instagram_video_url}")
    download_url = snapsave_downloader.SnapSave(instagram_video_url)

    if download_url:
        print(f"Ссылка для скачивания: {download_url}")
        video_content = download_video(download_url)
        
        if video_content:
            beautiful_caption = """
✅ Ваше видео готово!

Спасибо, что используете нашего бота! 
Если вам понравился сервис, поделитесь им с друзьями 😊

#Instagram #Downloader #Bot
"""
            await update.message.reply_video(video=video_content, caption=beautiful_caption)
        else:
            await update.message.reply_text("❌ Не удалось скачать видео. Попробуйте другую ссылку.")
    else:
        await update.message.reply_text("""
⚠️ Ошибка загрузки

Возможные причины:
1. Ссылка неверна
2. Контент приватный
3. Проблемы с сервером

Попробуйте ещё раз или свяжитесь с поддержкой.
""")

    user_state[user_id] = "idle"

async def admin_panel(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Админ-панель с различными функциями"""
    user = update.message.from_user
    
    if user.id not in ADMIN_IDS:
        await update.message.reply_text("🚫 У вас нет доступа к этой команде.")
        return
    
    admin_text = """
👑 Админ-панель 👑

Выберите действие:
1. /stats - Статистика бота
2. /broadcast - Сделать рассылку
3. /export_users - Экспорт пользователей
4. /admin_help - Помощь по админ-командам
"""
    await update.message.reply_text(admin_text)

async def admin_help(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Помощь по админ-командам"""
    user = update.message.from_user
    
    if user.id not in ADMIN_IDS:
        await update.message.reply_text("🚫 У вас нет доступа к этой команде.")
        return
    
    help_text = """
ℹ️ Помощь по админ-командам ℹ️

/stats - Показывает статистику бота:
  - Всего пользователей
  - Активность

/broadcast - Рассылка сообщения всем пользователям:
  Пример: /broadcast Привет всем! Это тестовая рассылка.

/export_users - Экспорт списка пользователей в файл

/admin_help - Показывает это сообщение
"""
    await update.message.reply_text(help_text)

async def bot_stats(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Показывает статистику бота"""
    user = update.message.from_user
    
    if user.id not in ADMIN_IDS:
        await update.message.reply_text("🚫 У вас нет доступа к этой команде.")
        return
    
    users_data = load_users()
    
    stats_text = f"""
📊 Статистика бота 📊

👥 Всего пользователей: {users_data["stats"]["total_users"]}
🔄 Последнее обновление: {users_data["stats"]["last_update"]}

📈 Последние 5 пользователей:
"""
    
    last_users = users_data["users"][-5:] if len(users_data["users"]) > 5 else users_data["users"]
    for i, user in enumerate(reversed(last_users), 1):
        username = user.get('username', 'нет username')
        stats_text += f"\n{i}. @{username} (ID: {user['id']}) - {user['first_seen']}"
    
    await update.message.reply_text(stats_text)

async def broadcast_message(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Рассылает сообщение всем пользователям"""
    user = update.message.from_user
    
    if user.id not in ADMIN_IDS:
        await update.message.reply_text("🚫 У вас нет доступа к этой команде.")
        return
    
    if not context.args:
        await update.message.reply_text("ℹ️ Использование: /broadcast ваше сообщение")
        return
    
    message = ' '.join(context.args)
    users_data = load_users()
    total = len(users_data["users"])
    success = 0
    failed = 0
    
    await update.message.reply_text(f"⏳ Начинаю рассылку для {total} пользователей...")
    
    for user in users_data["users"]:
        try:
            await context.bot.send_message(chat_id=user['id'], text=message)
            success += 1
        except Exception as e:
            print(f"Ошибка отправки сообщения пользователю {user['id']}: {e}")
            failed += 1
    
    report_text = f"""
📨 Отчет о рассылке 📨

✅ Успешно отправлено: {success}
❌ Не удалось отправить: {failed}
📊 Всего пользователей: {total}
"""
    await update.message.reply_text(report_text)

async def export_users(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Экспортирует список пользователей в файл"""
    user = update.message.from_user
    
    if user.id not in ADMIN_IDS:
        await update.message.reply_text("🚫 У вас нет доступа к этой команде.")
        return
    
    users_data = load_users()
    with open('users_export.txt', 'w') as f:
        for user in users_data["users"]:
            username = user.get('username', 'нет username')
            f.write(f"ID: {user['id']}, Username: @{username}, First seen: {user['first_seen']}\n")
    
    await update.message.reply_document(document=open('users_export.txt', 'rb'), caption="📝 Экспорт пользователей")

async def main() -> None:
    application = ApplicationBuilder().token(API_TOKEN).build()

    # Обработчики команд
    application.add_handler(CommandHandler("start", start))
    application.add_handler(CommandHandler("admin", admin_panel))
    application.add_handler(CommandHandler("admin_help", admin_help))
    application.add_handler(CommandHandler("stats", bot_stats))
    application.add_handler(CommandHandler("broadcast", broadcast_message))
    application.add_handler(CommandHandler("export_users", export_users))
    
    # Обработчик текстовых сообщений
    application.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, handle_video_url))

    print("🤖 Бот запущен и готов к работе!")
    await application.run_polling()

if __name__ == '__main__':
    import asyncio
    asyncio.run(main())