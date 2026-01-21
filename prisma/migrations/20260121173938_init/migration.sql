-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'USER');

-- CreateEnum
CREATE TYPE "StatutVehicule" AS ENUM ('EN_STOCK', 'EN_REPARATION', 'PRET_A_VENDRE', 'VENDU', 'RESERVE');

-- CreateEnum
CREATE TYPE "TypeIntervention" AS ENUM ('MECANIQUE', 'CARROSSERIE', 'CONTROLE_TECHNIQUE', 'NETTOYAGE', 'VITRERIE', 'PNEUMATIQUES', 'ELECTRICITE', 'REVISION', 'AUTRE');

-- CreateEnum
CREATE TYPE "StatutIntervention" AS ENUM ('A_FAIRE', 'EN_COURS', 'TERMINE', 'ANNULE');

-- CreateEnum
CREATE TYPE "Carburant" AS ENUM ('ESSENCE', 'DIESEL', 'HYBRIDE', 'ELECTRIQUE', 'GPL');

-- CreateEnum
CREATE TYPE "Transmission" AS ENUM ('MANUELLE', 'AUTOMATIQUE', 'SEMI_AUTO');

-- CreateEnum
CREATE TYPE "TypePhoto" AS ENUM ('PRINCIPALE', 'INTERIEUR', 'EXTERIEUR', 'DEFAUT', 'DOCUMENT');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicules" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "vin" TEXT NOT NULL,
    "marque" TEXT NOT NULL,
    "modele" TEXT NOT NULL,
    "version" TEXT,
    "annee" INTEGER NOT NULL,
    "kilometrage" INTEGER NOT NULL,
    "couleur" TEXT NOT NULL,
    "carburant" "Carburant" NOT NULL,
    "transmission" "Transmission" NOT NULL,
    "puissance" INTEGER,
    "nombrePortes" INTEGER,
    "nombrePlaces" INTEGER,
    "prixAchat" DECIMAL(10,2) NOT NULL,
    "prixVenteEstime" DECIMAL(10,2),
    "prixVenteFinal" DECIMAL(10,2),
    "coutReparations" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "dateAchat" TIMESTAMP(3) NOT NULL,
    "dateVente" TIMESTAMP(3),
    "dateMiseEnLigne" TIMESTAMP(3),
    "statut" "StatutVehicule" NOT NULL DEFAULT 'EN_STOCK',
    "emplacement" TEXT,
    "notes" TEXT,
    "optionsEquipements" TEXT,
    "defautsConnus" TEXT,
    "createdBy" TEXT NOT NULL,

    CONSTRAINT "vehicules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interventions" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "vehiculeId" TEXT NOT NULL,
    "type" "TypeIntervention" NOT NULL,
    "description" TEXT NOT NULL,
    "statut" "StatutIntervention" NOT NULL DEFAULT 'A_FAIRE',
    "priorite" INTEGER NOT NULL DEFAULT 1,
    "cout" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "prestataire" TEXT,
    "datePrevue" TIMESTAMP(3),
    "dateDebut" TIMESTAMP(3),
    "dateRealisation" TIMESTAMP(3),
    "notes" TEXT,
    "piecesFournies" TEXT,
    "garantie" TEXT,
    "createdBy" TEXT NOT NULL,

    CONSTRAINT "interventions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "photos" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "vehiculeId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "cloudinaryId" TEXT,
    "type" "TypePhoto" NOT NULL DEFAULT 'EXTERIEUR',
    "ordre" INTEGER NOT NULL DEFAULT 0,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "photos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "historique" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "vehiculeId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "details" TEXT NOT NULL,

    CONSTRAINT "historique_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "vehicules_vin_key" ON "vehicules"("vin");

-- CreateIndex
CREATE INDEX "vehicules_statut_idx" ON "vehicules"("statut");

-- CreateIndex
CREATE INDEX "vehicules_marque_idx" ON "vehicules"("marque");

-- CreateIndex
CREATE INDEX "vehicules_createdBy_idx" ON "vehicules"("createdBy");

-- CreateIndex
CREATE INDEX "interventions_vehiculeId_idx" ON "interventions"("vehiculeId");

-- CreateIndex
CREATE INDEX "interventions_statut_idx" ON "interventions"("statut");

-- CreateIndex
CREATE INDEX "interventions_createdBy_idx" ON "interventions"("createdBy");

-- CreateIndex
CREATE INDEX "photos_vehiculeId_idx" ON "photos"("vehiculeId");

-- CreateIndex
CREATE INDEX "historique_vehiculeId_idx" ON "historique"("vehiculeId");

-- CreateIndex
CREATE INDEX "historique_userId_idx" ON "historique"("userId");

-- AddForeignKey
ALTER TABLE "vehicules" ADD CONSTRAINT "vehicules_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interventions" ADD CONSTRAINT "interventions_vehiculeId_fkey" FOREIGN KEY ("vehiculeId") REFERENCES "vehicules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interventions" ADD CONSTRAINT "interventions_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "photos" ADD CONSTRAINT "photos_vehiculeId_fkey" FOREIGN KEY ("vehiculeId") REFERENCES "vehicules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historique" ADD CONSTRAINT "historique_vehiculeId_fkey" FOREIGN KEY ("vehiculeId") REFERENCES "vehicules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historique" ADD CONSTRAINT "historique_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
