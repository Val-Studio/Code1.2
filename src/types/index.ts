// Базовые типы (будут заменены на Prisma типы после prisma generate)

export type Role = 'ADMIN' | 'PSYCHOLOGIST' | 'CLIENT';

export type AppointmentStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'NO_SHOW';

export type AppointmentType = 'VIDEO' | 'AUDIO' | 'CHAT';

export type PaymentStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'FAILED'
  | 'REFUNDED'
  | 'PARTIALLY_REFUNDED';

export type NotificationType =
  | 'APPOINTMENT_CREATED'
  | 'APPOINTMENT_CONFIRMED'
  | 'APPOINTMENT_CANCELLED'
  | 'APPOINTMENT_REMINDER'
  | 'PAYMENT_RECEIVED'
  | 'PAYOUT_COMPLETED'
  | 'NEW_MESSAGE'
  | 'NEW_REVIEW'
  | 'SYSTEM';

export interface User {
  id: string;
  email: string;
  emailVerified?: Date | null;
  password?: string | null;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
  profile?: Profile | null;
}

export interface Profile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  avatar?: string | null;
  timezone: string;
  bio?: string | null;
  specializations: string[];
  education?: unknown;
  certificates?: unknown;
  experience?: number | null;
  price?: number | null;
  languages: string[];
  verified: boolean;
  rating?: number | null;
  reviewsCount: number;
  isActive: boolean;
  isOnline: boolean;
  lastOnline?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Appointment {
  id: string;
  psychologistId: string;
  clientId: string;
  datetime: Date;
  duration: number;
  status: AppointmentStatus;
  type: AppointmentType;
  price: number;
  notes?: string | null;
  privateNotes?: string | null;
  roomId?: string | null;
  cancelledAt?: Date | null;
  cancelledBy?: string | null;
  cancelReason?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Payment {
  id: string;
  appointmentId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  stripePaymentIntentId?: string | null;
  stripeChargeId?: string | null;
  refundedAt?: Date | null;
  refundAmount?: number | null;
  refundReason?: string | null;
  payoutAmount?: number | null;
  paidOutAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  content: string;
  type: 'TEXT' | 'IMAGE' | 'FILE' | 'SYSTEM';
  attachmentUrl?: string | null;
  readAt?: Date | null;
  createdAt: Date;
}

export interface Review {
  id: string;
  psychologistId: string;
  clientId: string;
  appointmentId: string;
  rating: number;
  comment?: string | null;
  isPublic: boolean;
  isApproved: boolean;
  moderatedAt?: Date | null;
  createdAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string | null;
  data?: unknown;
  readAt?: Date | null;
  createdAt: Date;
}

export interface Schedule {
  id: string;
  psychologistId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export interface Conversation {
  id: string;
  participant1Id: string;
  participant2Id: string;
  lastMessageAt?: Date | null;
  createdAt: Date;
}

// Расширенные типы с связями

export type UserWithProfile = User & {
  profile: Profile | null;
};

export type PsychologistProfile = Profile & {
  user: Pick<User, 'id' | 'email'>;
};

export type AppointmentWithDetails = Appointment & {
  psychologist: UserWithProfile;
  client: UserWithProfile;
  payment: Payment | null;
  review: Review | null;
};

export type MessageWithUsers = Message & {
  sender: UserWithProfile;
  receiver: UserWithProfile;
};

// API Response types

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Filter types

export interface PsychologistFilters {
  specializations?: string[];
  priceMin?: number;
  priceMax?: number;
  rating?: number;
  experience?: number;
  languages?: string[];
  verified?: boolean;
  isOnline?: boolean;
}

export interface AppointmentFilters {
  status?: string;
  dateFrom?: Date;
  dateTo?: Date;
  type?: string;
}

// Form types

export interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  role: 'PSYCHOLOGIST' | 'CLIENT';
  phone?: string;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface ProfileFormData {
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  timezone?: string;
  bio?: string;
  specializations?: string[];
  education?: EducationItem[];
  certificates?: CertificateItem[];
  experience?: number;
  price?: number;
  languages?: string[];
}

export interface EducationItem {
  degree: string;
  institution: string;
  year: number;
}

export interface CertificateItem {
  name: string;
  issuer: string;
  year: number;
  url?: string;
}

// Schedule types

export interface ScheduleSlot {
  id?: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export interface TimeSlot {
  time: string;
  available: boolean;
}

export interface AvailableSlot {
  date: Date;
  slots: TimeSlot[];
}

// Video call types

export interface VideoRoomData {
  roomId: string;
  token: string;
  url: string;
}

// Notification types

export interface NotificationData {
  appointmentId?: string;
  messageId?: string;
  reviewId?: string;
  [key: string]: unknown;
}

// Specializations list

export const SPECIALIZATIONS = [
  'Тревожность',
  'Депрессия',
  'Отношения',
  'Семейная терапия',
  'Детская психология',
  'Карьерное консультирование',
  'Зависимости',
  'Травмы и ПТСР',
  'Самооценка',
  'Стресс и выгорание',
  'Расстройства пищевого поведения',
  'Сексология',
  'Горе и потеря',
  'Личностный рост',
  'Психосоматика',
] as const;

export type Specialization = (typeof SPECIALIZATIONS)[number];

// Languages list

export const LANGUAGES = [
  { code: 'ru', name: 'Русский' },
  { code: 'en', name: 'English' },
  { code: 'uk', name: 'Українська' },
  { code: 'kk', name: 'Қазақша' },
] as const;

// Days of week

export const DAYS_OF_WEEK = [
  { value: 0, label: 'Воскресенье', short: 'Вс' },
  { value: 1, label: 'Понедельник', short: 'Пн' },
  { value: 2, label: 'Вторник', short: 'Вт' },
  { value: 3, label: 'Среда', short: 'Ср' },
  { value: 4, label: 'Четверг', short: 'Чт' },
  { value: 5, label: 'Пятница', short: 'Пт' },
  { value: 6, label: 'Суббота', short: 'Сб' },
] as const;
