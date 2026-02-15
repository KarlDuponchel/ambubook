-- CreateEnum
CREATE TYPE "HistoryEventType" AS ENUM ('CREATED', 'STATUS_CHANGED', 'COUNTER_PROPOSAL', 'CUSTOMER_RESPONSE', 'NOTE_ADDED', 'ATTACHMENT_ADDED');

-- CreateEnum
CREATE TYPE "AttachmentType" AS ENUM ('TRANSPORT_VOUCHER', 'INVOICE', 'PRESCRIPTION', 'ID_DOCUMENT', 'OTHER');

-- CreateTable
CREATE TABLE "request_history" (
    "id" TEXT NOT NULL,
    "eventType" "HistoryEventType" NOT NULL,
    "previousStatus" "RequestStatus",
    "newStatus" "RequestStatus",
    "proposedDate" TIMESTAMP(3),
    "proposedTime" TEXT,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "requestId" TEXT NOT NULL,
    "userId" TEXT,

    CONSTRAINT "request_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "request_attachments" (
    "id" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileType" "AttachmentType" NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileKey" TEXT,
    "fileSizeKb" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "requestId" TEXT NOT NULL,
    "uploadedById" TEXT NOT NULL,

    CONSTRAINT "request_attachments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "request_history_requestId_idx" ON "request_history"("requestId");

-- CreateIndex
CREATE INDEX "request_history_userId_idx" ON "request_history"("userId");

-- CreateIndex
CREATE INDEX "request_history_createdAt_idx" ON "request_history"("createdAt");

-- CreateIndex
CREATE INDEX "request_attachments_requestId_idx" ON "request_attachments"("requestId");

-- CreateIndex
CREATE INDEX "request_attachments_uploadedById_idx" ON "request_attachments"("uploadedById");

-- AddForeignKey
ALTER TABLE "request_history" ADD CONSTRAINT "request_history_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "transport_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "request_history" ADD CONSTRAINT "request_history_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "request_attachments" ADD CONSTRAINT "request_attachments_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "transport_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "request_attachments" ADD CONSTRAINT "request_attachments_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
