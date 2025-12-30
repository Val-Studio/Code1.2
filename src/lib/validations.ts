import { z } from 'zod';
import { SPECIALIZATIONS } from '@/types';

// Auth schemas

export const loginSchema = z.object({
  email: z.string().email('Некорректный email'),
  password: z.string().min(6, 'Пароль должен быть минимум 6 символов'),
});

export const registerSchema = z
  .object({
    email: z.string().email('Некорректный email'),
    password: z.string().min(6, 'Пароль должен быть минимум 6 символов'),
    confirmPassword: z.string(),
    firstName: z.string().min(2, 'Минимум 2 символа'),
    lastName: z.string().min(2, 'Минимум 2 символа'),
    role: z.enum(['PSYCHOLOGIST', 'CLIENT']),
    phone: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Пароли не совпадают',
    path: ['confirmPassword'],
  });

// Profile schemas

export const profileSchema = z.object({
  firstName: z.string().min(2, 'Минимум 2 символа'),
  lastName: z.string().min(2, 'Минимум 2 символа'),
  phone: z.string().optional(),
  avatar: z.string().url().optional().or(z.literal('')),
  timezone: z.string().optional(),
});

export const psychologistProfileSchema = profileSchema.extend({
  bio: z.string().min(50, 'Расскажите о себе подробнее (минимум 50 символов)').optional(),
  specializations: z.array(z.enum(SPECIALIZATIONS as unknown as [string, ...string[]])).min(1, 'Выберите хотя бы одну специализацию'),
  education: z
    .array(
      z.object({
        degree: z.string().min(1),
        institution: z.string().min(1),
        year: z.number().min(1950).max(new Date().getFullYear()),
      })
    )
    .optional(),
  certificates: z
    .array(
      z.object({
        name: z.string().min(1),
        issuer: z.string().min(1),
        year: z.number().min(1950).max(new Date().getFullYear()),
        url: z.string().url().optional(),
      })
    )
    .optional(),
  experience: z.number().min(0).max(50).optional(),
  price: z.number().min(100000).max(5000000), // от 1000 до 50000 рублей (в копейках)
  languages: z.array(z.string()).min(1),
});

// Appointment schemas

export const createAppointmentSchema = z.object({
  psychologistId: z.string().cuid(),
  datetime: z.coerce.date().refine((date) => date > new Date(), {
    message: 'Дата должна быть в будущем',
  }),
  duration: z.number().min(30).max(120).default(60),
  type: z.enum(['VIDEO', 'AUDIO', 'CHAT']).default('VIDEO'),
});

export const updateAppointmentSchema = z.object({
  status: z.enum(['CONFIRMED', 'CANCELLED', 'COMPLETED', 'NO_SHOW']).optional(),
  notes: z.string().optional(),
  privateNotes: z.string().optional(),
  cancelReason: z.string().optional(),
});

// Schedule schemas

export const scheduleSlotSchema = z.object({
  dayOfWeek: z.number().min(0).max(6),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Формат времени: HH:MM'),
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Формат времени: HH:MM'),
  isAvailable: z.boolean().default(true),
});

export const scheduleSchema = z.array(scheduleSlotSchema);

// Message schemas

export const messageSchema = z.object({
  receiverId: z.string().cuid(),
  content: z.string().min(1, 'Сообщение не может быть пустым').max(5000),
  type: z.enum(['TEXT', 'IMAGE', 'FILE']).default('TEXT'),
  attachmentUrl: z.string().url().optional(),
});

// Review schemas

export const reviewSchema = z.object({
  appointmentId: z.string().cuid(),
  rating: z.number().min(1).max(5),
  comment: z.string().max(2000).optional(),
  isPublic: z.boolean().default(true),
});

// Client note schemas

export const clientNoteSchema = z.object({
  clientId: z.string().cuid(),
  title: z.string().max(200).optional(),
  content: z.string().min(1, 'Заметка не может быть пустой').max(10000),
});

// Search/filter schemas

export const psychologistFilterSchema = z.object({
  specializations: z.array(z.string()).optional(),
  priceMin: z.number().optional(),
  priceMax: z.number().optional(),
  rating: z.number().min(1).max(5).optional(),
  experience: z.number().optional(),
  languages: z.array(z.string()).optional(),
  verified: z.boolean().optional(),
  isOnline: z.boolean().optional(),
});

// Type exports

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
export type PsychologistProfileInput = z.infer<typeof psychologistProfileSchema>;
export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>;
export type UpdateAppointmentInput = z.infer<typeof updateAppointmentSchema>;
export type ScheduleSlotInput = z.infer<typeof scheduleSlotSchema>;
export type MessageInput = z.infer<typeof messageSchema>;
export type ReviewInput = z.infer<typeof reviewSchema>;
export type ClientNoteInput = z.infer<typeof clientNoteSchema>;
export type PsychologistFilterInput = z.infer<typeof psychologistFilterSchema>;
