'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { vehiculeSchema, type VehiculeFormData } from '@/lib/validations/vehicule';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { carburantLabels, transmissionLabels, statutVehiculeLabels } from '@/lib/utils';

type VehiculeFormProps = {
  vehicule?: any;
  isEdit?: boolean;
};

export function VehiculeForm({ vehicule, isEdit = false }: VehiculeFormProps) {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VehiculeFormData>({
    resolver: zodResolver(vehiculeSchema),
    defaultValues: vehicule
      ? {
          ...vehicule,
          dateAchat: new Date(vehicule.dateAchat).toISOString().split('T')[0],
          prixAchat: Number(vehicule.prixAchat),
          prixVenteEstime: vehicule.prixVenteEstime
            ? Number(vehicule.prixVenteEstime)
            : undefined,
          prixVenteFinal: vehicule.prixVenteFinal
            ? Number(vehicule.prixVenteFinal)
            : undefined,
          coutReparations: vehicule.coutReparations
            ? Number(vehicule.coutReparations)
            : undefined,
          puissance: vehicule.puissance || undefined,
          nombrePortes: vehicule.nombrePortes || undefined,
          nombrePlaces: vehicule.nombrePlaces || undefined,
          version: vehicule.version || undefined,
          couleur: vehicule.couleur || '',
          emplacement: vehicule.emplacement || undefined,
          notes: vehicule.notes || undefined,
          optionsEquipements: vehicule.optionsEquipements || undefined,
          defautsConnus: vehicule.defautsConnus || undefined,
        }
      : {
          statut: 'EN_STOCK',
          dateAchat: new Date().toISOString().split('T')[0],
        },
  });

  const onSubmit = async (data: VehiculeFormData) => {
    setError('');
    setLoading(true);

    try {
      const url = isEdit ? `/api/vehicules/${vehicule.id}` : '/api/vehicules';
      const method = isEdit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || 'Une erreur est survenue');
        return;
      }

      router.push(`/dashboard/vehicules/${result.id}`);
      router.refresh();
    } catch (error) {
      setError('Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Informations principales */}
      <Card>
        <CardHeader>
          <CardTitle>Informations principales</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="vin">
              VIN <span className="text-red-500">*</span>
            </Label>
            <Input
              id="vin"
              {...register('vin')}
              placeholder="Ex: 1HGBH41JXMN109186"
              maxLength={17}
              disabled={loading}
              className="font-mono"
            />
            {errors.vin && (
              <p className="text-sm text-red-500 mt-1">{errors.vin.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="marque">
                Marque <span className="text-red-500">*</span>
              </Label>
              <Input
                id="marque"
                {...register('marque')}
                placeholder="Ex: Renault"
                disabled={loading}
              />
              {errors.marque && (
                <p className="text-sm text-red-500 mt-1">{errors.marque.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="modele">
                Modèle <span className="text-red-500">*</span>
              </Label>
              <Input
                id="modele"
                {...register('modele')}
                placeholder="Ex: Clio"
                disabled={loading}
              />
              {errors.modele && (
                <p className="text-sm text-red-500 mt-1">{errors.modele.message}</p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="version">Version</Label>
            <Input
              id="version"
              {...register('version')}
              placeholder="Ex: IV RS Line"
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="annee">
                Année <span className="text-red-500">*</span>
              </Label>
              <Input
                id="annee"
                type="number"
                {...register('annee', { valueAsNumber: true })}
                placeholder="2020"
                disabled={loading}
              />
              {errors.annee && (
                <p className="text-sm text-red-500 mt-1">{errors.annee.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="kilometrage">
                Kilométrage <span className="text-red-500">*</span>
              </Label>
              <Input
                id="kilometrage"
                type="number"
                {...register('kilometrage', { valueAsNumber: true })}
                placeholder="50000"
                disabled={loading}
              />
              {errors.kilometrage && (
                <p className="text-sm text-red-500 mt-1">{errors.kilometrage.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="couleur">
                Couleur <span className="text-red-500">*</span>
              </Label>
              <Input
                id="couleur"
                {...register('couleur')}
                placeholder="Noir"
                disabled={loading}
              />
              {errors.couleur && (
                <p className="text-sm text-red-500 mt-1">{errors.couleur.message}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Caractéristiques techniques */}
      <Card>
        <CardHeader>
          <CardTitle>Caractéristiques techniques</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="carburant">
                Carburant <span className="text-red-500">*</span>
              </Label>
              <select
                id="carburant"
                {...register('carburant')}
                disabled={loading}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">Sélectionner...</option>
                {Object.entries(carburantLabels).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
              {errors.carburant && (
                <p className="text-sm text-red-500 mt-1">{errors.carburant.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="transmission">
                Transmission <span className="text-red-500">*</span>
              </Label>
              <select
                id="transmission"
                {...register('transmission')}
                disabled={loading}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">Sélectionner...</option>
                {Object.entries(transmissionLabels).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
              {errors.transmission && (
                <p className="text-sm text-red-500 mt-1">{errors.transmission.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="puissance">Puissance (ch)</Label>
              <Input
                id="puissance"
                type="number"
                {...register('puissance', { valueAsNumber: true })}
                placeholder="90"
                disabled={loading}
              />
            </div>

            <div>
              <Label htmlFor="nombrePortes">Nombre de portes</Label>
              <Input
                id="nombrePortes"
                type="number"
                {...register('nombrePortes', { valueAsNumber: true })}
                placeholder="5"
                min="2"
                max="5"
                disabled={loading}
              />
            </div>

            <div>
              <Label htmlFor="nombrePlaces">Nombre de places</Label>
              <Input
                id="nombrePlaces"
                type="number"
                {...register('nombrePlaces', { valueAsNumber: true })}
                placeholder="5"
                min="2"
                max="9"
                disabled={loading}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Informations financières */}
      <Card>
        <CardHeader>
          <CardTitle>Informations financières</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="prixAchat">
                Prix d'achat (€) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="prixAchat"
                type="number"
                step="0.01"
                {...register('prixAchat', { valueAsNumber: true })}
                placeholder="10000.00"
                disabled={loading}
              />
              {errors.prixAchat && (
                <p className="text-sm text-red-500 mt-1">{errors.prixAchat.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="prixVenteEstime">Prix de vente estimé (€)</Label>
              <Input
                id="prixVenteEstime"
                type="number"
                step="0.01"
                {...register('prixVenteEstime', { valueAsNumber: true })}
                placeholder="12000.00"
                disabled={loading}
              />
            </div>

            <div>
              <Label htmlFor="dateAchat">
                Date d'achat <span className="text-red-500">*</span>
              </Label>
              <Input
                id="dateAchat"
                type="date"
                {...register('dateAchat')}
                disabled={loading}
              />
              {errors.dateAchat && (
                <p className="text-sm text-red-500 mt-1">{errors.dateAchat.message}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statut et localisation */}
      <Card>
        <CardHeader>
          <CardTitle>Statut et localisation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="statut">Statut</Label>
              <select
                id="statut"
                {...register('statut')}
                disabled={loading}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {Object.entries(statutVehiculeLabels).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="emplacement">Emplacement</Label>
              <Input
                id="emplacement"
                {...register('emplacement')}
                placeholder="Ex: Zone A - Rangée 3"
                disabled={loading}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Informations complémentaires */}
      <Card>
        <CardHeader>
          <CardTitle>Informations complémentaires</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="optionsEquipements">Options et équipements</Label>
            <Textarea
              id="optionsEquipements"
              {...register('optionsEquipements')}
              placeholder="Ex: Climatisation, GPS, Régulateur de vitesse..."
              rows={3}
              disabled={loading}
            />
          </div>

          <div>
            <Label htmlFor="defautsConnus">Défauts connus</Label>
            <Textarea
              id="defautsConnus"
              {...register('defautsConnus')}
              placeholder="Ex: Rayure sur le pare-chocs avant..."
              rows={3}
              disabled={loading}
            />
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              {...register('notes')}
              placeholder="Autres informations..."
              rows={4}
              disabled={loading}
            />
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-4 justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={loading}
        >
          Annuler
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'En cours...' : isEdit ? 'Mettre à jour' : 'Ajouter le véhicule'}
        </Button>
      </div>
    </form>
  );
}
