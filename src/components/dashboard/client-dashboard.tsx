import Link from 'next/link';
import prisma from '@/lib/prisma';
import { Card, CardHeader, CardTitle, CardContent, Badge, Avatar, Button } from '@/components/ui';
import { formatPrice, formatDateTime } from '@/lib/utils';
import { Calendar, Search, Clock, MessageSquare, Video, ArrowRight } from 'lucide-react';

interface ClientDashboardProps {
  userId: string;
}

async function getClientData(userId: string) {
  const now = new Date();

  const [upcomingAppointments, pastAppointments, unreadMessages] = await Promise.all([
    // Upcoming appointments
    prisma.appointment.findMany({
      where: {
        clientId: userId,
        datetime: { gt: now },
        status: { in: ['PENDING', 'CONFIRMED'] },
      },
      include: {
        psychologist: { include: { profile: true } },
      },
      orderBy: { datetime: 'asc' },
      take: 5,
    }),
    // Past appointments (for history)
    prisma.appointment.findMany({
      where: {
        clientId: userId,
        status: 'COMPLETED',
      },
      include: {
        psychologist: { include: { profile: true } },
        review: true,
      },
      orderBy: { datetime: 'desc' },
      take: 5,
    }),
    // Unread messages count
    prisma.message.count({
      where: {
        receiverId: userId,
        readAt: null,
      },
    }),
  ]);

  return {
    upcomingAppointments,
    pastAppointments,
    unreadMessages,
  };
}

export async function ClientDashboard({ userId }: ClientDashboardProps) {
  const data = await getClientData(userId);
  const nextAppointment = data.upcomingAppointments[0];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Личный кабинет</h1>
        <p className="text-gray-600">Управляйте вашими консультациями</p>
      </div>

      {/* Quick actions */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Link href="/dashboard/client/psychologists">
          <Card className="cursor-pointer transition-shadow hover:shadow-md">
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="rounded-full bg-primary-100 p-3">
                <Search className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <p className="font-medium">Найти психолога</p>
                <p className="text-sm text-gray-500">Поиск по специализации</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/dashboard/client/appointments">
          <Card className="cursor-pointer transition-shadow hover:shadow-md">
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="rounded-full bg-green-100 p-3">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="font-medium">Мои записи</p>
                <p className="text-sm text-gray-500">{data.upcomingAppointments.length} предстоящих</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/dashboard/messages">
          <Card className="cursor-pointer transition-shadow hover:shadow-md">
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="relative rounded-full bg-blue-100 p-3">
                <MessageSquare className="h-6 w-6 text-blue-600" />
                {data.unreadMessages > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                    {data.unreadMessages}
                  </span>
                )}
              </div>
              <div>
                <p className="font-medium">Сообщения</p>
                <p className="text-sm text-gray-500">
                  {data.unreadMessages > 0 ? `${data.unreadMessages} новых` : 'Нет новых'}
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Next appointment highlight */}
      {nextAppointment && (
        <Card className="border-primary-200 bg-primary-50">
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-primary-100 p-3">
                  <Clock className="h-6 w-6 text-primary-600" />
                </div>
                <div>
                  <p className="text-sm text-primary-700">Ближайшая консультация</p>
                  <p className="font-medium text-gray-900">
                    {nextAppointment.psychologist.profile?.firstName}{' '}
                    {nextAppointment.psychologist.profile?.lastName}
                  </p>
                  <p className="text-sm text-gray-600">
                    {formatDateTime(nextAppointment.datetime)} · {nextAppointment.duration} мин
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Link href={`/dashboard/messages/${nextAppointment.psychologistId}`}>
                  <Button variant="outline" size="sm">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Написать
                  </Button>
                </Link>
                {nextAppointment.type === 'VIDEO' && (
                  <Link href={`/room/${nextAppointment.roomId || nextAppointment.id}`}>
                    <Button size="sm">
                      <Video className="mr-2 h-4 w-4" />
                      Подключиться
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upcoming appointments */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Предстоящие записи</CardTitle>
            <Link href="/dashboard/client/appointments" className="text-sm text-primary-600 hover:underline">
              Все записи
            </Link>
          </CardHeader>
          <CardContent>
            {data.upcomingAppointments.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-gray-500">У вас пока нет записей</p>
                <Link href="/dashboard/client/psychologists">
                  <Button className="mt-4">Найти психолога</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {data.upcomingAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar
                        src={appointment.psychologist.profile?.avatar}
                        firstName={appointment.psychologist.profile?.firstName || ''}
                        lastName={appointment.psychologist.profile?.lastName || ''}
                        size="md"
                      />
                      <div>
                        <p className="font-medium">
                          {appointment.psychologist.profile?.firstName}{' '}
                          {appointment.psychologist.profile?.lastName}
                        </p>
                        <p className="text-sm text-gray-500">{formatDateTime(appointment.datetime)}</p>
                      </div>
                    </div>
                    <Badge variant={appointment.status === 'CONFIRMED' ? 'success' : 'warning'}>
                      {appointment.status === 'CONFIRMED' ? 'Подтверждено' : 'Ожидает'}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Past appointments */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>История консультаций</CardTitle>
            <Link href="/dashboard/client/history" className="text-sm text-primary-600 hover:underline">
              Вся история
            </Link>
          </CardHeader>
          <CardContent>
            {data.pastAppointments.length === 0 ? (
              <p className="py-8 text-center text-gray-500">История пуста</p>
            ) : (
              <div className="space-y-3">
                {data.pastAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar
                        src={appointment.psychologist.profile?.avatar}
                        firstName={appointment.psychologist.profile?.firstName || ''}
                        lastName={appointment.psychologist.profile?.lastName || ''}
                        size="md"
                      />
                      <div>
                        <p className="font-medium">
                          {appointment.psychologist.profile?.firstName}{' '}
                          {appointment.psychologist.profile?.lastName}
                        </p>
                        <p className="text-sm text-gray-500">{formatDateTime(appointment.datetime)}</p>
                      </div>
                    </div>
                    {appointment.review ? (
                      <Badge variant="success">Отзыв оставлен</Badge>
                    ) : (
                      <Link href={`/dashboard/client/appointments/${appointment.id}/review`}>
                        <Button variant="outline" size="sm">
                          Оставить отзыв
                        </Button>
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
