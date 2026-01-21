import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Car, Plus } from 'lucide-react';
import { VehiculesTable } from '@/components/vehicules/VehiculesTable';

export default async function VehiculesPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  return (
    <>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Car className="h-8 w-8" />
              Véhicules
            </h2>
            <p className="text-gray-600 mt-2">
              Gérez votre stock de véhicules
            </p>
          </div>
          <Link href="/dashboard/vehicules/nouveau">
            <Button size="lg">
              <Plus className="mr-2 h-5 w-5" />
              Ajouter un véhicule
            </Button>
          </Link>
        </div>

        <VehiculesTable />
    </>
  );
}
