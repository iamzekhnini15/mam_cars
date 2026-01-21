import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Car, Wrench, TrendingUp, Package } from 'lucide-react';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">MAM Cars</h1>
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
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">
            Tableau de bord
          </h2>
          <p className="text-gray-600 mt-2">
            Bienvenue {session.user.prenom} ! Voici un aperçu de votre stock.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Véhicules en stock
              </CardTitle>
              <Car className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-gray-600 mt-1">
                Aucun véhicule pour le moment
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Interventions en cours
              </CardTitle>
              <Wrench className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-gray-600 mt-1">
                Aucune intervention
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Valeur du stock
              </CardTitle>
              <Package className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0 €</div>
              <p className="text-xs text-gray-600 mt-1">
                Aucun investissement
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Marge totale
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0 €</div>
              <p className="text-xs text-gray-600 mt-1">
                Pas de ventes
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Actions rapides</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link href="/dashboard/vehicules/nouveau">
                <Button className="w-full" size="lg">
                  <Car className="mr-2 h-5 w-5" />
                  Ajouter un véhicule
                </Button>
              </Link>
              <Link href="/dashboard/vehicules">
                <Button variant="outline" className="w-full" size="lg">
                  <Package className="mr-2 h-5 w-5" />
                  Voir les véhicules
                </Button>
              </Link>
              <Link href="/dashboard/interventions">
                <Button variant="outline" className="w-full" size="lg">
                  <Wrench className="mr-2 h-5 w-5" />
                  Interventions
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-2">
            🎉 Bienvenue sur MAM Cars !
          </h3>
          <p className="text-blue-800 text-sm">
            Votre application de gestion de stock automobile est prête. Commencez par ajouter
            votre premier véhicule pour démarrer la gestion de votre concession.
          </p>
        </div>
      </main>
    </div>
  );
}
