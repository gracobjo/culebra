/**
 * Modelo financiero del marketplace (espejo del Excel
 * Modelo_Cuenta_Resultados_Marketplace_5_anos.xlsx + anexos §9.A/§9.B del dossier).
 * Fuente de verdad operativa en panel admin: /admin/plan
 *
 * v4 (ago-2026): comisión 17 %, GMV prudente, sin envío gratis; prioriza elegibilidad de ayuda.
 */

export type PlanScenarioId = "conservador" | "realista" | "optimista";

export type PlanYearRow = {
  year: number;
  gmv: number;
  revenue: number; // comisión 17 %
  net: number;
};

export const COMMISSION_RATE = 0.17;
export const COMMISSION_MIN_EUR = 4;
export const SHIPPING_FLAT_EUR = 6.5;
export const AVG_TICKET_EUR = 65;
/** GMV mensuales orientativos Y3+ con opex contenido (~ gastos fijos ÷ 17 %) */
export const GMV_BREAKEVEN_MONTHLY = 9_500;
export const INVESTMENT_REF = 40_000;
export const SUBSIDY_AT_74_PCT = 29_600;
export const PARTNER_CONTRIBUTION = 10_400; // 40k − 29,6k
export const DIVIDEND_TARGET = 0; // caso base no prioriza dividendos
export const NET_ACCUM_TARGET = -3_680; // referencia dossier (aceptable vs aportación 10,4k)

/** Pesos estacionales EOTR Zamora (viajeros 2024) — mismo criterio que populate_pyg_excel.py */
export const SEASON_WEIGHTS = [
  2752, 3851, 5713, 3900, 5539, 5940, 8380, 12151, 5981, 6633, 5731, 5338,
].map((n, _, arr) => n / arr.reduce((a, b) => a + b, 0));

export const MONTH_LABELS = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic",
] as const;

/** Meses con venta en Año 1 del escenario conservador (jul–dic) */
export const Y1_ACTIVE_MONTHS = [7, 8, 9, 10, 11, 12] as const;

export const PLAN_SCENARIOS: Record<
  PlanScenarioId,
  {
    id: PlanScenarioId;
    label: string;
    description: string;
    years: PlanYearRow[];
    netAccum5y: number;
    vendorsY3: number;
  }
> = {
  conservador: {
    id: "conservador",
    label: "Conservador",
    description:
      "Caso base de firma / justificación: GMV prudente, comisión 17 %, sin envío gratis.",
    years: [
      { year: 1, gmv: 16_000, revenue: 2_720, net: -4_380 },
      { year: 2, gmv: 55_000, revenue: 9_350, net: -5_450 },
      { year: 3, gmv: 90_000, revenue: 15_300, net: -1_600 },
      { year: 4, gmv: 120_000, revenue: 20_400, net: 2_200 },
      { year: 5, gmv: 145_000, revenue: 24_650, net: 5_550 },
    ],
    netAccum5y: -3_680,
    vendorsY3: 8,
  },
  realista: {
    id: "realista",
    label: "Realista",
    description: "Sensibilidad al alza (más captación); no es el caso base de justificación.",
    years: [
      { year: 1, gmv: 28_000, revenue: 4_760, net: -4_200 },
      { year: 2, gmv: 95_000, revenue: 16_150, net: -1_700 },
      { year: 3, gmv: 150_000, revenue: 25_500, net: 4_050 },
      { year: 4, gmv: 200_000, revenue: 34_000, net: 9_300 },
      { year: 5, gmv: 250_000, revenue: 42_500, net: 14_600 },
    ],
    netAccum5y: 22_050,
    vendorsY3: 11,
  },
  optimista: {
    id: "optimista",
    label: "Optimista",
    description: "Techo de sensibilidad; no usar como base ante la administración.",
    years: [
      { year: 1, gmv: 40_000, revenue: 6_800, net: -4_200 },
      { year: 2, gmv: 140_000, revenue: 23_800, net: 970 },
      { year: 3, gmv: 220_000, revenue: 37_400, net: 7_840 },
      { year: 4, gmv: 300_000, revenue: 51_000, net: 15_400 },
      { year: 5, gmv: 380_000, revenue: 64_600, net: 23_000 },
    ],
    netAccum5y: 43_010,
    vendorsY3: 14,
  },
};

/** Embudo Año 1 (dossier §9.B) — anclado al conservador */
export const CONVERSION_Y1 = {
  gmv: 16_000,
  ticket: AVG_TICKET_EUR,
  ordersTotal: Math.round(16_000 / AVG_TICKET_EUR), // ~246
  ordersPerMonth: 42,
  conversionRate: 0.02,
  sessionsPerMonth: 2_100,
  sessionsRange: [1_400, 2_800] as const,
  adsBudgetMonthly: 250,
  adsBudgetY1: 1_500,
  cacTarget: 5,
  cacMax: 8,
  roasMin: 3.5,
  commissionPerOrder: (16_000 * COMMISSION_RATE) / Math.round(16_000 / AVG_TICKET_EUR),
} as const;

export const EXCEL_PUBLIC_PATH =
  "/docs/Modelo_Cuenta_Resultados_Marketplace_5_anos.xlsx" as const;

export function ordersFromGmv(gmv: number, ticket = AVG_TICKET_EUR): number {
  return Math.round(gmv / ticket);
}

export function commissionForOrder(merchandiseEur: number): number {
  return Math.max(merchandiseEur * COMMISSION_RATE, COMMISSION_MIN_EUR);
}

export function monthlyGmvProfile(
  annualGmv: number,
  year: number,
): { month: number; label: string; gmv: number; revenue: number }[] {
  if (year === 1) {
    const activeWeight = Y1_ACTIVE_MONTHS.reduce(
      (sum, m) => sum + SEASON_WEIGHTS[m - 1]!,
      0,
    );
    return MONTH_LABELS.map((label, i) => {
      const month = i + 1;
      const active = (Y1_ACTIVE_MONTHS as readonly number[]).includes(month);
      const gmv = active
        ? annualGmv * (SEASON_WEIGHTS[i]! / activeWeight)
        : 0;
      return { month, label, gmv, revenue: gmv * COMMISSION_RATE };
    });
  }

  return MONTH_LABELS.map((label, i) => {
    const gmv = annualGmv * SEASON_WEIGHTS[i]!;
    return { month: i + 1, label, gmv, revenue: gmv * COMMISSION_RATE };
  });
}

export function accumulateNet(years: PlanYearRow[]): number[] {
  let run = 0;
  return years.map((y) => {
    run += y.net;
    return run;
  });
}
