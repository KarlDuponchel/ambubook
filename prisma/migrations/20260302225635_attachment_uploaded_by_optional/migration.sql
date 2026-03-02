-- DropForeignKey
ALTER TABLE "request_attachments" DROP CONSTRAINT "request_attachments_uploadedById_fkey";

-- AlterTable
ALTER TABLE "request_attachments" ALTER COLUMN "uploadedById" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "request_attachments" ADD CONSTRAINT "request_attachments_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
