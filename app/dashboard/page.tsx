import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Car, Wrench, TrendingUp, Package } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  // Récupérer les statistiques
  const [
    totalVehicules,
    vehiculesEnStock,
    vehiculesVendus,
    interventionsEnCours,
    statsFinancieres,
  ] = await Promise.all([
    // Nombre total de véhicules
    prisma.vehicule.count(),
    
    // Véhicules en stock (non vendus)
    prisma.vehicule.count({
      where: {
        statut: {
          in: ['EN_STOCK', 'EN_REPARATION', 'PRET_A_VENDRE', 'RESERVE'],
        },
      },
    }),
    
    // Véhicules vendus
    prisma.vehicule.count({
      where: {
        statut: 'VENDU',
      },
    }),
    
    // Interventions en cours ou à faire
    prisma.intervention.count({
      where: {
        statut: {
          in: ['A_FAIRE', 'EN_COURS'],
        },
      },
    }),
    
    // Statistiques financières
    prisma.vehicule.aggregate({
      where: {
        statut: {
          in: ['EN_STOCK', 'EN_REPARATION', 'PRET_A_VENDRE', 'RESERVE'],
        },
      },
      _sum: {
        prixAchat: true,
        coutReparations: true,
      },
    }),
  ]);

  // Calculer la valeur totale du stock (prix d'achat + coûts de réparation)
  const valeurStock =
    Number(statsFinancieres._sum.prixAchat || 0) +
    Number(statsFinancieres._sum.coutReparations || 0);

  // Calculer la marge totale des véhicules vendus
  const vehiculesVendusData = await prisma.vehicule.findMany({
    where: {
      statut: 'VENDU',
      prixVenteFinal: {
        not: null,
      },
    },
    select: {
      prixVenteFinal: true,
      prixAchat: true,
      coutReparations: true,
    },
  });

  const margeTotale = vehiculesVendusData.reduce((acc, v) => {
    if (!v.prixVenteFinal) return acc;
    const prixVente = Number(v.prixVenteFinal);
    const coutTotal = Number(v.prixAchat) + Number(v.coutReparations || 0);
    return acc + (prixVente - coutTotal);
  }, 0);

  return (
    <>
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
              <div className="text-2xl font-bold">{vehiculesEnStock}</div>
              <p className="text-xs text-gray-600 mt-1">
                {vehiculesVendus} véhicule(s) vendu(s)
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
              <div className="text-2xl font-bold">{interventionsEnCours}</div>
              <p className="text-xs text-gray-600 mt-1">
                {interventionsEnCours === 0
                  ? 'Aucune intervention'
                  : `${interventionsEnCours} intervention(s) active(s)`}
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
              <div className="text-2xl font-bold">{formatPrice(valeurStock)}</div>
              <p className="text-xs text-gray-600 mt-1">
                Investissement total
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
              <div className={`text-2xl font-bold ${margeTotale >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatPrice(margeTotale)}
              </div>
              <p className="text-xs text-gray-600 mt-1">
                Sur {vehiculesVendus} vente(s)
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

    </>
  );
}
