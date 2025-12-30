'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Brain,
  LayoutDashboard,
  Calendar,
  Users,
  MessageSquare,
  Clock,
  FileText,
  Star,
  CreditCard,
  Settings,
  Search,
  User,
  Bell,
} from 'lucide-react';
import type { Role } from '@prisma/client';

interface SidebarProps {
  role: Role;
}

const psychologistLinks = [
  { href: '/dashboard', label: 'Главная', icon: LayoutDashboard },
  { href: '/dashboard/psychologist/appointments', label: 'Записи', icon: Calendar },
  { href: '/dashboard/psychologist/clients', label: 'Клиенты', icon: Users },
  { href: '/dashboard/psychologist/schedule', label: 'Расписание', icon: Clock },
  { href: '/dashboard/psychologist/notes', label: 'Заметки', icon: FileText },
  { href: '/dashboard/messages', label: 'Сообщения', icon: MessageSquare },
  { href: '/dashboard/psychologist/reviews', label: 'Отзывы', icon: Star },
  { href: '/dashboard/psychologist/earnings', label: 'Доход', icon: CreditCard },
  { href: '/dashboard/settings', label: 'Настройки', icon: Settings },
];

const clientLinks = [
  { href: '/dashboard', label: 'Главная', icon: LayoutDashboard },
  { href: '/dashboard/client/appointments', label: 'Мои записи', icon: Calendar },
  { href: '/dashboard/client/psychologists', label: 'Найти психолога', icon: Search },
  { href: '/dashboard/messages', label: 'Сообщения', icon: MessageSquare },
  { href: '/dashboard/client/history', label: 'История', icon: FileText },
  { href: '/dashboard/notifications', label: 'Уведомления', icon: Bell },
  { href: '/dashboard/settings', label: 'Настройки', icon: Settings },
];

const adminLinks = [
  { href: '/dashboard', label: 'Главная', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Пользователи', icon: Users },
  { href: '/admin/psychologists', label: 'Психологи', icon: User },
  { href: '/admin/payments', label: 'Платежи', icon: CreditCard },
  { href: '/admin/reviews', label: 'Отзывы', icon: Star },
  { href: '/dashboard/settings', label: 'Настройки', icon: Settings },
];

export function DashboardSidebar({ role }: SidebarProps) {
  const pathname = usePathname();

  const links =
    role === 'ADMIN' ? adminLinks : role === 'PSYCHOLOGIST' ? psychologistLinks : clientLinks;

  return (
    <aside className="hidden w-64 flex-shrink-0 border-r bg-white lg:block">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center border-b px-6">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold text-primary-700">
            <Brain className="h-6 w-6" />
            PsyConnect
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-4">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href || pathname.startsWith(link.href + '/');

            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                )}
              >
                <Icon className="h-5 w-5" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t p-4">
          <div className="rounded-lg bg-primary-50 p-4">
            <p className="text-sm font-medium text-primary-800">Нужна помощь?</p>
            <p className="mt-1 text-xs text-primary-600">Напишите в поддержку</p>
            <Link
              href="/help"
              className="mt-3 block rounded-lg bg-primary-600 px-4 py-2 text-center text-sm font-medium text-white hover:bg-primary-700"
            >
              Поддержка
            </Link>
          </div>
        </div>
      </div>
    </aside>
  );
}
