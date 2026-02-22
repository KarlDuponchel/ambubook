-- AlterTable
ALTER TABLE "companies" ADD COLUMN     "onboardingCompletedAt" TIMESTAMP(3),
ADD COLUMN     "onboardingStep" INTEGER DEFAULT 0;
