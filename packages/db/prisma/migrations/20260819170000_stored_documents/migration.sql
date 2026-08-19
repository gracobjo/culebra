-- CreateEnum
CREATE TYPE "StoredDocumentKind" AS ENUM ('ORDER_CUSTOMER', 'ORDER_VENDOR', 'PRODUCT_CHANGE');

-- CreateTable
CREATE TABLE "StoredDocument" (
    "id" TEXT NOT NULL,
    "kind" "StoredDocumentKind" NOT NULL,
    "ownerUserId" TEXT,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "snapshot" JSONB NOT NULL,
    "retentionUntil" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StoredDocument_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StoredDocument_ownerUserId_kind_createdAt_idx" ON "StoredDocument"("ownerUserId", "kind", "createdAt");

-- CreateIndex
CREATE INDEX "StoredDocument_entityType_entityId_createdAt_idx" ON "StoredDocument"("entityType", "entityId", "createdAt");

-- CreateIndex
CREATE INDEX "StoredDocument_retentionUntil_idx" ON "StoredDocument"("retentionUntil");

-- AddForeignKey
ALTER TABLE "StoredDocument" ADD CONSTRAINT "StoredDocument_ownerUserId_fkey" FOREIGN KEY ("ownerUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
