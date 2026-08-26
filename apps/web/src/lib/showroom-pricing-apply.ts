import type { ShowroomBasket } from "@/lib/showroom-cestas";
import type { ShowroomPricingSnapshot } from "@culebra/auth/showroom-pricing.service";

/** Aplica PVP y coste de packaging del catálogo persistente a las cestas del playbook. */
export function applyPricingSnapshotToBaskets(
  baskets: ShowroomBasket[],
  snapshot: ShowroomPricingSnapshot,
): ShowroomBasket[] {
  return baskets.map((basket) => {
    const row = snapshot.baskets[basket.slug];
    if (!row) return basket;
    return {
      ...basket,
      pvp: row.pvp,
      packagingCost: row.packagingCost,
    };
  });
}
