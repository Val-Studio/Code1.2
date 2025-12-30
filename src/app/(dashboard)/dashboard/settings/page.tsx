import { redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui';
import { User, Bell, Shield, CreditCard, Palette, LogOut, ChevronRight } from 'lucide-react';

export const metadata = {
  title: 'Настройки',
};

export default async function SettingsPage() {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  const settingsGroups = [
    {
      title: 'Аккаунт',
      items: [
        {
          href: '/dashboard/settings/profile',
          icon: User,
          title: 'Профиль',
          description: 'Управление личными данными',
        },
        {
          href: '/dashboard/settings/security',
          icon: Shield,
          title: 'Безопасность',
          description: 'Пароль и двухфакторная аутентификация',
        },
        {
          href: '/dashboard/settings/notifications',
          icon: Bell,
          title: 'Уведомления',
          description: 'Настройки email и push-уведомлений',
        },
      ],
    },
    {
      title: 'Оплата',
      items: [
        {
          href: '/dashboard/settings/billing',
          icon: CreditCard,
          title: 'Платёжные данные',
          description: 'Карты и методы оплаты',
        },
      ],
    },
    {
      title: 'Внешний вид',
      items: [
        {
          href: '/dashboard/settings/appearance',
          icon: Palette,
          title: 'Тема',
          description: 'Светлая или тёмная тема',
        },
      ],
    },
  ];

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Настройки</h1>
        <p className="text-gray-600">Управление вашим аккаунтом</p>
      </div>

      {settingsGroups.map((group) => (
        <Card key={group.title}>
          <CardHeader>
            <CardTitle>{group.title}</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {group.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center justify-between p-4 transition-colors hover:bg-gray-50"
                >
                  <div className="flex items-center gap-4">
                    <div className="rounded-lg bg-gray-100 p-2">
                      <item.icon className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{item.title}</p>
                      <p className="text-sm text-gray-500">{item.description}</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Logout */}
      <Card className="border-red-200">
        <CardContent className="p-0">
          <form action="/api/auth/signout" method="POST">
            <button
              type="submit"
              className="flex w-full items-center gap-4 p-4 text-left text-red-600 transition-colors hover:bg-red-50"
            >
              <div className="rounded-lg bg-red-100 p-2">
                <LogOut className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">Выйти из аккаунта</p>
                <p className="text-sm text-red-400">Завершить текущую сессию</p>
              </div>
            </button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
