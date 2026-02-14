-- AlterTable: Ajouter colonnes avec valeurs par défaut
ALTER TABLE "customers" ADD COLUMN "image" TEXT;
ALTER TABLE "customers" ADD COLUMN "name" TEXT NOT NULL DEFAULT '';

-- Mettre à jour les données existantes (nom = firstName + lastName)
UPDATE "customers" SET "name" = CONCAT("firstName", ' ', "lastName") WHERE "name" = '';
