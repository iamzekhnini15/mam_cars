import { notFound, redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit, Trash2, Plus } from 'lucide-react';
import Link from 'next/link';
import { DeleteVehiculeButton } from '@/components/vehicules/DeleteVehiculeButton';
import {
    formatPrice,
    formatKilometrage,
    formatDate,
    formatDateTime,
    calculateMarge,
    calculateMargePourcentage,
    statutVehiculeLabels,
    carburantLabels,
    transmissionLabels,
} from '@/lib/utils';

interface VehiculeDetailPageProps {
    params: Promise<{ id: string }>;
}

export default async function VehiculeDetailPage({ params }: VehiculeDetailPageProps) {
    const session = await getServerSession(authOptions);
    if (!session) {
        redirect('/login');
    }

    const { id } = await params;

    const vehicule = await prisma.vehicule.findUnique({
        where: { id },
        include: {
            creator: {
                select: {
                    id: true,
                    nom: true,
                    prenom: true,
                },
            },
            interventions: {
                orderBy: {
                    dateDebut: 'desc',
                },
            },
            photos: {
                orderBy: {
                    ordre: 'asc',
                },
            },
            historique: {
                orderBy: {
                    createdAt: 'desc',
                },
                include: {
                    user: {
                        select: {
                            nom: true,
                            prenom: true,
                        },
                    },
                },
            },
        },
    });

    if (!vehicule) {
        notFound();
    }

    const prixVente = Number(vehicule.prixVenteFinal || vehicule.prixVenteEstime || 0);
    const marge = calculateMarge(prixVente, Number(vehicule.prixAchat), Number(vehicule.coutReparations || 0));
    const margePourcentage = calculateMargePourcentage(prixVente, Number(vehicule.prixAchat), Number(vehicule.coutReparations || 0));

    return (
        <main className="container mx-auto px-4 py-8">

            {/* En-tête */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/vehicules">
                        <Button variant="outline" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold">
                            {vehicule.marque} {vehicule.modele}
                        </h1>
                        <p className="text-muted-foreground">
                            {vehicule.version} • {vehicule.annee}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Link href={`/dashboard/vehicules/${vehicule.id}/edit`}>
                        <Button variant="outline">
                            <Edit className="h-4 w-4 mr-2" />
                            Modifier
                        </Button>
                    </Link>
                    <DeleteVehiculeButton
                        vehiculeId={vehicule.id}
                        vehiculeName={`${vehicule.marque} ${vehicule.modele}`}
                    />
                </div>
            </div>

            {/* Statut */}
            <div>
                <Badge
                    variant={
                        vehicule.statut === 'VENDU'
                            ? 'default'
                            : vehicule.statut === 'PRET_A_VENDRE'
                                ? 'default'
                                : vehicule.statut === 'EN_REPARATION'
                                    ? 'secondary'
                                    : 'outline'
                    }
                >
                    {statutVehiculeLabels[vehicule.statut]}
                </Badge>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Informations générales */}
                <Card>
                    <CardHeader>
                        <CardTitle>Informations générales</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <span className="text-muted-foreground">VIN</span>
                            <span className="font-medium">{vehicule.vin}</span>

                            <span className="text-muted-foreground">Marque</span>
                            <span className="font-medium">{vehicule.marque}</span>

                            <span className="text-muted-foreground">Modèle</span>
                            <span className="font-medium">{vehicule.modele}</span>

                            <span className="text-muted-foreground">Version</span>
                            <span className="font-medium">{vehicule.version || '-'}</span>

                            <span className="text-muted-foreground">Année</span>
                            <span className="font-medium">{vehicule.annee}</span>

                            <span className="text-muted-foreground">Kilométrage</span>
                            <span className="font-medium">{formatKilometrage(vehicule.kilometrage)}</span>

                            <span className="text-muted-foreground">Couleur</span>
                            <span className="font-medium">{vehicule.couleur || '-'}</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Caractéristiques techniques */}
                <Card>
                    <CardHeader>
                        <CardTitle>Caractéristiques techniques</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <span className="text-muted-foreground">Carburant</span>
                            <span className="font-medium">{carburantLabels[vehicule.carburant]}</span>

                            <span className="text-muted-foreground">Transmission</span>
                            <span className="font-medium">{transmissionLabels[vehicule.transmission]}</span>

                            <span className="text-muted-foreground">Puissance</span>
                            <span className="font-medium">{vehicule.puissance ? `${vehicule.puissance} ch` : '-'}</span>

                            <span className="text-muted-foreground">Portes</span>
                            <span className="font-medium">{vehicule.nombrePortes || '-'}</span>

                            <span className="text-muted-foreground">Places</span>
                            <span className="font-medium">{vehicule.nombrePlaces || '-'}</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Informations financières */}
                <Card>
                    <CardHeader>
                        <CardTitle>Informations financières</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <span className="text-muted-foreground">Prix d'achat</span>
                            <span className="font-medium">{formatPrice(Number(vehicule.prixAchat))}</span>

                            <span className="text-muted-foreground">Coût des réparations</span>
                            <span className="font-medium">{formatPrice(Number(vehicule.coutReparations))}</span>

                            <span className="text-muted-foreground">Prix de vente estimé</span>
                            <span className="font-medium">{formatPrice(Number(vehicule.prixVenteEstime))}</span>

                            {vehicule.prixVenteFinal && (
                                <>
                                    <span className="text-muted-foreground">Prix de vente final</span>
                                    <span className="font-medium">{formatPrice(Number(vehicule.prixVenteFinal))}</span>
                                </>
                            )}

                            <span className="text-muted-foreground">Marge estimée</span>
                            <span className={`font-medium ${marge >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {formatPrice(marge)} ({margePourcentage.toFixed(1)}%)
                            </span>
                        </div>
                    </CardContent>
                </Card>

                {/* Dates importantes */}
                <Card>
                    <CardHeader>
                        <CardTitle>Dates importantes</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <span className="text-muted-foreground">Date d'achat</span>
                            <span className="font-medium">{formatDate(vehicule.dateAchat)}</span>

                            {vehicule.dateMiseEnLigne && (
                                <>
                                    <span className="text-muted-foreground">Mise en ligne</span>
                                    <span className="font-medium">{formatDate(vehicule.dateMiseEnLigne)}</span>
                                </>
                            )}

                            {vehicule.dateVente && (
                                <>
                                    <span className="text-muted-foreground">Date de vente</span>
                                    <span className="font-medium">{formatDate(vehicule.dateVente)}</span>
                                </>
                            )}

                            <span className="text-muted-foreground">Emplacement</span>
                            <span className="font-medium">{vehicule.emplacement || '-'}</span>

                            <span className="text-muted-foreground">Créé par</span>
                            <span className="font-medium">
                                {vehicule.creator.prenom} {vehicule.creator.nom}
                            </span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Options et équipements */}
            {vehicule.optionsEquipements && (() => {
                try {
                    const options = JSON.parse(vehicule.optionsEquipements);
                    return Array.isArray(options) && options.length > 0 ? (
                        <Card>
                            <CardHeader>
                                <CardTitle>Options et équipements</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-2">
                                    {options.map((option: string, index: number) => (
                                        <Badge key={index} variant="secondary">
                                            {option}
                                        </Badge>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    ) : null;
                } catch {
                    return null;
                }
            })()}

            {/* Défauts connus */}
            {vehicule.defautsConnus && (() => {
                try {
                    const defauts = JSON.parse(vehicule.defautsConnus);
                    return Array.isArray(defauts) && defauts.length > 0 ? (
                        <Card>
                            <CardHeader>
                                <CardTitle>Défauts connus</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="list-disc list-inside space-y-1 text-sm">
                                    {defauts.map((defaut: string, index: number) => (
                                        <li key={index}>{defaut}</li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    ) : null;
                } catch {
                    return null;
                }
            })()}

            {/* Notes */}
            {vehicule.notes && (
                <Card>
                    <CardHeader>
                        <CardTitle>Notes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm whitespace-pre-wrap">{vehicule.notes}</p>
                    </CardContent>
                </Card>
            )}

            {/* Interventions */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Interventions</CardTitle>
                            <CardDescription>
                                {vehicule.interventions.length} intervention(s) enregistrée(s)
                            </CardDescription>
                        </div>
                        <Link href={`/dashboard/vehicules/${vehicule.id}/interventions/nouvelle`}>
                            <Button size="sm">
                                <Plus className="h-4 w-4 mr-2" />
                                Ajouter
                            </Button>
                        </Link>
                    </div>
                </CardHeader>
                <CardContent>
                    {vehicule.interventions.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">
                            Aucune intervention enregistrée
                        </p>
                    ) : (
                        <div className="space-y-3">
                            {vehicule.interventions.map((intervention: typeof vehicule.interventions[0]) => (
                                <div
                                    key={intervention.id}
                                    className="flex items-center justify-between p-3 border rounded-lg"
                                >
                                    <div>
                                        <p className="font-medium">{intervention.type}</p>
                                        <p className="text-sm text-muted-foreground">{intervention.description}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {intervention.dateDebut && formatDate(intervention.dateDebut)}
                                            {intervention.dateRealisation && ` - ${formatDate(intervention.dateRealisation)}`}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium">{formatPrice(Number(intervention.cout))}</p>
                                        <Badge variant="secondary">{intervention.statut}</Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Historique */}
            <Card>
                <CardHeader>
                    <CardTitle>Historique des modifications</CardTitle>
                    <CardDescription>
                        {vehicule.historique.length} modification(s) enregistrée(s)
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {vehicule.historique.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">
                            Aucune modification enregistrée
                        </p>
                    ) : (
                        <div className="space-y-3">
                            {vehicule.historique.map((entry: typeof vehicule.historique[0]) => (
                                <div key={entry.id} className="flex gap-3 text-sm">
                                    <div className="text-muted-foreground whitespace-nowrap">
                                        {formatDateTime(entry.createdAt)}
                                    </div>
                                    <div className="flex-1">
                                        <span className="font-medium">{entry.action}</span>
                                        {entry.details && (
                                            <span className="text-muted-foreground"> - {entry.details}</span>
                                        )}
                                        <div className="text-xs text-muted-foreground">
                                            par {entry.user.prenom} {entry.user.nom}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </main>
    );
}
