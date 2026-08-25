-- CreateTable
CREATE TABLE "ShowroomDailyStat" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "open" BOOLEAN NOT NULL DEFAULT true,
    "visits" INTEGER NOT NULL DEFAULT 0,
    "purchases" INTEGER NOT NULL DEFAULT 0,
    "gmv" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "avgTicketBase" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "impulseAttachPct" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "impulseAvgEur" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "quickBuyPct" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "quickBuyTicket" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "mielU" INTEGER NOT NULL DEFAULT 0,
    "loncheadoU" INTEGER NOT NULL DEFAULT 0,
    "mermeladaU" INTEGER NOT NULL DEFAULT 0,
    "quesoU" INTEGER NOT NULL DEFAULT 0,
    "toteU" INTEGER NOT NULL DEFAULT 0,
    "picosU" INTEGER NOT NULL DEFAULT 0,
    "vinoU" INTEGER NOT NULL DEFAULT 0,
    "minicataU" INTEGER NOT NULL DEFAULT 0,
    "toteStock" INTEGER NOT NULL DEFAULT 0,
    "onlineOrders" INTEGER NOT NULL DEFAULT 0,
    "onlineOrdersAttr" INTEGER NOT NULL DEFAULT 0,
    "contacts" INTEGER NOT NULL DEFAULT 0,
    "referredVisits" INTEGER NOT NULL DEFAULT 0,
    "basketsViaLodging" INTEGER NOT NULL DEFAULT 0,
    "partnersActive" INTEGER NOT NULL DEFAULT 0,
    "promotion" BOOLEAN NOT NULL DEFAULT false,
    "holidayOrEvent" BOOLEAN NOT NULL DEFAULT false,
    "marketSegment" TEXT,
    "distributionChannel" TEXT,
    "notes" TEXT,
    "sourceSyncedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShowroomDailyStat_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ShowroomDailyStat_date_key" ON "ShowroomDailyStat"("date");

-- CreateIndex
CREATE INDEX "ShowroomDailyStat_date_idx" ON "ShowroomDailyStat"("date");
