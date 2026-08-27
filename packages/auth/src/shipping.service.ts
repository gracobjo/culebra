import { CUSTOMER_SHIPPING_FEE_EUR } from "@culebra/domain";

import { getCustomerShippingFeeEur } from "./shipping-settings.service.js";

export type ShippingQuote = {
  /** Merchandise after coupon, before shipping. */
  merchandiseTotal: number;
  /** What the customer pays for shipping (flat fee; never free). */
  shippingAmount: number;
  /** Always false — política v4 sin envío gratis. */
  shippingFree: boolean;
  /** Always 0 — no hay umbral de gratuidad. */
  amountToFreeShipping: number;
  /** merchandiseTotal + shippingAmount. */
  grandTotal: number;
  /** @deprecated Conservado por compatibilidad; no hay umbral. */
  threshold: number;
  standardFee: number;
  /** Always 0 — la S.L. no absorbe portes. */
  absorbedShippingCost: number;
};

/**
 * Política de envíos v4 (dossier):
 * - El cliente paga siempre tarifa plana (BD `/admin/config` o fallback de dominio).
 * - No hay envío gratis ni absorción de etiquetas por la S.L.
 * - Carrito vacío (merchandise 0) → shipping 0.
 */
export function computeShippingQuote(
  merchandiseTotal: number,
  feeEur: number = CUSTOMER_SHIPPING_FEE_EUR,
): ShippingQuote {
  const merchandise = Number(Math.max(0, merchandiseTotal).toFixed(2));
  const standardFee = Number(Math.max(0, feeEur).toFixed(2));
  const shippingAmount = merchandise > 0 ? standardFee : 0;
  const grandTotal = Number((merchandise + shippingAmount).toFixed(2));

  return {
    merchandiseTotal: merchandise,
    shippingAmount: Number(shippingAmount.toFixed(2)),
    shippingFree: false,
    amountToFreeShipping: 0,
    grandTotal,
    threshold: Number.POSITIVE_INFINITY,
    standardFee,
    absorbedShippingCost: 0,
  };
}

/** Quote con la tarifa vigente en admin (singleton ShippingSettings). */
export async function getShippingQuote(merchandiseTotal: number): Promise<ShippingQuote> {
  const fee = await getCustomerShippingFeeEur();
  return computeShippingQuote(merchandiseTotal, fee);
}
