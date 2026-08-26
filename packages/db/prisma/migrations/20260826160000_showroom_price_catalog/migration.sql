-- CreateEnum
CREATE TYPE "ShowroomPriceKind" AS ENUM ('BASKET', 'PACKAGING_UNIT', 'MERCH', 'EXPERIENCE');

-- CreateTable
CREATE TABLE "ShowroomPriceCatalogItem" (
    "id" TEXT NOT NULL,
    "kind" "ShowroomPriceKind" NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "costEur" DECIMAL(12,2),
    "pvpEur" DECIMAL(12,2),
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShowroomPriceCatalogItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ShowroomPriceCatalogItem_key_key" ON "ShowroomPriceCatalogItem"("key");

-- CreateIndex
CREATE INDEX "ShowroomPriceCatalogItem_kind_sortOrder_idx" ON "ShowroomPriceCatalogItem"("kind", "sortOrder");

-- CreateIndex
CREATE INDEX "ShowroomPriceCatalogItem_isActive_idx" ON "ShowroomPriceCatalogItem"("isActive");
