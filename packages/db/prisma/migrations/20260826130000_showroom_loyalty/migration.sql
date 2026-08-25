-- Showroom loyalty: scratch, stamps, club, referrals

CREATE TYPE "ShowroomScratchPrize" AS ENUM (
  'MINI_CATA',
  'DISCOUNT_10_TODAY',
  'MIEL_OR_LONCHEADO',
  'BASKET_UPGRADE',
  'TOTE_BAG',
  'BASKET_ESCAPADA'
);

CREATE TYPE "ShowroomStampCardStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'REDEEMED');

CREATE TYPE "ShowroomClubChannel" AS ENUM ('WHATSAPP', 'EMAIL', 'BOTH');

CREATE TABLE "ShowroomLoyaltyMonth" (
  "monthKey" TEXT NOT NULL,
  "scratchWinEveryN" INTEGER NOT NULL DEFAULT 5,
  "scratchMaxWins" INTEGER NOT NULL DEFAULT 40,
  "scratchPlays" INTEGER NOT NULL DEFAULT 0,
  "scratchWins" INTEGER NOT NULL DEFAULT 0,
  "stampCardsCompleted" INTEGER NOT NULL DEFAULT 0,
  "clubJoins" INTEGER NOT NULL DEFAULT 0,
  "referralsRewarded" INTEGER NOT NULL DEFAULT 0,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "ShowroomLoyaltyMonth_pkey" PRIMARY KEY ("monthKey")
);

CREATE TABLE "ShowroomScratchPlay" (
  "id" TEXT NOT NULL,
  "monthKey" TEXT NOT NULL,
  "playNumber" INTEGER NOT NULL,
  "won" BOOLEAN NOT NULL DEFAULT false,
  "prize" "ShowroomScratchPrize",
  "entryType" "ShowroomFootfallType" NOT NULL,
  "customerLabel" TEXT,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "ShowroomScratchPlay_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ShowroomStampCard" (
  "id" TEXT NOT NULL,
  "cardCode" TEXT NOT NULL,
  "customerName" TEXT NOT NULL,
  "contactHint" TEXT,
  "stampsRequired" INTEGER NOT NULL DEFAULT 6,
  "stampsCount" INTEGER NOT NULL DEFAULT 0,
  "status" "ShowroomStampCardStatus" NOT NULL DEFAULT 'ACTIVE',
  "completedAt" TIMESTAMP(3),
  "redeemedAt" TIMESTAMP(3),
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "ShowroomStampCard_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ShowroomStampEvent" (
  "id" TEXT NOT NULL,
  "cardId" TEXT NOT NULL,
  "eventDate" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "ShowroomStampEvent_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ShowroomClubMember" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "contact" TEXT NOT NULL,
  "channel" "ShowroomClubChannel" NOT NULL DEFAULT 'WHATSAPP',
  "originGroup" "ShowroomOriginGroup",
  "promoCode" TEXT,
  "birthday" DATE,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "notes" TEXT,
  "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "ShowroomClubMember_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ShowroomReferral" (
  "id" TEXT NOT NULL,
  "referrerName" TEXT NOT NULL,
  "referredName" TEXT NOT NULL,
  "referredPurchased" BOOLEAN NOT NULL DEFAULT false,
  "rewardGiven" BOOLEAN NOT NULL DEFAULT false,
  "eventDate" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "ShowroomReferral_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ShowroomStampCard_cardCode_key" ON "ShowroomStampCard"("cardCode");

CREATE INDEX "ShowroomScratchPlay_monthKey_idx" ON "ShowroomScratchPlay"("monthKey");
CREATE INDEX "ShowroomScratchPlay_won_idx" ON "ShowroomScratchPlay"("won");
CREATE INDEX "ShowroomScratchPlay_prize_idx" ON "ShowroomScratchPlay"("prize");

CREATE INDEX "ShowroomStampCard_status_idx" ON "ShowroomStampCard"("status");
CREATE INDEX "ShowroomStampCard_customerName_idx" ON "ShowroomStampCard"("customerName");

CREATE INDEX "ShowroomStampEvent_cardId_idx" ON "ShowroomStampEvent"("cardId");

CREATE INDEX "ShowroomClubMember_isActive_idx" ON "ShowroomClubMember"("isActive");
CREATE INDEX "ShowroomClubMember_originGroup_idx" ON "ShowroomClubMember"("originGroup");

CREATE INDEX "ShowroomReferral_eventDate_idx" ON "ShowroomReferral"("eventDate");
CREATE INDEX "ShowroomReferral_rewardGiven_idx" ON "ShowroomReferral"("rewardGiven");

ALTER TABLE "ShowroomScratchPlay" ADD CONSTRAINT "ShowroomScratchPlay_monthKey_fkey" FOREIGN KEY ("monthKey") REFERENCES "ShowroomLoyaltyMonth"("monthKey") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ShowroomStampEvent" ADD CONSTRAINT "ShowroomStampEvent_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "ShowroomStampCard"("id") ON DELETE CASCADE ON UPDATE CASCADE;
