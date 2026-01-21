import { z } from 'zod';
import { TypeIntervention, StatutIntervention } from '@prisma/client';

// Schéma de validation pour la création/modification d'une intervention
export const interventionSchema = z.object({
  vehiculeId: z.string().min(1, 'Le véhicule est requis'),
  type: z.nativeEnum(TypeIntervention),
  description: z.string().min(10, 'La description doit contenir au moins 10 caractères'),
  statut: z.nativeEnum(StatutIntervention).optional(),
  priorite: z.number().int().min(1).max(3).optional(),
  cout: z.number().min(0, 'Le coût doit être positif').optional(),
  prestataire: z.string().optional(),
  datePrevue: z.string().or(z.date()).optional(),
  dateDebut: z.string().or(z.date()).optional(),
  dateRealisation: z.string().or(z.date()).optional(),
  notes: z.string().optional(),
  piecesFournies: z.string().optional(),
  garantie: z.string().optional(),
});

export type InterventionFormData = z.infer<typeof interventionSchema>;
