-- CreateEnum
CREATE TYPE "MobilityType" AS ENUM ('WALKING', 'WHEELCHAIR', 'STRETCHER');

-- CreateEnum
CREATE TYPE "TripType" AS ENUM ('ONE_WAY', 'ROUND_TRIP');

-- AlterTable
ALTER TABLE "transport_requests" ADD COLUMN     "accompanistName" TEXT,
ADD COLUMN     "customerId" TEXT,
ADD COLUMN     "isRecurring" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "mobilityType" "MobilityType" NOT NULL DEFAULT 'WALKING',
ADD COLUMN     "needsAccompanist" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "patientBirthDate" TIMESTAMP(3),
ADD COLUMN     "patientSocialSecurityNumber" TEXT,
ADD COLUMN     "returnDate" TIMESTAMP(3),
ADD COLUMN     "returnTime" TEXT,
ADD COLUMN     "tripType" "TripType" NOT NULL DEFAULT 'ONE_WAY';

-- CreateTable
CREATE TABLE "customers" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "phone" TEXT NOT NULL,
    "phoneVerified" BOOLEAN NOT NULL DEFAULT false,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "birthDate" TIMESTAMP(3),
    "socialSecurityNumber" TEXT,
    "defaultAddress" TEXT,
    "defaultCity" TEXT,
    "defaultPostalCode" TEXT,
    "mobilityType" "MobilityType" NOT NULL DEFAULT 'WALKING',
    "needsAccompanist" BOOLEAN NOT NULL DEFAULT false,
    "medicalNotes" TEXT,
    "notifyBySms" BOOLEAN NOT NULL DEFAULT true,
    "notifyByEmail" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "customers_email_key" ON "customers"("email");

-- CreateIndex
CREATE INDEX "customers_email_idx" ON "customers"("email");

-- CreateIndex
CREATE INDEX "customers_phone_idx" ON "customers"("phone");

-- CreateIndex
CREATE INDEX "transport_requests_customerId_idx" ON "transport_requests"("customerId");

-- CreateIndex
CREATE INDEX "transport_requests_requestedDate_idx" ON "transport_requests"("requestedDate");

-- AddForeignKey
ALTER TABLE "transport_requests" ADD CONSTRAINT "transport_requests_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
