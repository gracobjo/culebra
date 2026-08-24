-- CreateTable
CREATE TABLE "HomeHubTile" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "href" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "altText" TEXT NOT NULL,
    "hintText" TEXT NOT NULL,
    "tone" TEXT NOT NULL DEFAULT 'agro',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HomeHubTile_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "HomeHubTile_slug_key" ON "HomeHubTile"("slug");
CREATE INDEX "HomeHubTile_isActive_sortOrder_idx" ON "HomeHubTile"("isActive", "sortOrder");
