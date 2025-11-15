import { requireAuth } from '@/lib/serverAuth';
import { redirect } from 'next/navigation';
import { AblyProvider } from '@/components/ably-provider';

export default async function CashierDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAuth();

  if (!session || session.user?.role !== 'CASHIER') {
    redirect('/auth?view=signin');
  }

  return (
    <AblyProvider>
      {children}
    </AblyProvider>
  );
}
