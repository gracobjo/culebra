-- CreateTable
CREATE TABLE "ShippingSettings" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "customerFeeEur" DECIMAL(12,2) NOT NULL DEFAULT 6.50,
    "internalLabelCostEur" DECIMAL(12,2) NOT NULL DEFAULT 6.50,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShippingSettings_pkey" PRIMARY KEY ("id")
);

-- Seed singleton with domain defaults
INSERT INTO "ShippingSettings" ("id", "customerFeeEur", "internalLabelCostEur", "createdAt", "updatedAt")
VALUES (1, 6.50, 6.50, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;
