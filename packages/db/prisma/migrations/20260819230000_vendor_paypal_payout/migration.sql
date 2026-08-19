-- CreateEnum
CREATE TYPE "VendorPayoutMethod" AS ENUM ('STRIPE_CONNECT', 'PAYPAL');

-- AlterTable
ALTER TABLE "Vendor" ADD COLUMN "payoutMethod" "VendorPayoutMethod" NOT NULL DEFAULT 'STRIPE_CONNECT';
ALTER TABLE "Vendor" ADD COLUMN "paypalEmail" TEXT;

-- AlterTable
ALTER TABLE "Payout" ADD COLUMN "paypalPayoutBatchId" TEXT;
