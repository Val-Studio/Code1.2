import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { PsychologistDashboard } from '@/components/dashboard/psychologist-dashboard';
import { ClientDashboard } from '@/components/dashboard/client-dashboard';
import { AdminDashboard } from '@/components/dashboard/admin-dashboard';

export const metadata = {
  title: 'Личный кабинет',
};

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  const { role } = session.user;

  if (role === 'ADMIN') {
    return <AdminDashboard />;
  }

  if (role === 'PSYCHOLOGIST') {
    return <PsychologistDashboard userId={session.user.id} />;
  }

  return <ClientDashboard userId={session.user.id} />;
}
