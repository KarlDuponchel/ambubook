/*
  Warnings:

  - You are about to drop the column `customerId` on the `transport_requests` table. All the data in the column will be lost.
  - You are about to drop the `customer_accounts` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `customer_addresses` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `customer_sessions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `customers` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "AddressType" AS ENUM ('HOME', 'WORK', 'MEDICAL', 'OTHER');

-- AlterEnum: Recréer l'enum avec CUSTOMER pour éviter l'erreur PostgreSQL
-- "unsafe use of new value"
ALTER TYPE "UserRole" RENAME TO "UserRole_old";
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'AMBULANCIER', 'CUSTOMER');
ALTER TABLE "users" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "users" ALTER COLUMN "role" TYPE "UserRole" USING ("role"::text::"UserRole");
DROP TYPE "UserRole_old";

-- DropForeignKey
ALTER TABLE "customer_accounts" DROP CONSTRAINT "customer_accounts_customerId_fkey";

-- DropForeignKey
ALTER TABLE "customer_addresses" DROP CONSTRAINT "customer_addresses_customerId_fkey";

-- DropForeignKey
ALTER TABLE "customer_sessions" DROP CONSTRAINT "customer_sessions_customerId_fkey";

-- DropForeignKey
ALTER TABLE "transport_requests" DROP CONSTRAINT "transport_requests_customerId_fkey";

-- DropIndex
DROP INDEX "transport_requests_customerId_idx";

-- AlterTable
ALTER TABLE "transport_requests" DROP COLUMN "customerId",
ADD COLUMN     "userId" TEXT;

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'CUSTOMER',
ALTER COLUMN "isActive" SET DEFAULT true;

-- DropTable
DROP TABLE "customer_accounts";

-- DropTable
DROP TABLE "customer_addresses";

-- DropTable
DROP TABLE "customer_sessions";

-- DropTable
DROP TABLE "customers";

-- DropEnum
DROP TYPE "CustomerAddressType";

-- CreateTable
CREATE TABLE "user_addresses" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "type" "AddressType" NOT NULL DEFAULT 'HOME',
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "postalCode" TEXT NOT NULL,
    "details" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "user_addresses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "user_addresses_userId_idx" ON "user_addresses"("userId");

-- CreateIndex
CREATE INDEX "transport_requests_userId_idx" ON "transport_requests"("userId");

-- AddForeignKey
ALTER TABLE "user_addresses" ADD CONSTRAINT "user_addresses_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transport_requests" ADD CONSTRAINT "transport_requests_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
