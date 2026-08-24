-- CreateTable
CREATE TABLE "SiteSocialLinks" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "facebookUrl" TEXT,
    "instagramUrl" TEXT,
    "whatsappUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteSocialLinks_pkey" PRIMARY KEY ("id")
);
