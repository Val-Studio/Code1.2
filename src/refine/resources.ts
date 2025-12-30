import type { ResourceProps } from '@refinedev/core';

export const resources: ResourceProps[] = [
  {
    name: 'psychologists',
    list: '/psychologists',
    show: '/psychologists/:id',
    meta: {
      label: 'Психологи',
    },
  },
  {
    name: 'appointments',
    list: '/dashboard/appointments',
    create: '/dashboard/appointments/create',
    show: '/dashboard/appointments/:id',
    edit: '/dashboard/appointments/:id/edit',
    meta: {
      label: 'Записи',
    },
  },
  {
    name: 'clients',
    list: '/dashboard/psychologist/clients',
    show: '/dashboard/psychologist/clients/:id',
    meta: {
      label: 'Клиенты',
      parent: 'psychologist',
    },
  },
  {
    name: 'schedule',
    list: '/dashboard/psychologist/schedule',
    meta: {
      label: 'Расписание',
      parent: 'psychologist',
    },
  },
  {
    name: 'messages',
    list: '/dashboard/messages',
    show: '/dashboard/messages/:conversationId',
    meta: {
      label: 'Сообщения',
    },
  },
  {
    name: 'notes',
    list: '/dashboard/psychologist/notes',
    create: '/dashboard/psychologist/notes/create',
    edit: '/dashboard/psychologist/notes/:id/edit',
    meta: {
      label: 'Заметки',
      parent: 'psychologist',
    },
  },
  {
    name: 'reviews',
    list: '/dashboard/reviews',
    meta: {
      label: 'Отзывы',
    },
  },
  {
    name: 'payments',
    list: '/dashboard/payments',
    meta: {
      label: 'Платежи',
    },
  },
  {
    name: 'notifications',
    list: '/dashboard/notifications',
    meta: {
      label: 'Уведомления',
    },
  },
  // Admin resources
  {
    name: 'users',
    list: '/admin/users',
    show: '/admin/users/:id',
    edit: '/admin/users/:id/edit',
    meta: {
      label: 'Пользователи',
      parent: 'admin',
    },
  },
];
