-- AlterTable
ALTER TABLE "Vendor" ADD COLUMN "stripeAccountId" TEXT;
ALTER TABLE "Vendor" ADD COLUMN "stripeChargesEnabled" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX "Vendor_stripeAccountId_key" ON "Vendor"("stripeAccountId");
