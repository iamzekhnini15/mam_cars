'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Trash2 } from 'lucide-react';

interface DeleteVehiculeButtonProps {
  vehiculeId: string;
  vehiculeName: string;
}

export function DeleteVehiculeButton({ vehiculeId, vehiculeName }: DeleteVehiculeButtonProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  const handleDelete = async () => {
    setError('');
    setDeleting(true);

    try {
      const response = await fetch(`/api/vehicules/${vehiculeId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Erreur lors de la suppression');
        setDeleting(false);
        return;
      }

      router.push('/dashboard/vehicules');
      router.refresh();
    } catch (err) {
      setError('Erreur lors de la suppression');
      setDeleting(false);
    }
  };

  return (
    <>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="destructive" disabled={deleting}>
            <Trash2 className="h-4 w-4 mr-2" />
            {deleting ? 'Suppression...' : 'Supprimer'}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer <strong>{vehiculeName}</strong> ?
              <br />
              <br />
              Cette action est irréversible et supprimera également :
              <ul className="list-disc list-inside mt-2">
                <li>Toutes les interventions associées</li>
                <li>Toutes les photos</li>
                <li>Tout l'historique des modifications</li>
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? 'Suppression...' : 'Supprimer définitivement'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {error && (
        <div className="text-sm text-red-600 mt-2">
          {error}
        </div>
      )}
    </>
  );
}
