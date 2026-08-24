-- CreateEnum
CREATE TYPE "LodgingRelationStatus" AS ENUM ('PROSPECT', 'CONTACTED', 'MATERIAL_PLACED', 'ACTIVE', 'PAUSED', 'ENDED');

-- CreateEnum
CREATE TYPE "LodgingCollabModality" AS ENUM ('PRESENCE_RECOMMEND', 'WELCOME_BASKET', 'COMMISSION_SALE', 'NIGHT_PACK');

-- CreateEnum
CREATE TYPE "LodgingWelcomeMode" AS ENUM ('SPECIAL_PRICE', 'CONSIGNMENT');

-- CreateEnum
CREATE TYPE "LodgingRelationEventType" AS ENUM ('CONTACT', 'MATERIAL', 'REFERRAL', 'BASKET', 'THANK_YOU_GIFT', 'COMMISSION', 'AGREEMENT', 'NOTE', 'STATUS_CHANGE');

-- CreateTable
CREATE TABLE "LodgingPartnerRelation" (
    "id" TEXT NOT NULL,
    "accommodationId" TEXT,
    "name" TEXT NOT NULL,
    "contactPerson" TEXT,
    "phone" TEXT,
    "whatsapp" TEXT,
    "email" TEXT,
    "city" TEXT,
    "distanceMinutes" INTEGER,
    "rating" DECIMAL(3,2),
    "status" "LodgingRelationStatus" NOT NULL DEFAULT 'PROSPECT',
    "collabLevel" INTEGER NOT NULL DEFAULT 1,
    "primaryModality" "LodgingCollabModality",
    "modalitiesJson" TEXT NOT NULL DEFAULT '[]',
    "welcomeMode" "LodgingWelcomeMode",
    "welcomeSpecialPrice" DECIMAL(12,2),
    "referralThreshold" INTEGER NOT NULL DEFAULT 8,
    "referredClientsCount" INTEGER NOT NULL DEFAULT 0,
    "thankYouGiftsSent" INTEGER NOT NULL DEFAULT 0,
    "basketsViaCount" INTEGER NOT NULL DEFAULT 0,
    "showroomVisitsAttributed" INTEGER NOT NULL DEFAULT 0,
    "onlineOrdersAttributed" INTEGER NOT NULL DEFAULT 0,
    "materialPlacedAt" TIMESTAMP(3),
    "agreementAcceptedAt" TIMESTAMP(3),
    "agreementNotes" TEXT,
    "nextFollowUpAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LodgingPartnerRelation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LodgingRelationEvent" (
    "id" TEXT NOT NULL,
    "relationId" TEXT NOT NULL,
    "type" "LodgingRelationEventType" NOT NULL,
    "quantity" INTEGER,
    "amount" DECIMAL(12,2),
    "note" TEXT,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LodgingRelationEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteLodgingOfferContacts" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "whatsapp" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "websiteUrl" TEXT,
    "contactPerson" TEXT,
    "showroomAddress" TEXT DEFAULT 'Villardeciervos (Zamora)',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteLodgingOfferContacts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LodgingPartnerRelation_accommodationId_key" ON "LodgingPartnerRelation"("accommodationId");

-- CreateIndex
CREATE INDEX "LodgingPartnerRelation_status_updatedAt_idx" ON "LodgingPartnerRelation"("status", "updatedAt");

-- CreateIndex
CREATE INDEX "LodgingPartnerRelation_city_idx" ON "LodgingPartnerRelation"("city");

-- CreateIndex
CREATE INDEX "LodgingPartnerRelation_nextFollowUpAt_idx" ON "LodgingPartnerRelation"("nextFollowUpAt");

-- CreateIndex
CREATE INDEX "LodgingRelationEvent_relationId_occurredAt_idx" ON "LodgingRelationEvent"("relationId", "occurredAt");

-- CreateIndex
CREATE INDEX "LodgingRelationEvent_type_idx" ON "LodgingRelationEvent"("type");

-- AddForeignKey
ALTER TABLE "LodgingPartnerRelation" ADD CONSTRAINT "LodgingPartnerRelation_accommodationId_fkey" FOREIGN KEY ("accommodationId") REFERENCES "Accommodation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LodgingRelationEvent" ADD CONSTRAINT "LodgingRelationEvent_relationId_fkey" FOREIGN KEY ("relationId") REFERENCES "LodgingPartnerRelation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
