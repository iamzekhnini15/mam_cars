import { notFound, redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';
import {
    formatPrice,
    formatDate,
    typeInterventionLabels,
    statutInterventionLabels,
} from '@/lib/utils';

interface InterventionDetailPageProps {
    params: Promise<{ id: string }>;
}

export default async function InterventionDetailPage({ params }: InterventionDetailPageProps) {
    const session = await getServerSession(authOptions);
    if (!session) {
        redirect('/login');
    }

    const { id } = await params;

    const intervention = await prisma.intervention.findUnique({
        where: { id },
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
    });

    if (!intervention) {
        notFound();
    }

    return (
        <main className="container mx-auto px-4 py-8">

            {/* En-tête */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/interventions">
                        <Button variant="outline" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold">
                            {typeInterventionLabels[intervention.type]}
                        </h1>
                        <p className="text-muted-foreground">
                            {intervention.vehicule.marque} {intervention.vehicule.modele}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Link href={`/dashboard/interventions/${intervention.id}/edit`}>
                        <Button variant="outline">
                            <Edit className="h-4 w-4 mr-2" />
                            Modifier
                        </Button>
                    </Link>
                    <Button variant="destructive">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Supprimer
                    </Button>
                </div>
            </div>

            {/* Statut */}
            <div className="flex items-center gap-2">
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
                {intervention.priorite === 3 && (
                    <Badge variant="destructive">Haute priorité</Badge>
                )}
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Informations générales */}
                <Card>
                    <CardHeader>
                        <CardTitle>Informations générales</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <span className="text-muted-foreground">Type</span>
                            <span className="font-medium">{typeInterventionLabels[intervention.type]}</span>

                            <span className="text-muted-foreground">Statut</span>
                            <span className="font-medium">{statutInterventionLabels[intervention.statut]}</span>

                            <span className="text-muted-foreground">Priorité</span>
                            <span className="font-medium">
                                {intervention.priorite === 1
                                    ? 'Basse'
                                    : intervention.priorite === 2
                                        ? 'Moyenne'
                                        : 'Haute'}
                            </span>

                            {intervention.prestataire && (
                                <>
                                    <span className="text-muted-foreground">Prestataire</span>
                                    <span className="font-medium">{intervention.prestataire}</span>
                                </>
                            )}

                            <span className="text-muted-foreground">Créé par</span>
                            <span className="font-medium">
                                {intervention.creator.prenom} {intervention.creator.nom}
                            </span>
                        </div>
                    </CardContent>
                </Card>

                {/* Véhicule concerné */}
                <Card>
                    <CardHeader>
                        <CardTitle>Véhicule concerné</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <span className="text-muted-foreground">Marque</span>
                            <span className="font-medium">{intervention.vehicule.marque}</span>

                            <span className="text-muted-foreground">Modèle</span>
                            <span className="font-medium">{intervention.vehicule.modele}</span>

                            {intervention.vehicule.version && (
                                <>
                                    <span className="text-muted-foreground">Version</span>
                                    <span className="font-medium">{intervention.vehicule.version}</span>
                                </>
                            )}

                            <span className="text-muted-foreground">VIN</span>
                            <span className="font-medium font-mono text-xs">{intervention.vehicule.vin}</span>
                        </div>

                        <Link href={`/dashboard/vehicules/${intervention.vehicule.id}`}>
                            <Button variant="outline" className="w-full mt-2">
                                Voir le véhicule
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>

            {/* Description */}
            <Card>
                <CardHeader>
                    <CardTitle>Description</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm whitespace-pre-wrap">{intervention.description}</p>
                </CardContent>
            </Card>

            {/* Coût et planning */}
            <Card>
                <CardHeader>
                    <CardTitle>Coût et planning</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                        <span className="text-muted-foreground">Coût</span>
                        <span className="font-medium text-lg">{formatPrice(Number(intervention.cout))}</span>

                        {intervention.datePrevue && (
                            <>
                                <span className="text-muted-foreground">Date prévue</span>
                                <span className="font-medium">{formatDate(intervention.datePrevue)}</span>
                            </>
                        )}

                        {intervention.dateDebut && (
                            <>
                                <span className="text-muted-foreground">Date de début</span>
                                <span className="font-medium">{formatDate(intervention.dateDebut)}</span>
                            </>
                        )}

                        {intervention.dateRealisation && (
                            <>
                                <span className="text-muted-foreground">Date de réalisation</span>
                                <span className="font-medium">{formatDate(intervention.dateRealisation)}</span>
                            </>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Pièces fournies */}
            {intervention.piecesFournies && (
                <Card>
                    <CardHeader>
                        <CardTitle>Pièces fournies</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm whitespace-pre-wrap">{intervention.piecesFournies}</p>
                    </CardContent>
                </Card>
            )}

            {/* Garantie */}
            {intervention.garantie && (
                <Card>
                    <CardHeader>
                        <CardTitle>Garantie</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm">{intervention.garantie}</p>
                    </CardContent>
                </Card>
            )}

            {/* Notes */}
            {intervention.notes && (
                <Card>
                    <CardHeader>
                        <CardTitle>Notes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm whitespace-pre-wrap">{intervention.notes}</p>
                    </CardContent>
                </Card>
            )}
        </main>
    );
}
