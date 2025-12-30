import Link from 'next/link';
import prisma from '@/lib/prisma';
import { Card, CardHeader, CardTitle, CardContent, Badge, Avatar } from '@/components/ui';
import { formatPrice, formatDateTime, formatDate } from '@/lib/utils';
import {
  Calendar,
  Users,
  CreditCard,
  Clock,
  Star,
  ArrowRight,
  TrendingUp,
  Video,
} from 'lucide-react';

interface PsychologistDashboardProps {
  userId: string;
}

async function getStats(userId: string) {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfDay = new Date(now.setHours(0, 0, 0, 0));
  const endOfDay = new Date(now.setHours(23, 59, 59, 999));

  const [
    todayAppointments,
    upcomingAppointments,
    totalClients,
    monthlyEarnings,
    averageRating,
    recentReviews,
  ] = await Promise.all([
    // Today's appointments
    prisma.appointment.findMany({
      where: {
        psychologistId: userId,
        datetime: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: { in: ['CONFIRMED', 'IN_PROGRESS'] },
      },
      include: {
        client: { include: { profile: true } },
      },
      orderBy: { datetime: 'asc' },
    }),
    // Upcoming appointments
    prisma.appointment.findMany({
      where: {
        psychologistId: userId,
        datetime: { gt: new Date() },
        status: 'CONFIRMED',
      },
      include: {
        client: { include: { profile: true } },
      },
      orderBy: { datetime: 'asc' },
      take: 5,
    }),
    // Total unique clients
    prisma.appointment.findMany({
      where: { psychologistId: userId },
      select: { clientId: true },
      distinct: ['clientId'],
    }),
    // Monthly earnings
    prisma.payment.aggregate({
      where: {
        appointment: { psychologistId: userId },
        status: 'COMPLETED',
        createdAt: { gte: startOfMonth },
      },
      _sum: { payoutAmount: true },
    }),
    // Average rating
    prisma.review.aggregate({
      where: { psychologistId: userId },
      _avg: { rating: true },
    }),
    // Recent reviews
    prisma.review.findMany({
      where: { psychologistId: userId, isApproved: true },
      include: {
        client: { include: { profile: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 3,
    }),
  ]);

  return {
    todayAppointments,
    upcomingAppointments,
    totalClients: totalClients.length,
    monthlyEarnings: monthlyEarnings._sum.payoutAmount || 0,
    averageRating: averageRating._avg.rating || 0,
    recentReviews,
  };
}

export async function PsychologistDashboard({ userId }: PsychologistDashboardProps) {
  const stats = await getStats(userId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Добро пожаловать!</h1>
        <p className="text-gray-600">Вот обзор вашей активности</p>
      </div>

      {/* Stats cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Сегодня записей"
          value={stats.todayAppointments.length}
          icon={<Calendar className="h-5 w-5" />}
          trend={`${stats.upcomingAppointments.length} предстоящих`}
        />
        <StatCard
          title="Всего клиентов"
          value={stats.totalClients}
          icon={<Users className="h-5 w-5" />}
        />
        <StatCard
          title="Доход за месяц"
          value={formatPrice(stats.monthlyEarnings)}
          icon={<CreditCard className="h-5 w-5" />}
        />
        <StatCard
          title="Средний рейтинг"
          value={stats.averageRating.toFixed(1)}
          icon={<Star className="h-5 w-5 text-yellow-500" />}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Today's schedule */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Сегодня
            </CardTitle>
            <Link href="/dashboard/psychologist/appointments" className="text-sm text-primary-600 hover:underline">
              Все записи
            </Link>
          </CardHeader>
          <CardContent>
            {stats.todayAppointments.length === 0 ? (
              <p className="text-center text-gray-500 py-8">На сегодня записей нет</p>
            ) : (
              <div className="space-y-4">
                {stats.todayAppointments.map((appointment: any) => (
                  <div
                    key={appointment.id}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar
                        firstName={appointment.client.profile?.firstName || ''}
                        lastName={appointment.client.profile?.lastName || ''}
                        size="md"
                      />
                      <div>
                        <p className="font-medium">
                          {appointment.client.profile?.firstName} {appointment.client.profile?.lastName}
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatDateTime(appointment.datetime)} · {appointment.duration} мин
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={appointment.status === 'IN_PROGRESS' ? 'success' : 'default'}>
                        {appointment.status === 'IN_PROGRESS' ? 'Идёт' : 'Ожидает'}
                      </Badge>
                      {appointment.type === 'VIDEO' && (
                        <Link
                          href={`/room/${appointment.roomId || appointment.id}`}
                          className="rounded-lg bg-primary-600 p-2 text-white hover:bg-primary-700"
                        >
                          <Video className="h-4 w-4" />
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming appointments */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Ближайшие записи
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.upcomingAppointments.length === 0 ? (
              <p className="text-center text-gray-500 py-8">Нет предстоящих записей</p>
            ) : (
              <div className="space-y-3">
                {stats.upcomingAppointments.map((appointment: any) => (
                  <div
                    key={appointment.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-center">
                        <p className="text-xs text-gray-500">
                          {formatDate(appointment.datetime).split(' ')[0]}
                        </p>
                        <p className="font-medium text-primary-600">
                          {formatDate(appointment.datetime).split(' ')[1]}
                        </p>
                      </div>
                      <div>
                        <p className="font-medium">
                          {appointment.client.profile?.firstName} {appointment.client.profile?.lastName}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(appointment.datetime).toLocaleTimeString('ru-RU', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent reviews */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Последние отзывы
          </CardTitle>
          <Link href="/dashboard/psychologist/reviews" className="text-sm text-primary-600 hover:underline">
            Все отзывы
          </Link>
        </CardHeader>
        <CardContent>
          {stats.recentReviews.length === 0 ? (
            <p className="text-center text-gray-500 py-8">Пока нет отзывов</p>
          ) : (
            <div className="space-y-4">
              {stats.recentReviews.map((review: any) => (
                <div key={review.id} className="rounded-lg border p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Avatar
                        firstName={review.client.profile?.firstName || ''}
                        lastName={review.client.profile?.lastName || ''}
                        size="sm"
                      />
                      <span className="font-medium">
                        {review.client.profile?.firstName} {review.client.profile?.lastName}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  {review.comment && <p className="text-gray-600">{review.comment}</p>}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  trend,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">{title}</p>
            <p className="mt-1 text-2xl font-bold">{value}</p>
            {trend && (
              <p className="mt-1 flex items-center gap-1 text-sm text-gray-500">
                <TrendingUp className="h-3 w-3" />
                {trend}
              </p>
            )}
          </div>
          <div className="rounded-full bg-primary-100 p-3 text-primary-600">{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}
