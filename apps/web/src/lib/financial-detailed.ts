/**
 * Modelo financiero detallado operativo (3 años): online + showroom/cestas.
 * Distinto del Excel conservador de justificación (14→125 k GMV).
 * Fuente: docs/Modelo_Financiero_Detallado.md · panel /admin/plan
 */

export const DETAILED_COMMISSION_RATE = 0.17;
export const DETAILED_NET_MARGIN_ON_GMV = 0.145; // 17 % − packaging y descuentos
export const DETAILED_FIXED_MONTHLY_Y1 = 1_250;
export const DETAILED_GMV_BREAKEVEN_MONTHLY = 8_600;
export const DETAILED_GMV_BREAKEVEN_ANNUAL = 103_000;
export const DETAILED_TICKET_ONLINE = 42;
export const DETAILED_MULTI_PRODUCER_Y1 = 0.35;
export const DETAILED_MULTI_PRODUCER_Y3 = 0.45;
export const DETAILED_INVESTMENT_ELIGIBLE = 30_000;
export const DETAILED_SUBSIDY_74 = 22_200;

export const DETAILED_FIXED_COSTS_Y1 = [
  { item: "Local (comodato + suministros)", amount: 180 },
  { item: "Conectividad / software / Stripe", amount: 120 },
  { item: "Marketing digital contenido", amount: 350 },
  { item: "Gestoría + seguros", amount: 150 },
  { item: "Desplazamientos / varios", amount: 100 },
  { item: "Contingencia operativa", amount: 150 },
] as const;

export type DetailedYearId = 1 | 2 | 3;

export type DetailedYearRow = {
  year: DetailedYearId;
  onlineOrdersPerMonth: number;
  gmvOnline: number;
  showroomOrdersYear: number;
  gmvShowroom: number;
  gmvTotal: number;
  commissionOnline: number;
  commissionShowroom: number;
  commissionTotal: number;
  packaging: number;
  netActivity: number;
  fixedAnnual: number;
  operatingResult: number;
  optionalExperiences: number;
  resultWithExperiences: number;
  residualCapex: number;
  cashFlow: number;
};

export const DETAILED_YEARS: DetailedYearRow[] = [
  {
    year: 1,
    onlineOrdersPerMonth: 45,
    gmvOnline: 22_700,
    showroomOrdersYear: 380,
    gmvShowroom: 15_200,
    gmvTotal: 37_900,
    commissionOnline: 3_860,
    commissionShowroom: 2_580,
    commissionTotal: 6_440,
    packaging: 900,
    netActivity: 5_540,
    fixedAnnual: 15_000,
    operatingResult: -9_460,
    optionalExperiences: 800,
    resultWithExperiences: -8_660,
    residualCapex: 3_000,
    cashFlow: -12_460,
  },
  {
    year: 2,
    onlineOrdersPerMonth: 85,
    gmvOnline: 42_800,
    showroomOrdersYear: 620,
    gmvShowroom: 26_500,
    gmvTotal: 69_300,
    commissionOnline: 7_280,
    commissionShowroom: 4_500,
    commissionTotal: 11_780,
    packaging: 1_450,
    netActivity: 10_330,
    fixedAnnual: 16_800,
    operatingResult: -6_470,
    optionalExperiences: 1_500,
    resultWithExperiences: -4_970,
    residualCapex: 1_000,
    cashFlow: -7_470,
  },
  {
    year: 3,
    onlineOrdersPerMonth: 130,
    gmvOnline: 65_500,
    showroomOrdersYear: 900,
    gmvShowroom: 39_600,
    gmvTotal: 105_100,
    commissionOnline: 11_140,
    commissionShowroom: 6_730,
    commissionTotal: 17_870,
    packaging: 2_100,
    netActivity: 15_770,
    fixedAnnual: 18_500,
    operatingResult: -2_730,
    optionalExperiences: 2_200,
    resultWithExperiences: -530,
    residualCapex: 500,
    cashFlow: -3_230,
  },
];

export function detailedCashAccumulated(): number[] {
  let run = 0;
  return DETAILED_YEARS.map((y) => {
    run += y.cashFlow;
    return run;
  });
}

export const DETAILED_BASKET_Y1 = [
  { name: "Escapada 29 €", unitMargin: 2.45, units: 120, margin: 294 },
  { name: "Comarca 45 €", unitMargin: 4.49, units: 180, margin: 808 },
  { name: "Sierra 65 €", unitMargin: 7.17, units: 60, margin: 430 },
  { name: "Reserva 89 €", unitMargin: 9.44, units: 20, margin: 189 },
] as const;

export const DETAILED_BASKET_Y1_TOTAL_MARGIN = 1_720;

export const DETAILED_SENSITIVITY = [
  { variable: "+20 % GMV", impact: "Mejora el resultado ~1.100–1.800 €/año" },
  { variable: "Comisión efectiva 15 % en vez de 17 %", impact: "Empeora ~1.100–1.900 €/año" },
  { variable: "Coste fijo +200 €/mes", impact: "Empeora 2.400 €/año" },
  { variable: "Cestas ×1,5", impact: "Mejora 800–1.300 €/año" },
  { variable: "Retraso 6 meses en subvención", impact: "Tensión de tesorería (plan de contingencia)" },
] as const;
