import { redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { Card, CardContent, Badge, Avatar, Button } from '@/components/ui';
import { formatDateTime, formatPrice } from '@/lib/utils';
import { Calendar, Video, Clock, MessageSquare, Star } from 'lucide-react';

export const metadata = {
  title: 'Мои записи',
};

const statusLabels: Record<string, { label: string; variant: 'default' | 'success' | 'warning' | 'destructive' }> = {
  PENDING: { label: 'Ожидает подтверждения', variant: 'warning' },
  CONFIRMED: { label: 'Подтверждено', variant: 'success' },
  IN_PROGRESS: { label: 'Идёт сейчас', variant: 'default' },
  COMPLETED: { label: 'Завершено', variant: 'default' },
  CANCELLED: { label: 'Отменено', variant: 'destructive' },
};

async function getClientAppointments(userId: string) {
  const now = new Date();

  const [upcoming, past] = await Promise.all([
    prisma.appointment.findMany({
      where: {
        clientId: userId,
        datetime: { gte: now },
        status: { in: ['PENDING', 'CONFIRMED', 'IN_PROGRESS'] },
      },
      include: {
        psychologist: { include: { profile: true } },
        payment: true,
      },
      orderBy: { datetime: 'asc' },
    }),
    prisma.appointment.findMany({
      where: {
        clientId: userId,
        OR: [{ datetime: { lt: now } }, { status: { in: ['COMPLETED', 'CANCELLED'] } }],
      },
      include: {
        psychologist: { include: { profile: true } },
        payment: true,
        review: true,
      },
      orderBy: { datetime: 'desc' },
      take: 20,
    }),
  ]);

  return { upcoming, past };
}

export default async function ClientAppointmentsPage() {
  const session = await auth();

  if (!session || session.user.role !== 'CLIENT') {
    redirect('/dashboard');
  }

  const { upcoming, past } = await getClientAppointments(session.user.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Мои записи</h1>
        <p className="text-gray-600">Управление консультациями</p>
      </div>

      {/* Upcoming appointments */}
      <section>
        <h2 className="mb-4 text-lg font-semibold">Предстоящие ({upcoming.length})</h2>
        {upcoming.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Calendar className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-4 text-gray-500">Нет предстоящих записей</p>
              <Link href="/dashboard/client/psychologists">
                <Button className="mt-4">Найти психолога</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {upcoming.map((appointment) => (
              <Card key={appointment.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar
                        src={appointment.psychologist.profile?.avatar}
                        firstName={appointment.psychologist.profile?.firstName || ''}
                        lastName={appointment.psychologist.profile?.lastName || ''}
                        size="lg"
                      />
                      <div>
                        <p className="font-medium">
                          {appointment.psychologist.profile?.firstName}{' '}
                          {appointment.psychologist.profile?.lastName}
                        </p>
                        <div className="flex items-center gap-3 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {formatDateTime(appointment.datetime)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {appointment.duration} мин
                          </span>
                        </div>
                        <Badge
                          variant={statusLabels[appointment.status]?.variant || 'default'}
                          className="mt-2"
                        >
                          {statusLabels[appointment.status]?.label}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className="font-medium text-primary-600">
                        {formatPrice(appointment.price)}
                      </span>
                      {!appointment.payment && appointment.status === 'PENDING' && (
                        <Link href={`/dashboard/client/appointments/${appointment.id}/payment`}>
                          <Button size="sm">Оплатить</Button>
                        </Link>
                      )}
                      {appointment.status === 'CONFIRMED' && appointment.type === 'VIDEO' && (
                        <Link href={`/room/${appointment.roomId || appointment.id}`}>
                          <Button size="sm">
                            <Video className="mr-1 h-4 w-4" />
                            Подключиться
                          </Button>
                        </Link>
                      )}
                      <Link href={`/dashboard/messages/${appointment.psychologistId}`}>
                        <Button size="sm" variant="outline">
                          <MessageSquare className="mr-1 h-4 w-4" />
                          Написать
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Past appointments */}
      <section>
        <h2 className="mb-4 text-lg font-semibold">История</h2>
        {past.length === 0 ? (
          <p className="text-gray-500">История пуста</p>
        ) : (
          <div className="space-y-3">
            {past.map((appointment) => (
              <Card key={appointment.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
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
                        <p className="text-sm text-gray-500">
                          {formatDateTime(appointment.datetime)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={statusLabels[appointment.status]?.variant || 'default'}>
                        {statusLabels[appointment.status]?.label}
                      </Badge>
                      {appointment.status === 'COMPLETED' && !appointment.review && (
                        <Link href={`/dashboard/client/appointments/${appointment.id}/review`}>
                          <Button size="sm" variant="outline">
                            <Star className="mr-1 h-4 w-4" />
                            Оставить отзыв
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
