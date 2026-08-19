-- Add retention window to Payout (14-day right of withdrawal)
ALTER TABLE "Payout" ADD COLUMN "releasesAt" TIMESTAMP(3);
ALTER TABLE "Payout" ADD COLUMN "heldForWithdrawal" BOOLEAN NOT NULL DEFAULT true;

-- Backfill: existing payouts have no retention
UPDATE "Payout" SET "heldForWithdrawal" = false, "releasesAt" = "createdAt";
