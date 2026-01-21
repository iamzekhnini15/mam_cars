'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DollarSign } from 'lucide-react';
import { formatPrice, calculateMarge, calculateMargePourcentage } from '@/lib/utils';

interface VendreVehiculeButtonProps {
  vehiculeId: string;
  prixVenteEstime: number;
  prixAchat: number;
  coutReparations: number;
  marque: string;
  modele: string;
}

export default function VendreVehiculeButton({
  vehiculeId,
  prixVenteEstime,
  prixAchat,
  coutReparations,
  marque,
  modele,
}: VendreVehiculeButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [prixVente, setPrixVente] = useState(prixVenteEstime.toString());
  const [dateVente, setDateVente] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  const coutTotal = prixAchat + coutReparations;
  const prixVenteNum = parseFloat(prixVente) || 0;
  const marge = calculateMarge(prixVenteNum, coutTotal);
  const margePourcentage = calculateMargePourcentage(prixVenteNum, coutTotal);

  const handleVendre = async () => {
    if (!prixVente || parseFloat(prixVente) <= 0) {
      setError('Veuillez saisir un prix de vente valide');
      return;
    }

    if (!dateVente) {
      setError('Veuillez saisir une date de vente');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await fetch(`/api/vehicules/${vehiculeId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          statut: 'VENDU',
          prixVenteFinal: parseFloat(prixVente),
          dateVente: new Date(dateVente).toISOString(),
          notes: notes || undefined,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || 'Une erreur est survenue');
        setLoading(false);
        return;
      }

      // Fermer le dialog et rafraîchir
      setOpen(false);
      router.refresh();
    } catch (err) {
      setError('Une erreur est survenue');
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" className="bg-green-600 hover:bg-green-700">
          <DollarSign className="h-4 w-4 mr-2" />
          Vendre
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Vendre le véhicule</DialogTitle>
          <DialogDescription>
            {marque} {modele}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
              {error}
            </div>
          )}

          {/* Récapitulatif des coûts */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Prix d'achat :</span>
              <span className="font-medium">{formatPrice(prixAchat)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Coût réparations :</span>
              <span className="font-medium">{formatPrice(coutReparations)}</span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="font-semibold">Coût total :</span>
              <span className="font-semibold">{formatPrice(coutTotal)}</span>
            </div>
          </div>

          {/* Prix de vente */}
          <div>
            <Label htmlFor="prixVente">
              Prix de vente <span className="text-red-500">*</span>
            </Label>
            <Input
              id="prixVente"
              type="number"
              step="0.01"
              value={prixVente}
              onChange={(e) => setPrixVente(e.target.value)}
              disabled={loading}
              placeholder="Prix de vente final"
            />
          </div>

          {/* Date de vente */}
          <div>
            <Label htmlFor="dateVente">
              Date de vente <span className="text-red-500">*</span>
            </Label>
            <Input
              id="dateVente"
              type="date"
              value={dateVente}
              onChange={(e) => setDateVente(e.target.value)}
              disabled={loading}
            />
          </div>

          {/* Marge calculée */}
          {prixVenteNum > 0 && (
            <div className={`p-4 rounded-lg ${marge >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
              <div className="flex justify-between items-center">
                <span className="font-semibold">Marge :</span>
                <div className="text-right">
                  <div className={`text-lg font-bold ${marge >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                    {formatPrice(marge)}
                  </div>
                  <div className={`text-sm ${marge >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ({margePourcentage > 0 ? '+' : ''}{margePourcentage.toFixed(1)}%)
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Notes (optionnel)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={loading}
              placeholder="Notes sur la vente..."
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={loading}
          >
            Annuler
          </Button>
          <Button
            onClick={handleVendre}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700"
          >
            {loading ? 'Enregistrement...' : 'Confirmer la vente'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
