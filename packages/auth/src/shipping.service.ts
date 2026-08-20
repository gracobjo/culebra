import {
  CUSTOMER_SHIPPING_FEE_EUR,
  FREE_SHIPPING_THRESHOLD_EUR,
  MARKETPLACE_SHIPPING_COST_EUR,
} from "@culebra/domain";

export type ShippingQuote = {
  /** Merchandise after coupon, before shipping. */
  merchandiseTotal: number;
  /** What the customer pays for shipping (0 if free). */
  shippingAmount: number;
  /** True when shippingAmount === 0 because threshold was met. */
  shippingFree: boolean;
  /** EUR still needed to unlock free shipping (0 if already free). */
  amountToFreeShipping: number;
  /** merchandiseTotal + shippingAmount. */
  grandTotal: number;
  threshold: number;
  standardFee: number;
  /** Internal cost absorbed by marketplace when shipping is free (informational). */
  absorbedShippingCost: number;
};

/**
 * Umbral de envío gratuito:
 * - merchandise < 49 € → cliente paga 4,95 €
 * - merchandise >= 49 € → envío gratis (marketplace absorbe el coste logístico
 *   desde su comisión; el productor conserva su 85 % íntegro)
 */
export function computeShippingQuote(merchandiseTotal: number): ShippingQuote {
  const merchandise = Number(Math.max(0, merchandiseTotal).toFixed(2));
  const threshold = FREE_SHIPPING_THRESHOLD_EUR;
  const standardFee = CUSTOMER_SHIPPING_FEE_EUR;
  const shippingFree = merchandise >= threshold;
  const shippingAmount = shippingFree ? 0 : standardFee;
  const amountToFreeShipping = shippingFree
    ? 0
    : Number(Math.max(0, threshold - merchandise).toFixed(2));
  const grandTotal = Number((merchandise + shippingAmount).toFixed(2));
  const absorbedShippingCost = shippingFree ? MARKETPLACE_SHIPPING_COST_EUR : 0;

  return {
    merchandiseTotal: merchandise,
    shippingAmount: Number(shippingAmount.toFixed(2)),
    shippingFree,
    amountToFreeShipping,
    grandTotal,
    threshold,
    standardFee,
    absorbedShippingCost,
  };
}
