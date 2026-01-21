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

interface DeleteInterventionButtonProps {
  interventionId: string;
  vehiculeId: string;
  interventionType: string;
}

export default function DeleteInterventionButton({
  interventionId,
  vehiculeId,
  interventionType,
}: DeleteInterventionButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');

  const handleDelete = async () => {
    setError('');
    setIsDeleting(true);

    try {
      const response = await fetch(`/api/interventions/${interventionId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const result = await response.json();
        setError(result.error || 'Erreur lors de la suppression');
        setIsDeleting(false);
        return;
      }

      // Rediriger vers le véhicule
      router.push(`/dashboard/vehicules/${vehiculeId}`);
      router.refresh();
    } catch (err) {
      setError('Une erreur est survenue');
      setIsDeleting(false);
    }
  };

  return (
    <>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="destructive" disabled={isDeleting}>
            <Trash2 className="h-4 w-4 mr-2" />
            Supprimer
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                Êtes-vous sûr de vouloir supprimer cette intervention ({interventionType}) ?
              </p>
              <p className="font-medium">
                Cette action est irréversible et aura les conséquences suivantes :
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Le coût de l'intervention sera déduit du coût total des réparations du véhicule</li>
                <li>Toutes les données de cette intervention seront perdues</li>
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? 'Suppression...' : 'Supprimer'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {error && (
        <div className="text-sm text-red-500 mt-2">
          {error}
        </div>
      )}
    </>
  );
}
