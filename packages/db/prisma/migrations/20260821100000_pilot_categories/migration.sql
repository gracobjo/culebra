-- CreateTable
CREATE TABLE "PilotCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "icon" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PilotCategory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PilotCategory_name_key" ON "PilotCategory"("name");

-- CreateIndex
CREATE UNIQUE INDEX "PilotCategory_slug_key" ON "PilotCategory"("slug");

-- CreateIndex
CREATE INDEX "PilotCategory_isActive_sortOrder_idx" ON "PilotCategory"("isActive", "sortOrder");
