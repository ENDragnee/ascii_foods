import { requireAuth } from '@/lib/serverAuth';
import { redirect } from 'next/navigation';
import { AblyProvider } from '@/components/ably-provider';

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAuth();

  if (!session || session.user?.role !== 'ADMIN') {
    redirect('/auth?view=signin');
  }


  return (
    <main className="flex-1 p-4 sm:p-6">
      <AblyProvider>
        {children}
      </AblyProvider>
    </main>
  );
}
