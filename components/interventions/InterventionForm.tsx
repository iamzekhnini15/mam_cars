'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { interventionSchema, type InterventionFormData } from '@/lib/validations/intervention';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { typeInterventionLabels, statutInterventionLabels } from '@/lib/utils';
import { TypeIntervention, StatutIntervention } from '@prisma/client';

type InterventionFormProps = {
  intervention?: any;
  vehiculeId?: string;
};

export function InterventionForm({ intervention, vehiculeId }: InterventionFormProps) {
  const isEdit = !!intervention;
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<InterventionFormData>({
    resolver: zodResolver(interventionSchema),
    defaultValues: intervention
      ? {
          ...intervention,
          vehiculeId: intervention.vehiculeId,
          datePrevue: intervention.datePrevue
            ? new Date(intervention.datePrevue).toISOString().split('T')[0]
            : undefined,
          dateDebut: intervention.dateDebut
            ? new Date(intervention.dateDebut).toISOString().split('T')[0]
            : undefined,
          dateRealisation: intervention.dateRealisation
            ? new Date(intervention.dateRealisation).toISOString().split('T')[0]
            : undefined,
          cout: intervention.cout ? Number(intervention.cout) : undefined,
          priorite: intervention.priorite || 1,
        }
      : {
          vehiculeId: vehiculeId || '',
          statut: 'A_FAIRE' as StatutIntervention,
          priorite: 1,
          cout: 0,
        },
  });

  const onSubmit = async (data: InterventionFormData) => {
    setError('');
    setLoading(true);

    try {
      const url = isEdit ? `/api/interventions/${intervention.id}` : '/api/interventions';
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

      // Rediriger vers la page de détail de l'intervention ou du véhicule
      if (vehiculeId) {
        router.push(`/dashboard/vehicules/${vehiculeId}`);
      } else {
        router.push(`/dashboard/interventions/${result.id}`);
      }
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
          {!vehiculeId && (
            <div>
              <Label htmlFor="vehiculeId">
                Véhicule <span className="text-red-500">*</span>
              </Label>
              <Input
                id="vehiculeId"
                {...register('vehiculeId')}
                placeholder="ID du véhicule"
                disabled={loading}
              />
              {errors.vehiculeId && (
                <p className="text-sm text-red-500 mt-1">{errors.vehiculeId.message}</p>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="type">
                Type d'intervention <span className="text-red-500">*</span>
              </Label>
              <select
                id="type"
                {...register('type')}
                disabled={loading}
                className="w-full px-3 py-2 border rounded-md"
              >
                {Object.entries(typeInterventionLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              {errors.type && (
                <p className="text-sm text-red-500 mt-1">{errors.type.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="statut">Statut</Label>
              <select
                id="statut"
                {...register('statut')}
                disabled={loading}
                className="w-full px-3 py-2 border rounded-md"
              >
                {Object.entries(statutInterventionLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <Label htmlFor="description">
              Description <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Décrivez l'intervention à effectuer..."
              rows={4}
              disabled={loading}
            />
            {errors.description && (
              <p className="text-sm text-red-500 mt-1">{errors.description.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="priorite">Priorité</Label>
              <select
                id="priorite"
                {...register('priorite', { valueAsNumber: true })}
                disabled={loading}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value={1}>Basse</option>
                <option value={2}>Moyenne</option>
                <option value={3}>Haute</option>
              </select>
            </div>

            <div>
              <Label htmlFor="prestataire">Prestataire</Label>
              <Input
                id="prestataire"
                {...register('prestataire')}
                placeholder="Nom du prestataire"
                disabled={loading}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Informations financières et dates */}
      <Card>
        <CardHeader>
          <CardTitle>Coût et planning</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="cout">Coût (€)</Label>
            <Input
              id="cout"
              type="number"
              step="0.01"
              {...register('cout', { valueAsNumber: true })}
              placeholder="0.00"
              disabled={loading}
            />
            {errors.cout && (
              <p className="text-sm text-red-500 mt-1">{errors.cout.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="datePrevue">Date prévue</Label>
              <Input
                id="datePrevue"
                type="date"
                {...register('datePrevue')}
                disabled={loading}
              />
            </div>

            <div>
              <Label htmlFor="dateDebut">Date de début</Label>
              <Input
                id="dateDebut"
                type="date"
                {...register('dateDebut')}
                disabled={loading}
              />
            </div>

            <div>
              <Label htmlFor="dateRealisation">Date de réalisation</Label>
              <Input
                id="dateRealisation"
                type="date"
                {...register('dateRealisation')}
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
            <Label htmlFor="piecesFournies">Pièces fournies</Label>
            <Textarea
              id="piecesFournies"
              {...register('piecesFournies')}
              placeholder="Liste des pièces utilisées..."
              rows={3}
              disabled={loading}
            />
          </div>

          <div>
            <Label htmlFor="garantie">Garantie</Label>
            <Input
              id="garantie"
              {...register('garantie')}
              placeholder="Informations sur la garantie"
              disabled={loading}
            />
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              {...register('notes')}
              placeholder="Notes additionnelles..."
              rows={3}
              disabled={loading}
            />
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center gap-4">
        <Button type="submit" disabled={loading}>
          {loading
            ? 'Enregistrement...'
            : isEdit
            ? 'Mettre à jour'
            : 'Créer l\'intervention'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={loading}
        >
          Annuler
        </Button>
      </div>
    </form>
  );
}
