-- CreateEnum
CREATE TYPE "RappelSettlementStatus" AS ENUM ('PENDING', 'PAID', 'CANCELLED');

-- CreateEnum
CREATE TYPE "RappelPaymentMethod" AS ENUM ('TRANSFER', 'PAYOUT_OFFSET');

-- CreateTable
CREATE TABLE "RappelSettlement" (
    "id" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "tierId" TEXT NOT NULL,
    "tierName" TEXT NOT NULL,
    "rebatePct" DECIMAL(5,2) NOT NULL,
    "annualRevenue" DECIMAL(12,2) NOT NULL,
    "commissionCharged" DECIMAL(12,2) NOT NULL,
    "rebateAmount" DECIMAL(12,2) NOT NULL,
    "status" "RappelSettlementStatus" NOT NULL DEFAULT 'PENDING',
    "dueAt" TIMESTAMP(3) NOT NULL,
    "paidAt" TIMESTAMP(3),
    "paymentMethod" "RappelPaymentMethod",
    "notes" TEXT,
    "closedByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RappelSettlement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RappelSettlement_year_status_idx" ON "RappelSettlement"("year", "status");

-- CreateIndex
CREATE INDEX "RappelSettlement_status_dueAt_idx" ON "RappelSettlement"("status", "dueAt");

-- CreateIndex
CREATE UNIQUE INDEX "RappelSettlement_vendorId_year_key" ON "RappelSettlement"("vendorId", "year");

-- AddForeignKey
ALTER TABLE "RappelSettlement" ADD CONSTRAINT "RappelSettlement_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
