import { redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { Card, CardHeader, CardTitle, CardContent, Badge, Avatar, Button } from '@/components/ui';
import { formatDateTime, formatPrice } from '@/lib/utils';
import { Calendar, Video, Clock, CheckCircle, XCircle, User } from 'lucide-react';

export const metadata = {
  title: 'Записи на приём',
};

const statusLabels: Record<string, { label: string; variant: 'default' | 'success' | 'warning' | 'destructive' }> = {
  PENDING: { label: 'Ожидает', variant: 'warning' },
  CONFIRMED: { label: 'Подтверждено', variant: 'success' },
  IN_PROGRESS: { label: 'Идёт', variant: 'default' },
  COMPLETED: { label: 'Завершено', variant: 'default' },
  CANCELLED: { label: 'Отменено', variant: 'destructive' },
  NO_SHOW: { label: 'Не пришёл', variant: 'destructive' },
};

interface SearchParams {
  status?: string;
  page?: string;
}

async function getAppointments(userId: string, params: SearchParams) {
  const page = parseInt(params.page || '1');
  const pageSize = 10;

  const where: any = {
    psychologistId: userId,
  };

  if (params.status) {
    where.status = params.status;
  }

  const [appointments, total] = await Promise.all([
    prisma.appointment.findMany({
      where,
      include: {
        client: { include: { profile: true } },
        payment: true,
      },
      orderBy: { datetime: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.appointment.count({ where }),
  ]);

  return { appointments, total, page, pageSize };
}

export default async function PsychologistAppointmentsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const session = await auth();

  if (!session || session.user.role !== 'PSYCHOLOGIST') {
    redirect('/dashboard');
  }

  const params = await searchParams;
  const { appointments, total, page, pageSize } = await getAppointments(session.user.id, params);
  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Записи на приём</h1>
          <p className="text-gray-600">Всего {total} записей</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <Link href="/dashboard/psychologist/appointments">
          <Badge variant={!params.status ? 'default' : 'outline'} className="cursor-pointer">
            Все
          </Badge>
        </Link>
        {Object.entries(statusLabels).map(([status, { label }]) => (
          <Link key={status} href={`/dashboard/psychologist/appointments?status=${status}`}>
            <Badge
              variant={params.status === status ? 'default' : 'outline'}
              className="cursor-pointer"
            >
              {label}
            </Badge>
          </Link>
        ))}
      </div>

      {/* Appointments list */}
      <Card>
        <CardContent className="p-0">
          {appointments.length === 0 ? (
            <div className="py-12 text-center">
              <Calendar className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-4 text-gray-500">Нет записей</p>
            </div>
          ) : (
            <div className="divide-y">
              {appointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex items-center justify-between p-4 hover:bg-gray-50"
                >
                  <div className="flex items-center gap-4">
                    <Avatar
                      src={appointment.client.profile?.avatar}
                      firstName={appointment.client.profile?.firstName || ''}
                      lastName={appointment.client.profile?.lastName || ''}
                      size="lg"
                    />
                    <div>
                      <p className="font-medium">
                        {appointment.client.profile?.firstName} {appointment.client.profile?.lastName}
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
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={statusLabels[appointment.status]?.variant || 'default'}>
                      {statusLabels[appointment.status]?.label || appointment.status}
                    </Badge>
                    <span className="font-medium text-primary-600">
                      {formatPrice(appointment.price)}
                    </span>
                    {appointment.status === 'PENDING' && (
                      <div className="flex gap-2">
                        <form action={`/api/appointments/${appointment.id}/confirm`} method="POST">
                          <Button size="sm" variant="outline">
                            <CheckCircle className="mr-1 h-4 w-4" />
                            Подтвердить
                          </Button>
                        </form>
                      </div>
                    )}
                    {(appointment.status === 'CONFIRMED' || appointment.status === 'IN_PROGRESS') &&
                      appointment.type === 'VIDEO' && (
                        <Link href={`/room/${appointment.roomId || appointment.id}`}>
                          <Button size="sm">
                            <Video className="mr-1 h-4 w-4" />
                            Комната
                          </Button>
                        </Link>
                      )}
                    <Link href={`/dashboard/psychologist/clients/${appointment.clientId}`}>
                      <Button size="sm" variant="ghost">
                        <User className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: totalPages }).map((_, i) => (
            <Link
              key={i}
              href={{
                pathname: '/dashboard/psychologist/appointments',
                query: { ...params, page: i + 1 },
              }}
            >
              <Button variant={page === i + 1 ? 'primary' : 'outline'} size="sm">
                {i + 1}
              </Button>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
