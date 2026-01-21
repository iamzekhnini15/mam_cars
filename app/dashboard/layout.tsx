import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import DashboardNav from '@/components/DashboardNav';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <Link href="/dashboard">
                <h1 className="text-2xl font-bold text-gray-900 hover:text-gray-700 cursor-pointer">
                  MAM Cars
                </h1>
              </Link>
              <p className="text-sm text-gray-600">Gestion de Stock Automobile</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                {session.user.prenom} {session.user.nom}
              </span>
              <Link href="/api/auth/signout">
                <Button variant="outline" size="sm">
                  Déconnexion
                </Button>
              </Link>
            </div>
          </div>
          <DashboardNav />
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
