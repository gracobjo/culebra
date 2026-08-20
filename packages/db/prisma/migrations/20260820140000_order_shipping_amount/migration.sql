-- Umbral de envío gratuito: importe cobrado al cliente (0 si gratis)

ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "shippingAmount" DECIMAL(12,2) NOT NULL DEFAULT 0;
