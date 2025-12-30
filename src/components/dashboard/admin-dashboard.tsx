import prisma from '@/lib/prisma';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { formatPrice } from '@/lib/utils';
import { Users, UserCheck, CreditCard, Calendar, TrendingUp, AlertCircle } from 'lucide-react';

async function getAdminStats() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const [
    totalUsers,
    totalPsychologists,
    pendingVerifications,
    totalAppointments,
    monthlyRevenue,
    lastMonthRevenue,
    recentUsers,
    pendingReviews,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: 'PSYCHOLOGIST' } }),
    prisma.profile.count({ where: { user: { role: 'PSYCHOLOGIST' }, verified: false } }),
    prisma.appointment.count({ where: { createdAt: { gte: startOfMonth } } }),
    prisma.payment.aggregate({
      where: { status: 'COMPLETED', createdAt: { gte: startOfMonth } },
      _sum: { amount: true },
    }),
    prisma.payment.aggregate({
      where: {
        status: 'COMPLETED',
        createdAt: { gte: startOfLastMonth, lt: startOfMonth },
      },
      _sum: { amount: true },
    }),
    prisma.user.findMany({
      include: { profile: true },
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),
    prisma.review.count({ where: { isApproved: false } }),
  ]);

  const revenue = monthlyRevenue._sum.amount || 0;
  const lastRevenue = lastMonthRevenue._sum.amount || 0;
  const revenueGrowth = lastRevenue > 0 ? ((revenue - lastRevenue) / lastRevenue) * 100 : 0;

  return {
    totalUsers,
    totalPsychologists,
    pendingVerifications,
    totalAppointments,
    revenue,
    revenueGrowth,
    recentUsers,
    pendingReviews,
  };
}

export async function AdminDashboard() {
  const stats = await getAdminStats();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Панель администратора</h1>
        <p className="text-gray-600">Обзор платформы</p>
      </div>

      {/* Alerts */}
      {(stats.pendingVerifications > 0 || stats.pendingReviews > 0) && (
        <div className="space-y-2">
          {stats.pendingVerifications > 0 && (
            <div className="flex items-center gap-2 rounded-lg bg-yellow-50 border border-yellow-200 p-4">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              <span className="text-yellow-800">
                {stats.pendingVerifications} психологов ожидают верификации
              </span>
            </div>
          )}
          {stats.pendingReviews > 0 && (
            <div className="flex items-center gap-2 rounded-lg bg-blue-50 border border-blue-200 p-4">
              <AlertCircle className="h-5 w-5 text-blue-600" />
              <span className="text-blue-800">{stats.pendingReviews} отзывов на модерации</span>
            </div>
          )}
        </div>
      )}

      {/* Stats */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Всего пользователей"
          value={stats.totalUsers}
          icon={<Users className="h-5 w-5" />}
        />
        <StatCard
          title="Психологов"
          value={stats.totalPsychologists}
          icon={<UserCheck className="h-5 w-5" />}
          subtitle={`${stats.pendingVerifications} на верификации`}
        />
        <StatCard
          title="Записей за месяц"
          value={stats.totalAppointments}
          icon={<Calendar className="h-5 w-5" />}
        />
        <StatCard
          title="Доход за месяц"
          value={formatPrice(stats.revenue)}
          icon={<CreditCard className="h-5 w-5" />}
          trend={stats.revenueGrowth}
        />
      </div>

      {/* Recent users */}
      <Card>
        <CardHeader>
          <CardTitle>Новые пользователи</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left text-sm text-gray-500">
                  <th className="pb-3 font-medium">Пользователь</th>
                  <th className="pb-3 font-medium">Email</th>
                  <th className="pb-3 font-medium">Роль</th>
                  <th className="pb-3 font-medium">Дата</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {stats.recentUsers.map((user) => (
                  <tr key={user.id}>
                    <td className="py-3">
                      {user.profile?.firstName} {user.profile?.lastName || '-'}
                    </td>
                    <td className="py-3 text-gray-600">{user.email}</td>
                    <td className="py-3">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${
                          user.role === 'PSYCHOLOGIST'
                            ? 'bg-purple-100 text-purple-700'
                            : user.role === 'ADMIN'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {user.role === 'PSYCHOLOGIST'
                          ? 'Психолог'
                          : user.role === 'ADMIN'
                          ? 'Админ'
                          : 'Клиент'}
                      </span>
                    </td>
                    <td className="py-3 text-gray-600">
                      {new Date(user.createdAt).toLocaleDateString('ru-RU')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  subtitle,
  trend,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  subtitle?: string;
  trend?: number;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">{title}</p>
            <p className="mt-1 text-2xl font-bold">{value}</p>
            {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
            {trend !== undefined && (
              <p
                className={`mt-1 flex items-center gap-1 text-sm ${
                  trend >= 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                <TrendingUp className={`h-3 w-3 ${trend < 0 ? 'rotate-180' : ''}`} />
                {trend >= 0 ? '+' : ''}
                {trend.toFixed(1)}%
              </p>
            )}
          </div>
          <div className="rounded-full bg-primary-100 p-3 text-primary-600">{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}
