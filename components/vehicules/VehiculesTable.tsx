'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { formatPrice, formatKilometrage, statutVehiculeLabels } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Eye, Pencil, Search, Car } from 'lucide-react';

type StatutVehicule = 'EN_STOCK' | 'EN_REPARATION' | 'PRET_A_VENDRE' | 'VENDU' | 'RESERVE';

type Vehicule = {
  id: string;
  vin: string;
  marque: string;
  modele: string;
  annee: number;
  kilometrage: number;
  prixAchat: number;
  prixVenteEstime: number | null;
  statut: StatutVehicule;
  dateAchat: string;
  creator: {
    nom: string;
    prenom: string;
  };
  _count: {
    interventions: number;
  };
};

const statutColors: Record<StatutVehicule, string> = {
  EN_STOCK: 'bg-blue-100 text-blue-800',
  EN_REPARATION: 'bg-yellow-100 text-yellow-800',
  PRET_A_VENDRE: 'bg-green-100 text-green-800',
  VENDU: 'bg-gray-100 text-gray-800',
  RESERVE: 'bg-purple-100 text-purple-800',
};

export function VehiculesTable() {
  const [vehicules, setVehicules] = useState<Vehicule[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statutFilter, setStatutFilter] = useState<string>('');

  useEffect(() => {
    fetchVehicules();
  }, [statutFilter]);

  const fetchVehicules = async () => {
    try {
      setLoading(true);
      let url = '/api/vehicules';
      const params = new URLSearchParams();
      
      if (statutFilter) params.append('statut', statutFilter);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setVehicules(data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des véhicules:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredVehicules = vehicules.filter((v) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      v.vin.toLowerCase().includes(searchLower) ||
      v.marque.toLowerCase().includes(searchLower) ||
      v.modele.toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return (
      <Card>
        <CardContent className="py-10 text-center">
          <p className="text-gray-600">Chargement...</p>
        </CardContent>
      </Card>
    );
  }

  if (vehicules.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center">
          <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Aucun véhicule
          </h3>
          <p className="text-gray-600 mb-4">
            Commencez par ajouter votre premier véhicule au stock
          </p>
          <Link href="/dashboard/vehicules/nouveau">
            <Button>Ajouter un véhicule</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filtres */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Rechercher par VIN, marque ou modèle..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={statutFilter}
              onChange={(e) => setStatutFilter(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">Tous les statuts</option>
              {Object.entries(statutVehiculeLabels).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Tableau responsive */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {filteredVehicules.map((vehicule) => (
          <Card key={vehicule.id}>
            <CardContent className="pt-6">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">
                      {vehicule.marque} {vehicule.modele}
                    </h3>
                    <p className="text-sm text-gray-600">{vehicule.annee}</p>
                  </div>
                  <Badge className={statutColors[vehicule.statut]}>
                    {statutVehiculeLabels[vehicule.statut]}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-gray-600">VIN</p>
                    <p className="font-mono">{vehicule.vin}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Kilométrage</p>
                    <p>{formatKilometrage(vehicule.kilometrage)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Prix d'achat</p>
                    <p className="font-semibold">{formatPrice(Number(vehicule.prixAchat))}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Interventions</p>
                    <p>{vehicule._count.interventions}</p>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Link href={`/dashboard/vehicules/${vehicule.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      <Eye className="mr-2 h-4 w-4" />
                      Voir
                    </Button>
                  </Link>
                  <Link href={`/dashboard/vehicules/${vehicule.id}/edit`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      <Pencil className="mr-2 h-4 w-4" />
                      Modifier
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tableau desktop */}
      <Card className="hidden md:block">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Véhicule
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    VIN
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kilométrage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Prix d'achat
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Interventions
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredVehicules.map((vehicule) => (
                  <tr key={vehicule.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="font-medium text-gray-900">
                          {vehicule.marque} {vehicule.modele}
                        </div>
                        <div className="text-sm text-gray-500">{vehicule.annee}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-mono text-sm">{vehicule.vin}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatKilometrage(vehicule.kilometrage)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      {formatPrice(Number(vehicule.prixAchat))}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge className={statutColors[vehicule.statut]}>
                        {statutVehiculeLabels[vehicule.statut]}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {vehicule._count.interventions}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <Link href={`/dashboard/vehicules/${vehicule.id}`}>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link href={`/dashboard/vehicules/${vehicule.id}/edit`}>
                          <Button variant="ghost" size="sm">
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="text-sm text-gray-600">
        {filteredVehicules.length} véhicule{filteredVehicules.length > 1 ? 's' : ''} affiché{filteredVehicules.length > 1 ? 's' : ''}
      </div>
    </div>
  );
}
