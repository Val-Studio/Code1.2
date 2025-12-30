# PsyConnect - Архитектура платформы для психологов

## Обзор проекта

**PsyConnect** — современная платформа для онлайн-консультаций психологов с клиентами.
Построена на передовых технологиях 2025 года.

## Технологический стек

### Frontend
- **Next.js 15** — React-фреймворк с App Router, Server Components, Server Actions
- **Refine** — headless фреймворк для CRUD операций и управления данными
- **TypeScript 5.x** — строгая типизация
- **Tailwind CSS 4** — стилизация
- **Zustand** — легковесный state management
- **React Query** (через Refine) — серверное состояние
- **LiveKit** — видео/аудио звонки (WebRTC)

### Backend (API Routes + Server Actions)
- **Next.js API Routes** — REST API endpoints
- **Prisma ORM** — работа с БД
- **NextAuth.js v5** — аутентификация
- **Zod** — валидация данных

### Инфраструктура
- **PostgreSQL** — основная БД
- **Redis** — кэширование, сессии, real-time
- **S3/Cloudflare R2** — хранение файлов
- **Stripe** — платежи

---

## Структура проекта

```
psyconnect/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── (auth)/               # Группа маршрутов аутентификации
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   └── layout.tsx
│   │   ├── (dashboard)/          # Личные кабинеты
│   │   │   ├── psychologist/     # Кабинет психолога
│   │   │   │   ├── appointments/
│   │   │   │   ├── clients/
│   │   │   │   ├── schedule/
│   │   │   │   ├── earnings/
│   │   │   │   ├── notes/
│   │   │   │   └── settings/
│   │   │   ├── client/           # Кабинет клиента
│   │   │   │   ├── appointments/
│   │   │   │   ├── psychologists/
│   │   │   │   ├── history/
│   │   │   │   └── settings/
│   │   │   └── layout.tsx
│   │   ├── (marketing)/          # Публичные страницы
│   │   │   ├── page.tsx          # Главная
│   │   │   ├── about/
│   │   │   ├── psychologists/    # Каталог психологов
│   │   │   └── pricing/
│   │   ├── api/                  # API Routes
│   │   │   ├── auth/
│   │   │   ├── appointments/
│   │   │   ├── payments/
│   │   │   ├── chat/
│   │   │   └── video/
│   │   ├── room/[id]/            # Видео-комната
│   │   └── layout.tsx
│   ├── components/
│   │   ├── ui/                   # Базовые UI компоненты
│   │   ├── forms/                # Формы
│   │   ├── dashboard/            # Компоненты дашборда
│   │   ├── video/                # Видео-звонки
│   │   └── chat/                 # Чат-компоненты
│   ├── lib/
│   │   ├── prisma.ts             # Prisma клиент
│   │   ├── auth.ts               # Auth конфигурация
│   │   ├── stripe.ts             # Stripe
│   │   └── livekit.ts            # LiveKit
│   ├── hooks/                    # React хуки
│   ├── providers/                # Context providers
│   ├── types/                    # TypeScript типы
│   ├── utils/                    # Утилиты
│   └── refine/                   # Refine конфигурация
│       ├── data-provider.ts
│       ├── auth-provider.ts
│       └── resources.ts
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── public/
└── docs/
```

---

## Модели данных (Prisma Schema)

### Пользователи
```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  password      String
  role          Role      @default(CLIENT)
  profile       Profile?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

enum Role {
  ADMIN
  PSYCHOLOGIST
  CLIENT
}
```

### Профили
```prisma
model Profile {
  id              String   @id @default(cuid())
  userId          String   @unique
  user            User     @relation(fields: [userId], references: [id])
  firstName       String
  lastName        String
  phone           String?
  avatar          String?
  bio             String?  @db.Text

  // Для психологов
  specializations String[] // Тревожность, депрессия, отношения...
  education       Json?    // Образование
  experience      Int?     // Лет опыта
  price           Int?     // Цена за сессию
  verified        Boolean  @default(false)
  rating          Float?

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

### Записи на приём
```prisma
model Appointment {
  id              String            @id @default(cuid())
  psychologistId  String
  clientId        String
  datetime        DateTime
  duration        Int               @default(60) // минуты
  status          AppointmentStatus @default(PENDING)
  type            AppointmentType   @default(VIDEO)
  price           Int
  notes           String?           @db.Text

  psychologist    User              @relation("PsychologistAppointments")
  client          User              @relation("ClientAppointments")
  payment         Payment?

  createdAt       DateTime          @default(now())
  updatedAt       DateTime          @updatedAt
}

enum AppointmentStatus {
  PENDING
  CONFIRMED
  IN_PROGRESS
  COMPLETED
  CANCELLED
}

enum AppointmentType {
  VIDEO
  AUDIO
  CHAT
}
```

### Платежи
```prisma
model Payment {
  id            String        @id @default(cuid())
  appointmentId String        @unique
  amount        Int
  status        PaymentStatus @default(PENDING)
  stripeId      String?

  appointment   Appointment   @relation(fields: [appointmentId], references: [id])

  createdAt     DateTime      @default(now())
}

enum PaymentStatus {
  PENDING
  COMPLETED
  REFUNDED
  FAILED
}
```

### Сообщения
```prisma
model Message {
  id          String   @id @default(cuid())
  senderId    String
  receiverId  String
  content     String   @db.Text
  read        Boolean  @default(false)

  sender      User     @relation("SentMessages")
  receiver    User     @relation("ReceivedMessages")

  createdAt   DateTime @default(now())
}
```

### Заметки психолога
```prisma
model ClientNote {
  id              String   @id @default(cuid())
  psychologistId  String
  clientId        String
  content         String   @db.Text
  isPrivate       Boolean  @default(true)

  psychologist    User     @relation("PsychologistNotes")
  client          User     @relation("ClientNotes")

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

### Расписание психолога
```prisma
model Schedule {
  id              String   @id @default(cuid())
  psychologistId  String
  dayOfWeek       Int      // 0-6
  startTime       String   // "09:00"
  endTime         String   // "18:00"
  isAvailable     Boolean  @default(true)

  psychologist    User     @relation(fields: [psychologistId], references: [id])
}
```

### Отзывы
```prisma
model Review {
  id              String   @id @default(cuid())
  psychologistId  String
  clientId        String
  appointmentId   String   @unique
  rating          Int      // 1-5
  comment         String?  @db.Text

  psychologist    User     @relation("PsychologistReviews")
  client          User     @relation("ClientReviews")

  createdAt       DateTime @default(now())
}
```

---

## Функционал по ролям

### Клиент
- Регистрация/авторизация
- Поиск психологов (фильтры: специализация, цена, рейтинг)
- Просмотр профиля психолога
- Запись на консультацию
- Видео/аудио консультации
- Чат с психологом
- Оплата консультаций
- История консультаций
- Оставление отзывов
- Управление профилем
- Уведомления

### Психолог
- Регистрация с верификацией
- Управление профилем (специализации, образование, цены)
- Управление расписанием
- Просмотр и управление записями
- Проведение видео/аудио консультаций
- Чат с клиентами
- Заметки о клиентах (приватные)
- Статистика и аналитика доходов
- Вывод средств
- Уведомления

### Администратор
- Управление пользователями
- Верификация психологов
- Модерация отзывов
- Финансовая аналитика
- Настройки платформы

---

## API Endpoints

### Аутентификация
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/refresh
GET    /api/auth/me
```

### Пользователи/Профили
```
GET    /api/users/me
PUT    /api/users/me
GET    /api/psychologists
GET    /api/psychologists/:id
```

### Записи
```
GET    /api/appointments
POST   /api/appointments
GET    /api/appointments/:id
PUT    /api/appointments/:id
DELETE /api/appointments/:id
```

### Расписание
```
GET    /api/schedule
POST   /api/schedule
PUT    /api/schedule/:id
DELETE /api/schedule/:id
GET    /api/psychologists/:id/availability
```

### Платежи
```
POST   /api/payments/create-intent
POST   /api/payments/confirm
GET    /api/payments/history
POST   /api/payments/withdraw (для психологов)
```

### Чат
```
GET    /api/messages/:conversationId
POST   /api/messages
GET    /api/conversations
```

### Видео
```
POST   /api/video/create-room
GET    /api/video/token
```

### Отзывы
```
GET    /api/reviews/psychologist/:id
POST   /api/reviews
```

---

## Безопасность

1. **Аутентификация**: NextAuth.js v5 с JWT токенами
2. **Авторизация**: Middleware для проверки ролей
3. **Валидация**: Zod схемы на всех endpoints
4. **Rate Limiting**: Redis-based
5. **HTTPS**: Обязательно в продакшене
6. **Шифрование**: Пароли с bcrypt, данные в БД
7. **CORS**: Настроенные политики
8. **CSP**: Content Security Policy

---

## Интеграции

1. **Stripe** — прием платежей, вывод средств
2. **LiveKit** — видео/аудио звонки (WebRTC)
3. **SendGrid/Resend** — email уведомления
4. **Cloudflare R2/S3** — хранение файлов
5. **Redis** — кэширование, real-time

---

## Этапы разработки

### Этап 1: Фундамент ✓
- [x] Архитектурная документация
- [ ] Инициализация Next.js 15
- [ ] Настройка Refine
- [ ] Prisma + PostgreSQL
- [ ] Базовая аутентификация

### Этап 2: Профили и каталог
- [ ] Модели профилей
- [ ] Страница поиска психологов
- [ ] Профиль психолога
- [ ] Профиль клиента

### Этап 3: Записи
- [ ] Система расписания
- [ ] Бронирование
- [ ] Управление записями

### Этап 4: Коммуникации
- [ ] Чат-система
- [ ] Видео-звонки
- [ ] Уведомления

### Этап 5: Платежи
- [ ] Stripe интеграция
- [ ] Оплата консультаций
- [ ] Вывод средств

### Этап 6: Полировка
- [ ] Админ-панель
- [ ] Аналитика
- [ ] Тестирование
- [ ] Оптимизация

---

*Документ создан: 2025-12-30*
*Версия: 1.0*
