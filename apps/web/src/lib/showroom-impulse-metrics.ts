/**
 * Métricas de control: lista corta de 8, impulso en caja (+4–12 €),
 * compra rápida 12–20 €, tote bag (margen propio) y mini-cata.
 */

import { PRIORITY_EIGHT_ARTICLES } from "./showroom-otros-articulos";

export const IMPULSE_COMMISSION_RATE = 0.17;

export type ImpulseSkuId =
  | "miel"
  | "loncheado"
  | "mermelada"
  | "queso"
  | "tote"
  | "picos"
  | "vino"
  | "minicata";

export type ImpulseSkuDef = {
  id: ImpulseSkuId;
  order: number;
  name: string;
  /** PVP medio orientativo (€) */
  avgPvp: number;
  /** Coste unitario si es margen propio; 0 si es comisión */
  unitCost: number;
  /** true = margen propio (tote / mini-cata); false = comisión 17 % */
  ownMargin: boolean;
  target: string;
};

export const IMPULSE_SKU_DEFS: ImpulseSkuDef[] = [
  {
    id: "miel",
    order: 1,
    name: "Miel 250 g",
    avgPvp: 7.5,
    unitCost: 0,
    ownMargin: false,
    target: "Impulso + regalo",
  },
  {
    id: "loncheado",
    order: 2,
    name: "Embutido loncheado",
    avgPvp: 5.75,
    unitCost: 0,
    ownMargin: false,
    target: "Compra rápida",
  },
  {
    id: "mermelada",
    order: 3,
    name: "Mermelada / dulce",
    avgPvp: 5.5,
    unitCost: 0,
    ownMargin: false,
    target: "Complemento cesta",
  },
  {
    id: "queso",
    order: 4,
    name: "Queso cuña pequeña",
    avgPvp: 6.75,
    unitCost: 0,
    ownMargin: false,
    target: "Ticket medio",
  },
  {
    id: "tote",
    order: 5,
    name: "Tote bag marca",
    avgPvp: 9,
    unitCost: 3.5,
    ownMargin: true,
    target: "Margen propio + publicidad",
  },
  {
    id: "picos",
    order: 6,
    name: "Picos / regañás",
    avgPvp: 3.25,
    unitCost: 0,
    ownMargin: false,
    target: "Añadido en caja",
  },
  {
    id: "vino",
    order: 7,
    name: "Vino / licor zona",
    avgPvp: 12,
    unitCost: 0,
    ownMargin: false,
    target: "Ticket alto",
  },
  {
    id: "minicata",
    order: 8,
    name: "Mini-cata",
    avgPvp: 7,
    unitCost: 1.5,
    ownMargin: true,
    target: "Conversión visitas",
  },
];

export type ImpulseMetricsInputs = {
  /** Días de apertura del periodo medido */
  openDays: number;
  visits: number;
  purchases: number;
  /** Ticket base sin impulso (cestas / ticket medio actual) */
  baseTicket: number;
  /** % de ventas con al menos un añadido de impulso */
  impulseAttachPct: number;
  /** € medios añadidos cuando hay impulso (meta 4–12) */
  avgImpulseAdd: number;
  /** % de compras que son «compra rápida» sin cesta (12–20 €) */
  quickBuyPct: number;
  avgQuickBuyTicket: number;
  /** Unidades vendidas por SKU de la lista de 8 */
  skuUnits: Record<ImpulseSkuId, number>;
  /** Stock inicial de totes (control rotación) */
  toteStock: number;
  /** Coste unitario real de la tote (piloto) */
  toteUnitCost: number;
  /** PVP tote */
  totePvp: number;
  /** Coste variable mini-cata */
  minicataUnitCost: number;
  /** PVP mini-cata */
  minicataPvp: number;
};

export const DEFAULT_IMPULSE_METRICS: ImpulseMetricsInputs = {
  openDays: 12,
  visits: 180,
  purchases: 60,
  baseTicket: 36,
  impulseAttachPct: 45,
  avgImpulseAdd: 7,
  quickBuyPct: 25,
  avgQuickBuyTicket: 16,
  skuUnits: {
    miel: 18,
    loncheado: 15,
    mermelada: 12,
    queso: 8,
    tote: 6,
    picos: 14,
    vino: 5,
    minicata: 10,
  },
  toteStock: 40,
  toteUnitCost: 3.5,
  totePvp: 9,
  minicataUnitCost: 1.5,
  minicataPvp: 7,
};

export type ImpulseSkuResult = ImpulseSkuDef & {
  units: number;
  gmv: number;
  margin: number;
};

export type ImpulseGoalStatus = {
  id: string;
  label: string;
  target: string;
  value: string;
  numericValue: number;
  ok: boolean;
};

export type ImpulseMetricsResult = {
  inputs: ImpulseMetricsInputs;
  conversionPct: number;
  ticketWithImpulse: number;
  ticketUplift: number;
  impulseSalesCount: number;
  impulseGmv: number;
  quickBuyCount: number;
  quickBuyGmv: number;
  basketLikeCount: number;
  skuRows: ImpulseSkuResult[];
  skuGmv: number;
  skuMargin: number;
  toteSold: number;
  toteMargin: number;
  toteSellThroughPct: number;
  toteStockLeft: number;
  miniCataCount: number;
  miniCataRevenue: number;
  miniCataMargin: number;
  miniCataAttachOnVisitsPct: number;
  totalImpulseMargin: number;
  goals: ImpulseGoalStatus[];
  goalsHit: number;
};

function clampPct(n: number) {
  return Math.min(100, Math.max(0, n));
}

function skuMargin(
  def: ImpulseSkuDef,
  units: number,
  toteCost: number,
  totePvp: number,
  minicataCost: number,
  minicataPvp: number,
): {
  gmv: number;
  margin: number;
} {
  if (units <= 0) return { gmv: 0, margin: 0 };
  if (def.id === "tote") {
    const gmv = units * totePvp;
    return { gmv, margin: units * (totePvp - toteCost) };
  }
  if (def.id === "minicata") {
    const gmv = units * minicataPvp;
    return { gmv, margin: units * (minicataPvp - minicataCost) };
  }
  const gmv = units * def.avgPvp;
  if (def.ownMargin) {
    return { gmv, margin: units * (def.avgPvp - def.unitCost) };
  }
  return { gmv, margin: gmv * IMPULSE_COMMISSION_RATE };
}

export function runImpulseMetrics(raw: ImpulseMetricsInputs): ImpulseMetricsResult {
  const inputs: ImpulseMetricsInputs = {
    ...DEFAULT_IMPULSE_METRICS,
    ...raw,
    skuUnits: { ...DEFAULT_IMPULSE_METRICS.skuUnits, ...raw.skuUnits },
  };

  const visits = Math.max(0, Math.round(inputs.visits));
  const purchases = Math.max(0, Math.round(inputs.purchases));
  const attach = clampPct(inputs.impulseAttachPct) / 100;
  const quickPct = clampPct(inputs.quickBuyPct) / 100;
  const avgAdd = Math.max(0, inputs.avgImpulseAdd);

  const conversionPct =
    visits > 0 ? Math.round((purchases / visits) * 1000) / 10 : 0;
  const ticketUplift = Math.round(attach * avgAdd * 10) / 10;
  const ticketWithImpulse = Math.round((inputs.baseTicket + ticketUplift) * 10) / 10;

  const impulseSalesCount = Math.round(purchases * attach);
  const impulseGmv = Math.round(impulseSalesCount * avgAdd * 100) / 100;

  const quickBuyCount = Math.round(purchases * quickPct);
  const quickBuyGmv = Math.round(quickBuyCount * inputs.avgQuickBuyTicket * 100) / 100;
  const basketLikeCount = Math.max(0, purchases - quickBuyCount);

  const skuRows: ImpulseSkuResult[] = IMPULSE_SKU_DEFS.map((def) => {
    const units = Math.max(0, Math.round(inputs.skuUnits[def.id] ?? 0));
    const { gmv, margin } = skuMargin(
      def,
      units,
      inputs.toteUnitCost,
      inputs.totePvp,
      inputs.minicataUnitCost,
      inputs.minicataPvp,
    );
    return {
      ...def,
      units,
      gmv: Math.round(gmv * 100) / 100,
      margin: Math.round(margin * 100) / 100,
    };
  });

  const skuGmv = Math.round(skuRows.reduce((s, r) => s + r.gmv, 0) * 100) / 100;
  const skuMarginTotal =
    Math.round(skuRows.reduce((s, r) => s + r.margin, 0) * 100) / 100;

  const toteRow = skuRows.find((r) => r.id === "tote")!;
  const toteSold = toteRow.units;
  const toteMargin = toteRow.margin;
  const toteStock = Math.max(0, Math.round(inputs.toteStock));
  const toteSellThroughPct =
    toteStock > 0 ? Math.round((toteSold / toteStock) * 1000) / 10 : 0;
  const toteStockLeft = Math.max(0, toteStock - toteSold);

  const miniRow = skuRows.find((r) => r.id === "minicata")!;
  const miniCataCount = miniRow.units;
  const miniCataRevenue = miniRow.gmv;
  const miniCataMargin = miniRow.margin;
  const miniCataAttachOnVisitsPct =
    visits > 0 ? Math.round((miniCataCount / visits) * 1000) / 10 : 0;

  // Margen controlable: comisión implícita del impulso + margen SKU (incluye tote y mini-cata)
  // Evitar doble conteo: usamos margen SKU como fuente primaria + comisión del uplift
  // solo sobre la parte no cubierta por SKU (proxy). Aquí reportamos skuMargin +
  // comisión estimada del attach si SKU gmv < impulse gmv.
  const impulseCommissionProxy = Math.round(impulseGmv * IMPULSE_COMMISSION_RATE * 100) / 100;
  const totalImpulseMargin =
    Math.round((skuMarginTotal + Math.max(0, impulseCommissionProxy * 0.25)) * 100) / 100;

  const goals: ImpulseGoalStatus[] = [
    {
      id: "uplift",
      label: "Subida de ticket por impulso",
      target: "4–12 €",
      value: `${ticketUplift.toLocaleString("es-ES", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} €`,
      numericValue: ticketUplift,
      ok: ticketUplift >= 4 && ticketUplift <= 14,
    },
    {
      id: "attach",
      label: "% ventas con impulso en caja",
      target: "≥ 40 %",
      value: `${clampPct(inputs.impulseAttachPct)} %`,
      numericValue: inputs.impulseAttachPct,
      ok: inputs.impulseAttachPct >= 40,
    },
    {
      id: "ticket",
      label: "Ticket medio con impulso",
      target: "≥ 38 €",
      value: `${ticketWithImpulse.toLocaleString("es-ES", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} €`,
      numericValue: ticketWithImpulse,
      ok: ticketWithImpulse >= 38,
    },
    {
      id: "quick",
      label: "Compra rápida (sin cesta)",
      target: "12–20 € · ≥ 20 % ventas",
      value: `${quickBuyCount} · media ${inputs.avgQuickBuyTicket} €`,
      numericValue: inputs.quickBuyPct,
      ok:
        inputs.quickBuyPct >= 20 &&
        inputs.avgQuickBuyTicket >= 12 &&
        inputs.avgQuickBuyTicket <= 22,
    },
    {
      id: "tote",
      label: "Tote bag — rotación stock",
      target: "Sell-through ≥ 35 %",
      value: `${toteSellThroughPct} % (${toteSold}/${toteStock})`,
      numericValue: toteSellThroughPct,
      ok: toteStock === 0 ? false : toteSellThroughPct >= 35,
    },
    {
      id: "toteMargin",
      label: "Margen propio tote",
      target: "≥ 30 € en el periodo",
      value: `${toteMargin.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`,
      numericValue: toteMargin,
      ok: toteMargin >= 30,
    },
    {
      id: "minicata",
      label: "Mini-cata / visitas",
      target: "≥ 5 % visitas",
      value: `${miniCataAttachOnVisitsPct} % (${miniCataCount})`,
      numericValue: miniCataAttachOnVisitsPct,
      ok: miniCataAttachOnVisitsPct >= 5,
    },
    {
      id: "sku",
      label: "Unidades lista de 8",
      target: "≥ 60 uds en el periodo",
      value: String(skuRows.reduce((s, r) => s + r.units, 0)),
      numericValue: skuRows.reduce((s, r) => s + r.units, 0),
      ok: skuRows.reduce((s, r) => s + r.units, 0) >= 60,
    },
  ];

  return {
    inputs,
    conversionPct,
    ticketWithImpulse,
    ticketUplift,
    impulseSalesCount,
    impulseGmv,
    quickBuyCount,
    quickBuyGmv,
    basketLikeCount,
    skuRows,
    skuGmv,
    skuMargin: skuMarginTotal,
    toteSold,
    toteMargin,
    toteSellThroughPct,
    toteStockLeft,
    miniCataCount,
    miniCataRevenue,
    miniCataMargin,
    miniCataAttachOnVisitsPct,
    totalImpulseMargin,
    goals,
    goalsHit: goals.filter((g) => g.ok).length,
  };
}

/** KPIs a anotar cada 15 días (operativa). */
export const IMPULSE_BIWEEKLY_KPIS = [
  "Ticket medio (base) y ticket con impulso",
  "% de ventas con añadido en caja (attach)",
  "€ medios de impulso cuando hay añadido (meta 4–12)",
  "% compras rápidas 12–20 € vs cestas",
  "Unidades vendidas por cada uno de los 8 artículos",
  "Stock tote / unidades vendidas / margen propio",
  "Nº mini-catas y % sobre visitas",
  "Margen estimado lista de 8 (comisión + propio)",
] as const;

export const IMPULSE_METRICS_NOTE =
  "Simulador operativo: introduce lo medido en el periodo (días de apertura) y contrasta con las metas de la lista corta. No sustituye la contabilidad; orienta el control semanal.";

/** Referencia rápida PVP lista corta (para UI). */
export const PRIORITY_EIGHT_PVP_HINT = PRIORITY_EIGHT_ARTICLES.map((a) => ({
  order: a.order,
  name: a.name,
  pvp: a.pvp,
}));
