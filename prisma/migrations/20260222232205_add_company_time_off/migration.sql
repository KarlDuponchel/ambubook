-- CreateTable
CREATE TABLE "company_time_off" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "companyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "company_time_off_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "company_time_off_companyId_idx" ON "company_time_off"("companyId");

-- CreateIndex
CREATE INDEX "company_time_off_startDate_endDate_idx" ON "company_time_off"("startDate", "endDate");

-- AddForeignKey
ALTER TABLE "company_time_off" ADD CONSTRAINT "company_time_off_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
