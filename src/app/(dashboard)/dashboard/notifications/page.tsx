import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { Card, CardHeader, CardTitle, CardContent, Badge } from '@/components/ui';
import { formatDateTime } from '@/lib/utils';
import {
  Bell,
  Calendar,
  CreditCard,
  MessageSquare,
  Star,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Уведомления',
};

const notificationIcons: Record<string, React.ReactNode> = {
  APPOINTMENT_CREATED: <Calendar className="h-5 w-5 text-blue-500" />,
  APPOINTMENT_CONFIRMED: <CheckCircle className="h-5 w-5 text-green-500" />,
  APPOINTMENT_CANCELLED: <XCircle className="h-5 w-5 text-red-500" />,
  APPOINTMENT_REMINDER: <AlertCircle className="h-5 w-5 text-yellow-500" />,
  PAYMENT_RECEIVED: <CreditCard className="h-5 w-5 text-green-500" />,
  PAYOUT_COMPLETED: <CreditCard className="h-5 w-5 text-green-500" />,
  NEW_MESSAGE: <MessageSquare className="h-5 w-5 text-blue-500" />,
  NEW_REVIEW: <Star className="h-5 w-5 text-yellow-500" />,
  SYSTEM: <Bell className="h-5 w-5 text-gray-500" />,
};

async function getNotifications(userId: string) {
  const notifications = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  // Mark all as read
  await prisma.notification.updateMany({
    where: { userId, readAt: null },
    data: { readAt: new Date() },
  });

  return notifications;
}

export default async function NotificationsPage() {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  const notifications = await getNotifications(session.user.id);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Уведомления</h1>
        <p className="text-gray-600">Все ваши уведомления</p>
      </div>

      <Card>
        <CardContent className="p-0">
          {notifications.length === 0 ? (
            <div className="py-12 text-center">
              <Bell className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-4 text-gray-500">Нет уведомлений</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification: {
                id: string;
                type: string;
                title: string;
                message: string;
                link: string | null;
                readAt: Date | null;
                createdAt: Date;
              }) => {
                const content = (
                  <>
                    <div className="flex-shrink-0">
                      {notificationIcons[notification.type] || <Bell className="h-5 w-5" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{notification.title}</p>
                          <p className="text-sm text-gray-600">{notification.message}</p>
                        </div>
                        {!notification.readAt && (
                          <Badge variant="default" className="ml-2">
                            Новое
                          </Badge>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-gray-400">
                        {formatDateTime(notification.createdAt)}
                      </p>
                    </div>
                  </>
                );

                const className = `flex items-start gap-4 p-4 transition-colors ${
                  notification.link ? 'hover:bg-gray-50' : ''
                } ${!notification.readAt ? 'bg-blue-50' : ''}`;

                return notification.link ? (
                  <Link key={notification.id} href={notification.link} className={className}>
                    {content}
                  </Link>
                ) : (
                  <div key={notification.id} className={className}>
                    {content}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
