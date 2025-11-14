import { requireAuth } from '@/lib/serverAuth';
import { redirect } from 'next/navigation';
import { AblyProvider } from '@/components/ably-provider';

export default async function CashierDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAuth();

  if (!session || session.user?.role !== 'ADMIN') {
    redirect('/auth?view=signin');
  }

  return (
    <div className="min-h-screen w-full bg-muted/40">
      <div className="flex flex-col sm:pl-14 md:pl-64">
        <main className="flex-1 p-4 sm:p-6">
          <AblyProvider>
            {children}
          </AblyProvider>
        </main>
      </div>
    </div>
  );
}
