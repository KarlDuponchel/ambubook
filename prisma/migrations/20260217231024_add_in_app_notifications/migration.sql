-- CreateEnum
CREATE TYPE "InAppStatus" AS ENUM ('UNREAD', 'READ', 'ARCHIVED');

-- AlterEnum
ALTER TYPE "NotificationChannel" ADD VALUE 'INAPP';

-- AlterTable
ALTER TABLE "notification_preferences" ADD COLUMN     "inappEnabled" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "in_app_notifications" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "link" TEXT,
    "status" "InAppStatus" NOT NULL DEFAULT 'UNREAD',
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "readAt" TIMESTAMP(3),
    "userId" TEXT NOT NULL,

    CONSTRAINT "in_app_notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "in_app_notifications_userId_idx" ON "in_app_notifications"("userId");

-- CreateIndex
CREATE INDEX "in_app_notifications_status_idx" ON "in_app_notifications"("status");

-- CreateIndex
CREATE INDEX "in_app_notifications_createdAt_idx" ON "in_app_notifications"("createdAt");

-- AddForeignKey
ALTER TABLE "in_app_notifications" ADD CONSTRAINT "in_app_notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
