-- Turismo territorial: alojamientos, packs, cupones, afiliación

CREATE TYPE "AccommodationStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'DISABLED');
CREATE TYPE "AccommodationBookingChannel" AS ENUM ('BOOKING', 'WEBSITE', 'WHATSAPP', 'PHONE', 'EMAIL', 'OTHER');
CREATE TYPE "TourismPackStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'DISABLED');
CREATE TYPE "CouponDiscountType" AS ENUM ('PERCENTAGE', 'FIXED');

ALTER TABLE "Cart" ADD COLUMN IF NOT EXISTS "couponCode" TEXT;

ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "discountAmount" DECIMAL(12,2) NOT NULL DEFAULT 0;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "couponCode" TEXT;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "affiliateCode" TEXT;
CREATE INDEX IF NOT EXISTS "Order_affiliateCode_idx" ON "Order"("affiliateCode");
CREATE INDEX IF NOT EXISTS "Order_couponCode_idx" ON "Order"("couponCode");

CREATE TABLE "Accommodation" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "shortDescription" TEXT,
    "longDescription" TEXT,
    "kind" TEXT NOT NULL DEFAULT 'CASA_RURAL',
    "city" TEXT,
    "municipality" TEXT,
    "province" TEXT NOT NULL DEFAULT 'Zamora',
    "address" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "whatsapp" TEXT,
    "websiteUrl" TEXT,
    "bookingUrl" TEXT,
    "bookingChannel" "AccommodationBookingChannel" NOT NULL DEFAULT 'WEBSITE',
    "imageUrl" TEXT,
    "capacity" INTEGER,
    "status" "AccommodationStatus" NOT NULL DEFAULT 'DRAFT',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Accommodation_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Accommodation_slug_key" ON "Accommodation"("slug");
CREATE INDEX "Accommodation_status_sortOrder_idx" ON "Accommodation"("status", "sortOrder");
CREATE INDEX "Accommodation_city_idx" ON "Accommodation"("city");

CREATE TABLE "AccommodationProduct" (
    "accommodationId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AccommodationProduct_pkey" PRIMARY KEY ("accommodationId","productId")
);

ALTER TABLE "AccommodationProduct" ADD CONSTRAINT "AccommodationProduct_accommodationId_fkey" FOREIGN KEY ("accommodationId") REFERENCES "Accommodation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AccommodationProduct" ADD CONSTRAINT "AccommodationProduct_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "Coupon" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "discountType" "CouponDiscountType" NOT NULL,
    "discountValue" DECIMAL(12,2) NOT NULL,
    "minOrderAmount" DECIMAL(12,2),
    "maxRedemptions" INTEGER,
    "redemptionCount" INTEGER NOT NULL DEFAULT 0,
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Coupon_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Coupon_code_key" ON "Coupon"("code");
CREATE INDEX "Coupon_isActive_code_idx" ON "Coupon"("isActive", "code");

CREATE TABLE "TourismPack" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "shortDescription" TEXT,
    "longDescription" TEXT,
    "accommodationId" TEXT,
    "nightsHint" TEXT,
    "imageUrl" TEXT,
    "status" "TourismPackStatus" NOT NULL DEFAULT 'DRAFT',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "couponId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TourismPack_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "TourismPack_slug_key" ON "TourismPack"("slug");
CREATE INDEX "TourismPack_status_sortOrder_idx" ON "TourismPack"("status", "sortOrder");
ALTER TABLE "TourismPack" ADD CONSTRAINT "TourismPack_accommodationId_fkey" FOREIGN KEY ("accommodationId") REFERENCES "Accommodation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "TourismPack" ADD CONSTRAINT "TourismPack_couponId_fkey" FOREIGN KEY ("couponId") REFERENCES "Coupon"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "TourismPackItem" (
    "id" TEXT NOT NULL,
    "packId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "TourismPackItem_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "TourismPackItem_packId_productId_key" ON "TourismPackItem"("packId", "productId");
ALTER TABLE "TourismPackItem" ADD CONSTRAINT "TourismPackItem_packId_fkey" FOREIGN KEY ("packId") REFERENCES "TourismPack"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TourismPackItem" ADD CONSTRAINT "TourismPackItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "CouponRedemption" (
    "id" TEXT NOT NULL,
    "couponId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "userId" TEXT,
    "amount" DECIMAL(12,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CouponRedemption_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CouponRedemption_couponId_orderId_key" ON "CouponRedemption"("couponId", "orderId");
CREATE INDEX "CouponRedemption_orderId_idx" ON "CouponRedemption"("orderId");
ALTER TABLE "CouponRedemption" ADD CONSTRAINT "CouponRedemption_couponId_fkey" FOREIGN KEY ("couponId") REFERENCES "Coupon"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CouponRedemption" ADD CONSTRAINT "CouponRedemption_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CouponRedemption" ADD CONSTRAINT "CouponRedemption_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "AffiliateCode" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "accommodationId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "clickCount" INTEGER NOT NULL DEFAULT 0,
    "orderCount" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AffiliateCode_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "AffiliateCode_code_key" ON "AffiliateCode"("code");
CREATE INDEX "AffiliateCode_isActive_code_idx" ON "AffiliateCode"("isActive", "code");
ALTER TABLE "AffiliateCode" ADD CONSTRAINT "AffiliateCode_accommodationId_fkey" FOREIGN KEY ("accommodationId") REFERENCES "Accommodation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
