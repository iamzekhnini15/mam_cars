import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utilitaire pour fusionner les classes Tailwind CSS
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formater un prix en euros
 */
export function formatPrice(price: number | string): string {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(numPrice);
}

/**
 * Formater un kilométrage
 */
export function formatKilometrage(km: number): string {
  return new Intl.NumberFormat('fr-FR').format(km) + ' km';
}

/**
 * Formater une date en français
 */
export function formatDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(dateObj);
}

/**
 * Formater une date avec l'heure
 */
export function formatDateTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(dateObj);
}

/**
 * Calculer la marge d'un véhicule
 */
export function calculateMarge(
  prixVente: number | string,
  prixAchat: number | string,
  coutReparations: number | string = 0
): number {
  const vente = typeof prixVente === 'string' ? parseFloat(prixVente) : prixVente;
  const achat = typeof prixAchat === 'string' ? parseFloat(prixAchat) : prixAchat;
  const reparations = typeof coutReparations === 'string' ? parseFloat(coutReparations) : coutReparations;
  
  return vente - achat - reparations;
}

/**
 * Calculer le pourcentage de marge
 */
export function calculateMargePourcentage(
  prixVente: number | string,
  prixAchat: number | string,
  coutReparations: number | string = 0
): number {
  const vente = typeof prixVente === 'string' ? parseFloat(prixVente) : prixVente;
  const achat = typeof prixAchat === 'string' ? parseFloat(prixAchat) : prixAchat;
  const reparations = typeof coutReparations === 'string' ? parseFloat(coutReparations) : coutReparations;
  
  const coutTotal = achat + reparations;
  if (coutTotal === 0) return 0;
  
  const marge = vente - coutTotal;
  return (marge / coutTotal) * 100;
}

/**
 * Traduire les statuts en français
 */
export const statutVehiculeLabels: Record<string, string> = {
  EN_STOCK: 'En stock',
  EN_REPARATION: 'En réparation',
  PRET_A_VENDRE: 'Prêt à vendre',
  VENDU: 'Vendu',
  RESERVE: 'Réservé',
};

export const statutInterventionLabels: Record<string, string> = {
  A_FAIRE: 'À faire',
  EN_COURS: 'En cours',
  TERMINE: 'Terminé',
  ANNULE: 'Annulé',
};

export const typeInterventionLabels: Record<string, string> = {
  MECANIQUE: 'Mécanique',
  CARROSSERIE: 'Carrosserie',
  CONTROLE_TECHNIQUE: 'Contrôle technique',
  NETTOYAGE: 'Nettoyage',
  VITRERIE: 'Vitrerie',
  PNEUMATIQUES: 'Pneumatiques',
  ELECTRICITE: 'Électricité',
  REVISION: 'Révision',
  AUTRE: 'Autre',
};

export const carburantLabels: Record<string, string> = {
  ESSENCE: 'Essence',
  DIESEL: 'Diesel',
  HYBRIDE: 'Hybride',
  ELECTRIQUE: 'Électrique',
  GPL: 'GPL',
};

export const transmissionLabels: Record<string, string> = {
  MANUELLE: 'Manuelle',
  AUTOMATIQUE: 'Automatique',
  SEMI_AUTO: 'Semi-automatique',
};
