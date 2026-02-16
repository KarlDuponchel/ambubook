-- AlterTable
ALTER TABLE "companies" ADD COLUMN     "acceptsOnlineBooking" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "coverImageUrl" TEXT,
ADD COLUMN     "coverageRadius" INTEGER,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "fleetSize" INTEGER,
ADD COLUMN     "foundedYear" INTEGER,
ADD COLUMN     "hasAmbulance" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "hasVSL" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "licenseNumber" TEXT,
ADD COLUMN     "logoUrl" TEXT;

-- CreateTable
CREATE TABLE "company_photos" (
    "id" TEXT NOT NULL,
    "fileKey" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "caption" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "companyId" TEXT NOT NULL,

    CONSTRAINT "company_photos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_hours" (
    "id" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "openTime" TEXT,
    "closeTime" TEXT,
    "isClosed" BOOLEAN NOT NULL DEFAULT false,
    "companyId" TEXT NOT NULL,

    CONSTRAINT "company_hours_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "company_photos_companyId_idx" ON "company_photos"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "company_hours_companyId_dayOfWeek_key" ON "company_hours"("companyId", "dayOfWeek");

-- AddForeignKey
ALTER TABLE "company_photos" ADD CONSTRAINT "company_photos_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_hours" ADD CONSTRAINT "company_hours_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
