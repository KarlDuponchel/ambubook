-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('EMAIL', 'SMS');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('PENDING', 'SENT', 'FAILED', 'BOUNCED');

-- CreateTable
CREATE TABLE "notification_logs" (
    "id" TEXT NOT NULL,
    "channel" "NotificationChannel" NOT NULL,
    "type" TEXT NOT NULL,
    "recipient" TEXT NOT NULL,
    "subject" TEXT,
    "content" TEXT,
    "status" "NotificationStatus" NOT NULL DEFAULT 'PENDING',
    "errorMsg" TEXT,
    "metadata" JSONB,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT,

    CONSTRAINT "notification_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_preferences" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "emailEnabled" BOOLEAN NOT NULL DEFAULT true,
    "smsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "transportUpdates" BOOLEAN NOT NULL DEFAULT true,
    "transportReminders" BOOLEAN NOT NULL DEFAULT true,
    "marketing" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "notification_logs_userId_idx" ON "notification_logs"("userId");

-- CreateIndex
CREATE INDEX "notification_logs_channel_idx" ON "notification_logs"("channel");

-- CreateIndex
CREATE INDEX "notification_logs_type_idx" ON "notification_logs"("type");

-- CreateIndex
CREATE INDEX "notification_logs_status_idx" ON "notification_logs"("status");

-- CreateIndex
CREATE INDEX "notification_logs_sentAt_idx" ON "notification_logs"("sentAt");

-- CreateIndex
CREATE UNIQUE INDEX "notification_preferences_userId_key" ON "notification_preferences"("userId");

-- AddForeignKey
ALTER TABLE "notification_logs" ADD CONSTRAINT "notification_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_preferences" ADD CONSTRAINT "notification_preferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
