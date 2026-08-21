/**
 * Simulación decisional alineada al Plan de Viabilidad §5 (F–M) y Plan de Negocio.
 * Permite al admin variar comisión, fijos, RETA, marketing, alquiler, ticket y GMV.
 */

export const STRIPE_RATE = 0.015;

/** GMV base del escenario prudente (Plan Viabilidad / Excel conservador) */
export const BASE_GMV_BY_YEAR = [14_000, 48_000, 75_000, 100_000, 125_000] as const;

export type FixedCostParts = {
  cloud: number;
  office: number;
  reta: number;
  maintenance: number;
  marketing: number;
  rent: number; // 0 = comodato; 300 = alquiler tipificado
};

export type SimulationInputs = {
  commissionRate: number; // 0.15–0.18
  ticketEur: number;
  gmvScale: number; // 0.7–1.5 sobre BASE_GMV
  fixed: FixedCostParts;
  /** Meses con venta en Año 1 (plan: jul–dic) */
  y1SaleMonths: number;
};

export type YearSimulation = {
  year: number;
  gmv: number;
  revenue: number;
  stripe: number;
  opex: number;
  months: number;
  fixedMonthly: number;
  net: number;
  orders: number;
};

export type SimulationResult = {
  inputs: SimulationInputs;
  fixedMonthly: number;
  contributionMarginRate: number;
  marginPerOrder: number;
  gmvBreakevenMonthly: number;
  ordersBreakevenMonthly: number;
  ordersPerDayBreakeven: number;
  years: YearSimulation[];
  netAccum3y: number;
  netAccum5y: number;
  partnerContribution: number;
  subsidyRef: number;
  capitalRef: number;
  /** Año en que el GMV medio mensual supera el break-even (1–5 o null) */
  breakevenYear: number | null;
  verdict: string;
  verdictTone: "good" | "warn" | "bad";
};

export const DEFAULT_FIXED: FixedCostParts = {
  cloud: 300,
  office: 300,
  reta: 200,
  maintenance: 200,
  marketing: 250,
  rent: 0,
};

export const DEFAULT_SIMULATION: SimulationInputs = {
  commissionRate: 0.17,
  ticketEur: 62,
  gmvScale: 1,
  fixed: { ...DEFAULT_FIXED },
  y1SaleMonths: 6,
};

export const CAPITAL_REF = 40_000;
export const SUBSIDY_REF = 22_200; // 74 % sobre 30k elegibles
export const PARTNER_NET_REF = CAPITAL_REF - SUBSIDY_REF;

export function sumFixedMonthly(fixed: FixedCostParts): number {
  return (
    fixed.cloud +
    fixed.office +
    fixed.reta +
    fixed.maintenance +
    fixed.marketing +
    fixed.rent
  );
}

export function runSimulation(inputs: SimulationInputs): SimulationResult {
  const fixedMonthly = sumFixedMonthly(inputs.fixed);
  const contributionMarginRate = Math.max(0.001, inputs.commissionRate - STRIPE_RATE);
  const gmvBreakevenMonthly = fixedMonthly / contributionMarginRate;
  const ticket = Math.max(1, inputs.ticketEur);
  const ordersBreakevenMonthly = gmvBreakevenMonthly / ticket;
  const ordersPerDayBreakeven = ordersBreakevenMonthly / 30;

  // Año 1: fijos algo más bajos en media (plan ~1.100 €) si marketing arranca en H2
  const y1FixedMonthly = fixedMonthly * 0.88;

  const years: YearSimulation[] = BASE_GMV_BY_YEAR.map((baseGmv, i) => {
    const year = i + 1;
    const gmv = Math.round(baseGmv * inputs.gmvScale);
    const months = year === 1 ? inputs.y1SaleMonths : 12;
    const fm = year === 1 ? y1FixedMonthly : fixedMonthly;
    const revenue = gmv * inputs.commissionRate;
    const stripe = gmv * STRIPE_RATE;
    const opex = fm * months;
    const net = revenue - stripe - opex;
    const orders = Math.round(gmv / ticket);
    return {
      year,
      gmv,
      revenue,
      stripe,
      opex,
      months,
      fixedMonthly: fm,
      net,
      orders,
    };
  });

  let run = 0;
  const nets = years.map((y) => {
    run += y.net;
    return run;
  });

  const netAccum3y = nets[2]!;
  const netAccum5y = nets[4]!;

  let breakevenYear: number | null = null;
  for (const y of years) {
    const monthlyGmv = y.gmv / y.months;
    if (monthlyGmv >= gmvBreakevenMonthly) {
      breakevenYear = y.year;
      break;
    }
  }

  const partnerContribution = PARTNER_NET_REF;
  let verdict: string;
  let verdictTone: SimulationResult["verdictTone"];

  if (inputs.fixed.rent > 0 && fixedMonthly >= 1_500) {
    verdict =
      "Con alquiler / estructura alta el acum. a 3 años se degrada con fuerza. Prioriza comodato o más GMV.";
    verdictTone = "bad";
  } else if (inputs.commissionRate < 0.165 && netAccum3y < -19_000) {
    verdict =
      "Comisión baja + volumen prudente: pérdidas a 3 años más profundas. Valora 17 % + rappels.";
    verdictTone = "warn";
  } else if (breakevenYear !== null && breakevenYear <= 3 && netAccum3y > -12_000) {
    verdict =
      "Escenario manejable: equilibrio operativo temprano y pérdidas acumuladas contenidas.";
    verdictTone = "good";
  } else if (breakevenYear !== null && breakevenYear <= 4) {
    verdict =
      "Alineado al plan base: equilibrio orientativo en torno al Año 4; Y1–Y3 de supervivencia + subvención.";
    verdictTone = "warn";
  } else {
    verdict =
      "Por debajo del umbral operativo hasta Y5+. Reduce fijos (marketing/RETA/alquiler) o sube GMV/comisión.";
    verdictTone = "bad";
  }

  return {
    inputs,
    fixedMonthly,
    contributionMarginRate,
    marginPerOrder: ticket * contributionMarginRate,
    gmvBreakevenMonthly,
    ordersBreakevenMonthly,
    ordersPerDayBreakeven,
    years,
    netAccum3y,
    netAccum5y,
    partnerContribution,
    subsidyRef: SUBSIDY_REF,
    capitalRef: CAPITAL_REF,
    breakevenYear,
    verdict,
    verdictTone,
  };
}

/** Comparativa cerrada 15 % vs 17 % con el resto de inputs fijos */
export function compareCommissions(
  base: Omit<SimulationInputs, "commissionRate">,
): { pct15: SimulationResult; pct17: SimulationResult; deltaAccum3y: number } {
  const pct15 = runSimulation({ ...base, commissionRate: 0.15, fixed: { ...base.fixed } });
  const pct17 = runSimulation({ ...base, commissionRate: 0.17, fixed: { ...base.fixed } });
  return {
    pct15,
    pct17,
    deltaAccum3y: pct17.netAccum3y - pct15.netAccum3y,
  };
}

export const COMMISSION_PRESETS = [
  { label: "15 %", value: 0.15 },
  { label: "16 %", value: 0.16 },
  { label: "17 %", value: 0.17 },
  { label: "18 %", value: 0.18 },
] as const;

export const PRESET_SCENARIOS: { id: string; label: string; patch: Partial<SimulationInputs> }[] =
  [
    {
      id: "base",
      label: "Base prudente",
      patch: { commissionRate: 0.17, gmvScale: 1, fixed: { ...DEFAULT_FIXED } },
    },
    {
      id: "lean",
      label: "Optimista operativo",
      patch: {
        commissionRate: 0.17,
        gmvScale: 1,
        fixed: { ...DEFAULT_FIXED, marketing: 100, reta: 100 },
      },
    },
    {
      id: "rent",
      label: "Con alquiler",
      patch: {
        commissionRate: 0.17,
        gmvScale: 1,
        fixed: { ...DEFAULT_FIXED, rent: 300 },
      },
    },
    {
      id: "c15",
      label: "Comisión 15 %",
      patch: { commissionRate: 0.15, gmvScale: 1, fixed: { ...DEFAULT_FIXED } },
    },
    {
      id: "ads-high",
      label: "Marketing alto",
      patch: {
        commissionRate: 0.17,
        gmvScale: 1,
        fixed: { ...DEFAULT_FIXED, marketing: 450 },
      },
    },
  ];
