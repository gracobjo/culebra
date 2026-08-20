/**
 * Modelo financiero del marketplace (espejo del Excel
 * Modelo_Cuenta_Resultados_Marketplace_5_anos.xlsx + anexos §9.A/§9.B del dossier).
 * Fuente de verdad operativa en panel admin: /admin/plan
 */

export type PlanScenarioId = "conservador" | "realista" | "optimista";

export type PlanYearRow = {
  year: number;
  gmv: number;
  revenue: number; // comisión 15 %
  net: number;
};

export const COMMISSION_RATE = 0.15;
export const AVG_TICKET_EUR = 65;
export const GMV_BREAKEVEN_MONTHLY = 11_400;
export const INVESTMENT_REF = 30_000;
export const DIVIDEND_TARGET = 4_500; // 15 % sobre inversión
export const NET_ACCUM_TARGET = INVESTMENT_REF + DIVIDEND_TARGET; // 34.500

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
    description: "Referencia del Pacto de Socios / memoria ICECYL.",
    years: [
      { year: 1, gmv: 40_000, revenue: 6_000, net: -4_380 },
      { year: 2, gmv: 140_000, revenue: 21_000, net: 459 },
      { year: 3, gmv: 220_000, revenue: 33_000, net: 7_803 },
      { year: 4, gmv: 280_000, revenue: 42_000, net: 14_688 },
      { year: 5, gmv: 360_000, revenue: 54_000, net: 23_868 },
    ],
    netAccum5y: 41_438,
    vendorsY3: 11,
  },
  realista: {
    id: "realista",
    label: "Realista",
    description: "Sensibilidad al alza (más vendedores y gasto).",
    years: [
      { year: 1, gmv: 75_000, revenue: 11_250, net: -4_425 },
      { year: 2, gmv: 260_000, revenue: 39_000, net: 153 },
      { year: 3, gmv: 400_000, revenue: 60_000, net: 7_752 },
      { year: 4, gmv: 520_000, revenue: 78_000, net: 16_453 },
      { year: 5, gmv: 680_000, revenue: 102_000, net: 32_201 },
    ],
    netAccum5y: 52_134,
    vendorsY3: 14,
  },
  optimista: {
    id: "optimista",
    label: "Optimista",
    description: "Techo de sensibilidad; no es el caso base de firma.",
    years: [
      { year: 1, gmv: 110_000, revenue: 16_500, net: -3_510 },
      { year: 2, gmv: 400_000, revenue: 60_000, net: 3_876 },
      { year: 3, gmv: 620_000, revenue: 93_000, net: 13_790 },
      { year: 4, gmv: 800_000, revenue: 120_000, net: 21_757 },
      { year: 5, gmv: 1_050_000, revenue: 157_500, net: 39_367 },
    ],
    netAccum5y: 75_280,
    vendorsY3: 18,
  },
};

/** Embudo Año 1 (dossier §9.B) — anclado al conservador */
export const CONVERSION_Y1 = {
  gmv: 40_000,
  ticket: AVG_TICKET_EUR,
  ordersTotal: Math.round(40_000 / AVG_TICKET_EUR), // ~615
  ordersPerMonth: 100,
  conversionRate: 0.02,
  sessionsPerMonth: 5_000,
  sessionsRange: [3_300, 6_700] as const,
  adsBudgetMonthly: 500,
  adsBudgetY1: 3_000,
  cacTarget: 6,
  cacMax: 10,
  roasMin: 3.5,
  commissionPerOrder: 40_000 * COMMISSION_RATE / Math.round(40_000 / AVG_TICKET_EUR),
} as const;

export const EXCEL_PUBLIC_PATH =
  "/docs/Modelo_Cuenta_Resultados_Marketplace_5_anos.xlsx" as const;

export function ordersFromGmv(gmv: number, ticket = AVG_TICKET_EUR): number {
  return Math.round(gmv / ticket);
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
