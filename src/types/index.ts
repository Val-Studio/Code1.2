import type { User, Profile, Appointment, Payment, Review, Message } from '@prisma/client';

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
