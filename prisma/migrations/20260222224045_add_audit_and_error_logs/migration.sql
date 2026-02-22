-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('LOGIN', 'LOGOUT', 'LOGIN_FAILED', 'PASSWORD_RESET', 'PASSWORD_CHANGED', 'USER_CREATED', 'USER_UPDATED', 'USER_DELETED', 'USER_ACTIVATED', 'USER_DEACTIVATED', 'USER_ROLE_CHANGED', 'COMPANY_CREATED', 'COMPANY_UPDATED', 'COMPANY_DELETED', 'COMPANY_ACTIVATED', 'COMPANY_DEACTIVATED', 'COMPANY_OWNER_CHANGED', 'TRANSPORT_CREATED', 'TRANSPORT_ACCEPTED', 'TRANSPORT_REFUSED', 'TRANSPORT_CANCELLED', 'TRANSPORT_COMPLETED', 'ADMIN_ACTION');

-- CreateEnum
CREATE TYPE "ErrorSeverity" AS ENUM ('DEBUG', 'INFO', 'WARNING', 'ERROR', 'CRITICAL');

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "action" "AuditAction" NOT NULL,
    "details" TEXT,
    "metadata" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT,
    "targetType" TEXT,
    "targetId" TEXT,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "error_logs" (
    "id" TEXT NOT NULL,
    "severity" "ErrorSeverity" NOT NULL DEFAULT 'ERROR',
    "message" TEXT NOT NULL,
    "stack" TEXT,
    "path" TEXT,
    "method" TEXT,
    "metadata" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT,

    CONSTRAINT "error_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action");

-- CreateIndex
CREATE INDEX "audit_logs_userId_idx" ON "audit_logs"("userId");

-- CreateIndex
CREATE INDEX "audit_logs_targetType_targetId_idx" ON "audit_logs"("targetType", "targetId");

-- CreateIndex
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");

-- CreateIndex
CREATE INDEX "error_logs_severity_idx" ON "error_logs"("severity");

-- CreateIndex
CREATE INDEX "error_logs_resolved_idx" ON "error_logs"("resolved");

-- CreateIndex
CREATE INDEX "error_logs_path_idx" ON "error_logs"("path");

-- CreateIndex
CREATE INDEX "error_logs_createdAt_idx" ON "error_logs"("createdAt");

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "error_logs" ADD CONSTRAINT "error_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
