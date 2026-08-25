-- Showroom footfall / procedencia visitantes

CREATE TYPE "ShowroomFootfallType" AS ENUM ('VISIT', 'PURCHASE');

CREATE TYPE "ShowroomOriginGroup" AS ENUM (
  'LOCAL',
  'ZAMORA',
  'CASTILLA_LEON',
  'MADRID',
  'OTRAS_CCAA',
  'EXTRANJERO',
  'NO_INDICADO'
);

CREATE TYPE "ShowroomDiscoveryChannel" AS ENUM (
  'LODGING',
  'PASSING_BY',
  'SOCIAL',
  'REFERRAL',
  'OTHER'
);

CREATE TABLE "ShowroomFootfallEntry" (
  "id" TEXT NOT NULL,
  "date" DATE NOT NULL,
  "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "entryType" "ShowroomFootfallType" NOT NULL,
  "originGroup" "ShowroomOriginGroup" NOT NULL DEFAULT 'NO_INDICADO',
  "localityDetail" TEXT,
  "discoveryChannel" "ShowroomDiscoveryChannel",
  "contactCaptured" BOOLEAN NOT NULL DEFAULT false,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "ShowroomFootfallEntry_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ShowroomFootfallEntry_date_idx" ON "ShowroomFootfallEntry"("date");
CREATE INDEX "ShowroomFootfallEntry_entryType_idx" ON "ShowroomFootfallEntry"("entryType");
CREATE INDEX "ShowroomFootfallEntry_originGroup_idx" ON "ShowroomFootfallEntry"("originGroup");
CREATE INDEX "ShowroomFootfallEntry_discoveryChannel_idx" ON "ShowroomFootfallEntry"("discoveryChannel");
