-- Fidelización afiliados: niveles y periodicidad de pago

CREATE TYPE "AffiliateLoyaltyTier" AS ENUM (
  'COLLABORATOR',
  'AMBASSADOR',
  'PARTNER'
);

CREATE TYPE "AffiliatePayoutFrequency" AS ENUM (
  'MONTHLY',
  'QUARTERLY'
);

ALTER TABLE "AffiliateCode" ADD COLUMN "loyaltyTier" "AffiliateLoyaltyTier" NOT NULL DEFAULT 'COLLABORATOR';
ALTER TABLE "AffiliateCode" ADD COLUMN "payoutFrequency" "AffiliatePayoutFrequency" NOT NULL DEFAULT 'QUARTERLY';

CREATE INDEX "AffiliateCode_loyaltyTier_idx" ON "AffiliateCode"("loyaltyTier");
