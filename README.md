# PsyConnect - Платформа для онлайн-консультаций психологов

Современная платформа для проведения психологических консультаций онлайн.
Построена на Next.js 15, Refine, TypeScript, Prisma и Tailwind CSS.

## Возможности

### Для клиентов
- Поиск психологов по специализации, цене, рейтингу
- Просмотр профилей и отзывов
- Запись на онлайн-консультации
- Видео/аудио звонки через LiveKit
- Чат с психологом
- Онлайн-оплата через Stripe
- История консультаций
- Система уведомлений

### Для психологов
- Личный кабинет с аналитикой
- Управление расписанием
- Список клиентов с заметками
- Проведение видео-консультаций
- Чат с клиентами
- Отслеживание доходов
- Отзывы клиентов

### Для администраторов
- Управление пользователями
- Верификация психологов
- Модерация отзывов
- Финансовая аналитика

## Технологии

- **Frontend**: Next.js 15, React 19, TypeScript
- **UI**: Tailwind CSS 4, Lucide Icons
- **State Management**: Refine, Zustand
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: NextAuth.js v5
- **Video Calls**: LiveKit (WebRTC)
- **Payments**: Stripe
- **Notifications**: Sonner (Toast)

## Установка

1. Клонируйте репозиторий:
```bash
git clone <repository-url>
cd psyconnect
```

2. Установите зависимости:
```bash
npm install
```

3. Создайте файл `.env` на основе `.env.example`:
```bash
cp .env.example .env
```

4. Настройте переменные окружения в `.env`

5. Инициализируйте базу данных:
```bash
npm run db:push
npm run db:seed
```

6. Запустите dev-сервер:
```bash
npm run dev
```

## Тестовые аккаунты

После запуска seed-скрипта доступны следующие аккаунты:

| Роль | Email | Пароль |
|------|-------|--------|
| Админ | admin@psyconnect.ru | admin123 |
| Психолог | anna@psyconnect.ru | password123 |
| Клиент | client@psyconnect.ru | password123 |

## Структура проекта

```
src/
├── app/                  # Next.js App Router
│   ├── (auth)/           # Страницы аутентификации
│   ├── (dashboard)/      # Личные кабинеты
│   ├── api/              # API Routes
│   └── room/             # Видео-комнаты
├── components/           # React компоненты
│   ├── ui/               # Базовые UI компоненты
│   ├── dashboard/        # Компоненты дашборда
│   ├── chat/             # Чат компоненты
│   └── booking/          # Компоненты бронирования
├── lib/                  # Утилиты и конфигурация
├── providers/            # React Context providers
├── refine/               # Refine конфигурация
└── types/                # TypeScript типы
```

## Скрипты

- `npm run dev` - Запуск dev-сервера
- `npm run build` - Сборка для продакшена
- `npm run start` - Запуск продакшен-сервера
- `npm run lint` - Проверка кода
- `npm run db:push` - Применение схемы к БД
- `npm run db:migrate` - Создание миграции
- `npm run db:seed` - Заполнение тестовыми данными
- `npm run db:studio` - Запуск Prisma Studio

## Переменные окружения

| Переменная | Описание |
|------------|----------|
| DATABASE_URL | URL подключения к PostgreSQL |
| AUTH_SECRET | Секретный ключ NextAuth |
| AUTH_URL | URL приложения |
| STRIPE_SECRET_KEY | Секретный ключ Stripe |
| STRIPE_PUBLISHABLE_KEY | Публичный ключ Stripe |
| LIVEKIT_API_KEY | API ключ LiveKit |
| LIVEKIT_API_SECRET | Секрет LiveKit |
| LIVEKIT_URL | URL сервера LiveKit |

## Лицензия

MIT
