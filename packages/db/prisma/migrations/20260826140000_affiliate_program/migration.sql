-- Programa de afiliados: tipos, comisiones y ledger

CREATE TYPE "AffiliatePartnerType" AS ENUM (
  'LODGING',
  'PRODUCER',
  'CREATOR',
  'GUIDE',
  'AMBASSADOR',
  'PARTNER_SHOP'
);

CREATE TYPE "AffiliateProgramStatus" AS ENUM (
  'PENDING',
  'ACTIVE',
  'SUSPENDED'
);

CREATE TYPE "AffiliateCommissionType" AS ENUM (
  'ONLINE_ORDER',
  'BASKET_SALE',
  'SHOWROOM_SALE'
);

CREATE TYPE "AffiliateCommissionStatus" AS ENUM (
  'PENDING',
  'APPROVED',
  'PAID',
  'CANCELLED'
);

ALTER TABLE "AffiliateCode" ADD COLUMN "affiliateType" "AffiliatePartnerType" NOT NULL DEFAULT 'LODGING';
ALTER TABLE "AffiliateCode" ADD COLUMN "commissionPct" DECIMAL(5,2) NOT NULL DEFAULT 10;
ALTER TABLE "AffiliateCode" ADD COLUMN "vendorId" TEXT;
ALTER TABLE "AffiliateCode" ADD COLUMN "contactEmail" TEXT;
ALTER TABLE "AffiliateCode" ADD COLUMN "contactPhone" TEXT;
ALTER TABLE "AffiliateCode" ADD COLUMN "cookieDays" INTEGER NOT NULL DEFAULT 30;
ALTER TABLE "AffiliateCode" ADD COLUMN "payoutMinimum" DECIMAL(12,2) NOT NULL DEFAULT 30;
ALTER TABLE "AffiliateCode" ADD COLUMN "commissionPending" DECIMAL(12,2) NOT NULL DEFAULT 0;
ALTER TABLE "AffiliateCode" ADD COLUMN "commissionPaid" DECIMAL(12,2) NOT NULL DEFAULT 0;
ALTER TABLE "AffiliateCode" ADD COLUMN "programStatus" "AffiliateProgramStatus" NOT NULL DEFAULT 'ACTIVE';

ALTER TABLE "AffiliateCode" ADD CONSTRAINT "AffiliateCode_vendorId_fkey"
  FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "AffiliateCode_affiliateType_idx" ON "AffiliateCode"("affiliateType");
CREATE INDEX "AffiliateCode_programStatus_idx" ON "AffiliateCode"("programStatus");

CREATE TABLE "AffiliateCommission" (
  "id" TEXT NOT NULL,
  "affiliateId" TEXT NOT NULL,
  "orderId" TEXT,
  "orderNumber" TEXT,
  "commissionType" "AffiliateCommissionType" NOT NULL DEFAULT 'ONLINE_ORDER',
  "baseAmount" DECIMAL(12,2) NOT NULL,
  "commissionPct" DECIMAL(5,2) NOT NULL,
  "commissionAmount" DECIMAL(12,2) NOT NULL,
  "status" "AffiliateCommissionStatus" NOT NULL DEFAULT 'PENDING',
  "eventDate" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "paidAt" TIMESTAMP(3),
  "payoutNote" TEXT,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "AffiliateCommission_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "AffiliateCommission_orderId_key" ON "AffiliateCommission"("orderId");
CREATE INDEX "AffiliateCommission_affiliateId_idx" ON "AffiliateCommission"("affiliateId");
CREATE INDEX "AffiliateCommission_status_idx" ON "AffiliateCommission"("status");
CREATE INDEX "AffiliateCommission_eventDate_idx" ON "AffiliateCommission"("eventDate");

ALTER TABLE "AffiliateCommission" ADD CONSTRAINT "AffiliateCommission_affiliateId_fkey"
  FOREIGN KEY ("affiliateId") REFERENCES "AffiliateCode"("id") ON DELETE CASCADE ON UPDATE CASCADE;
