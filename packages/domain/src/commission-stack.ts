const DEFAULT_MIN_COMMISSION_EUR = 4;
const MAX_EXTERNAL_CHANNEL_COMMISSION_PERCENT = 10;

/** Tramos rappel (comisión S.L. durante el año; liquidación al cierre). */
export const PRODUCER_TIER_COMMISSION_PERCENT = {
  BRONZE: 17,
  SILVER: 14,
  GOLD: 12,
} as const;

export type ProducerTierKey = keyof typeof PRODUCER_TIER_COMMISSION_PERCENT;

export type StackedCommissionInput = {
  /** PVP productos (sin portes). */
  pvp: number;
  /** Comisión S.L. al productor (17 / 14 / 12). */
  producerCommissionPct: number;
  /** Comisión canal externo (alojamiento, afiliado…). 0 si venta directa. */
  channelCommissionPct?: number;
  /** Suelo por subpedido de productor (default 4 €). */
  minProducerCommissionEur?: number;
  /** Coste directo imputable (packaging, etc.) restado del margen S.L. */
  packagingCost?: number;
};

export type StackedCommissionBreakdown = {
  pvp: number;
  channelCommissionPct: number;
  channelCommission: number;
  producerBase: number;
  producerCommissionPct: number;
  marketplaceCommission: number;
  producerNet: number;
  packagingCost: number;
  slGrossCommission: number;
  slNetMargin: number;
};

function roundMoney(value: number): number {
  return Number(value.toFixed(2));
}

/**
 * Reparto en cascada: PVP → canal externo → comisión productor sobre el resto.
 * Ver docs/Modelos_Comisiones_Consolidado.md
 */
export function calculateStackedCommission(
  input: StackedCommissionInput,
): StackedCommissionBreakdown {
  const pvp = roundMoney(Math.max(0, input.pvp));
  const channelPct = roundMoney(
    Math.min(
      MAX_EXTERNAL_CHANNEL_COMMISSION_PERCENT,
      Math.max(0, input.channelCommissionPct ?? 0),
    ),
  );
  const producerPct = roundMoney(Math.max(0, input.producerCommissionPct));
  const minCommission = input.minProducerCommissionEur ?? DEFAULT_MIN_COMMISSION_EUR;
  const packagingCost = roundMoney(Math.max(0, input.packagingCost ?? 0));

  const channelCommission = roundMoney((pvp * channelPct) / 100);
  const producerBase = roundMoney(Math.max(0, pvp - channelCommission));
  const percentCommission = roundMoney(Math.round(producerBase * producerPct) / 100);
  const marketplaceCommission = roundMoney(
    Math.min(producerBase, Math.max(percentCommission, minCommission)),
  );
  const producerNet = roundMoney(Math.max(0, producerBase - marketplaceCommission));
  const slGrossCommission = marketplaceCommission;
  const slNetMargin = roundMoney(slGrossCommission - packagingCost);

  return {
    pvp,
    channelCommissionPct: channelPct,
    channelCommission,
    producerBase,
    producerCommissionPct: producerPct,
    marketplaceCommission,
    producerNet,
    packagingCost,
    slGrossCommission,
    slNetMargin,
  };
}

/** Cestas de referencia para la tabla de decisión rápida. */
export const REFERENCE_BASKET_PVP = {
  ESCAPADA: 29,
  COMARCA: 45,
  SIERRA: 65,
  RESERVA: 89,
} as const;

export type MarginDecision = "ACCEPT" | "VOLUME_ONLY" | "AVOID";

export function classifySlNetMargin(netMargin: number): MarginDecision {
  if (netMargin >= 3.5) return "ACCEPT";
  if (netMargin >= 2) return "VOLUME_ONLY";
  return "AVOID";
}

export function referenceBasketMarginTable(params?: {
  channelCommissionPct?: number;
  packagingCostByPvp?: (pvp: number) => number;
}) {
  const channelPct = params?.channelCommissionPct ?? 10;
  const packagingFor = params?.packagingCostByPvp ?? ((pvp: number) => roundMoney(pvp * 0.053));

  const tiers = Object.entries(PRODUCER_TIER_COMMISSION_PERCENT) as Array<
    [ProducerTierKey, number]
  >;
  const baskets = Object.entries(REFERENCE_BASKET_PVP) as Array<[string, number]>;

  return baskets.map(([basketKey, pvp]) => {
    const packagingCost = packagingFor(pvp);
    const cells = tiers.map(([tierKey, producerPct]) => {
      const breakdown = calculateStackedCommission({
        pvp,
        producerCommissionPct: producerPct,
        channelCommissionPct: channelPct,
        packagingCost,
      });
      return {
        tierKey,
        producerPct,
        breakdown,
        decision: classifySlNetMargin(breakdown.slNetMargin),
      };
    });
    return { basketKey, pvp, cells };
  });
}
