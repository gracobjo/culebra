/**
 * Modelo financiero del marketplace (espejo del Excel
 * Modelo_Cuenta_Resultados_Marketplace_5_anos.xlsx + anexos §9.A/§9.B del dossier).
 * Fuente de verdad operativa en panel admin: /admin/plan
 *
 * v5 (ago-2026): GMV estrictamente prudente (14→125k), comisión 17 %, RETA, sin envío gratis.
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
export const GMV_BREAKEVEN_MONTHLY = 8_065; // fijos ~1.250 € ÷ margen ~15,5 % (comisión 17 % − Stripe 1,5 %)
export const INVESTMENT_REF = 40_000;
export const SUBSIDY_AT_74_PCT = 22_200; // 74 % sobre 30k elegibles (Plan Viabilidad)
export const PARTNER_CONTRIBUTION = 17_800; // Plan Viabilidad: 40k − 22,2k (74% sobre 30k elegibles)
/** Elegible: A.I 14.500 + A.II 8.500 + B–E 7.000 = 30.000 (contrato menor) */
export const INVESTMENT_ELIGIBLE_REF = 30_000;
export const DIVIDEND_TARGET = 0; // caso base no prioriza dividendos
export const NET_ACCUM_TARGET = -16_586; // Excel conservador v5 (populate_pyg_excel)

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
      "Caso base: GMV estrictamente prudente, comisión 17 %, RETA, sin absorción de portes.",
    years: [
      { year: 1, gmv: 14_000, revenue: 2_380, net: -4_718 },
      { year: 2, gmv: 48_000, revenue: 8_160, net: -7_872 },
      { year: 3, gmv: 75_000, revenue: 12_750, net: -4_743 },
      { year: 4, gmv: 100_000, revenue: 17_000, net: -1_432 },
      { year: 5, gmv: 125_000, revenue: 21_250, net: 2_179 },
    ],
    netAccum5y: -16_586,
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
  gmv: 14_000,
  ticket: AVG_TICKET_EUR,
  ordersTotal: Math.round(14_000 / AVG_TICKET_EUR), // ~215
  ordersPerMonth: 36,
  conversionRate: 0.02,
  sessionsPerMonth: 1_800,
  sessionsRange: [1_200, 2_400] as const,
  adsBudgetMonthly: 330,
  adsBudgetY1: 2_000,
  cacTarget: 5,
  cacMax: 8,
  roasMin: 3.5,
  commissionPerOrder: (14_000 * COMMISSION_RATE) / Math.round(14_000 / AVG_TICKET_EUR),
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
