import { requireAuth } from '@/lib/serverAuth';
import { redirect } from 'next/navigation';

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
    <div className="min-h-screen w-full bg-muted/40">
      <div className="flex flex-col sm:pl-14 md:pl-64">
        <main className="flex-1 p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
