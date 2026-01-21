import { z } from 'zod';

// Enums définis localement pour éviter les imports Prisma côté client
export enum Carburant {
  ESSENCE = 'ESSENCE',
  DIESEL = 'DIESEL',
  HYBRIDE = 'HYBRIDE',
  ELECTRIQUE = 'ELECTRIQUE',
  GPL = 'GPL',
}

export enum Transmission {
  MANUELLE = 'MANUELLE',
  AUTOMATIQUE = 'AUTOMATIQUE',
  SEMI_AUTO = 'SEMI_AUTO',
}

export enum StatutVehicule {
  DISPONIBLE = 'DISPONIBLE',
  EN_PREPARATION = 'EN_PREPARATION',
  RESERVE = 'RESERVE',
  VENDU = 'VENDU',
}

// Schéma de validation pour la création/modification d'un véhicule
export const vehiculeSchema = z.object({
  vin: z.string().min(17, 'Le VIN doit contenir 17 caractères').max(17),
  marque: z.string().min(2, 'La marque est requise'),
  modele: z.string().min(1, 'Le modèle est requis'),
  version: z.string().optional(),
  annee: z.number().int().min(1900).max(new Date().getFullYear() + 1),
  kilometrage: z.number().int().min(0),
  couleur: z.string().min(2, 'La couleur est requise'),
  carburant: z.nativeEnum(Carburant),
  transmission: z.nativeEnum(Transmission),
  puissance: z.number().int().min(0).optional(),
  nombrePortes: z.number().int().min(2).max(5).optional(),
  nombrePlaces: z.number().int().min(2).max(9).optional(),
  prixAchat: z.number().positive('Le prix d\'achat doit être positif'),
  prixVenteEstime: z.number().positive().optional(),
  prixVenteFinal: z.number().positive().optional(),
  dateAchat: z.string().or(z.date()),
  dateVente: z.string().or(z.date()).optional(),
  statut: z.nativeEnum(StatutVehicule).optional(),
  emplacement: z.string().optional(),
  notes: z.string().optional(),
  optionsEquipements: z.string().optional(),
  defautsConnus: z.string().optional(),
});

export type VehiculeFormData = z.infer<typeof vehiculeSchema>;
