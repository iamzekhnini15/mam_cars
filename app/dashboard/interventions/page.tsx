import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { formatPrice, formatDate, typeInterventionLabels, statutInterventionLabels } from '@/lib/utils';

export default async function InterventionsPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect('/login');
  }

  const interventions = await prisma.intervention.findMany({
    include: {
      vehicule: {
        select: {
          id: true,
          marque: true,
          modele: true,
          version: true,
          vin: true,
          statut: true,
        },
      },
      creator: {
        select: {
          id: true,
          nom: true,
          prenom: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  // Statistiques
  const stats = {
    total: interventions.length,
    aFaire: interventions.filter(i => i.statut === 'A_FAIRE').length,
    enCours: interventions.filter(i => i.statut === 'EN_COURS').length,
    termine: interventions.filter(i => i.statut === 'TERMINE').length,
    coutTotal: interventions.reduce((acc, i) => acc + Number(i.cout), 0),
  };

  return (
    <>
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Interventions</h1>
          <p className="text-muted-foreground">
            Gérez toutes les réparations et entretiens
          </p>
        </div>
        <Link href="/dashboard/interventions/nouvelle">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle intervention
          </Button>
        </Link>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              À faire
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.aFaire}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              En cours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.enCours}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Terminé
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.termine}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Coût total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(stats.coutTotal)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Liste des interventions */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des interventions</CardTitle>
          <CardDescription>
            {interventions.length} intervention(s) enregistrée(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {interventions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                Aucune intervention enregistrée
              </p>
              <Link href="/dashboard/interventions/nouvelle">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Créer la première intervention
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {interventions.map((intervention) => (
                <Link
                  key={intervention.id}
                  href={`/dashboard/interventions/${intervention.id}`}
                  className="block"
                >
                  <div className="border rounded-lg p-4 hover:bg-accent transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Badge
                            variant={
                              intervention.statut === 'TERMINE'
                                ? 'default'
                                : intervention.statut === 'EN_COURS'
                                ? 'secondary'
                                : 'outline'
                            }
                          >
                            {statutInterventionLabels[intervention.statut]}
                          </Badge>
                          <Badge variant="outline">
                            {typeInterventionLabels[intervention.type]}
                          </Badge>
                          {intervention.priorite === 3 && (
                            <Badge variant="destructive">Haute priorité</Badge>
                          )}
                        </div>

                        <h3 className="font-semibold text-lg mb-1">
                          {intervention.vehicule.marque} {intervention.vehicule.modele}
                          {intervention.vehicule.version && ` ${intervention.vehicule.version}`}
                        </h3>

                        <p className="text-sm text-muted-foreground mb-2">
                          {intervention.description}
                        </p>

                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          {intervention.dateDebut && (
                            <span>Début: {formatDate(intervention.dateDebut)}</span>
                          )}
                          {intervention.dateRealisation && (
                            <span>Fin: {formatDate(intervention.dateRealisation)}</span>
                          )}
                          {intervention.prestataire && (
                            <span>Prestataire: {intervention.prestataire}</span>
                          )}
                        </div>
                      </div>

                      <div className="text-right ml-4">
                        <div className="text-lg font-bold">
                          {formatPrice(Number(intervention.cout))}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {intervention.creator.prenom} {intervention.creator.nom}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
