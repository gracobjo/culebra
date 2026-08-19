-- CreateEnum
CREATE TYPE "SlaStatus" AS ENUM ('PENDING', 'NOTIFIED', 'AT_RISK', 'FULFILLED', 'BREACHED');

-- AlterTable
ALTER TABLE "VendorOrder" ADD COLUMN     "slaDeadlineAt" TIMESTAMP(3),
ADD COLUMN     "slaNotifiedAt" TIMESTAMP(3),
ADD COLUMN     "slaReceivedAt" TIMESTAMP(3),
ADD COLUMN     "slaStatus" "SlaStatus" NOT NULL DEFAULT 'PENDING';
