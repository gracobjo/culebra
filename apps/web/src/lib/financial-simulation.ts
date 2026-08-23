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
export const INVESTMENT_ELIGIBLE = 30_000;
/** Desglose canónico (Plan Viabilidad §3.A / memoria §25.2 — contrato menor) */
export const INVESTMENT_BREAKDOWN = [
  { code: "A.I", label: "Desarrollo núcleo marketplace", amount: 14_500 },
  { code: "A.II", label: "Pagos, seguridad y producción", amount: 8_500 },
  { code: "B", label: "Equipamiento informático", amount: 2_000 },
  { code: "C", label: "Red y ciberseguridad", amount: 1_500 },
  { code: "D", label: "Adecuación de espacio", amount: 2_500 },
  { code: "E", label: "Logística ligera y puestos", amount: 1_000 },
] as const;
export const DEVELOPMENT_SERVICE_TOTAL = 23_000; // A.I + A.II
export const DEFAULT_SUBSIDY_MONTH = 12;
export const DEFAULT_LAUNCH_MONTH = 6;
export const PARTNER_NET_REF = CAPITAL_REF - SUBSIDY_REF;

export type CashFlowBucket = {
  label: string;
  concept: string;
  inflows: number;
  outflows: number;
  netMonth: number;
  balanceAccum: number;
};

export type CashFlowAnnualRow = {
  year: number;
  capital: number;
  subsidy: number;
  commissionRevenue: number;
  totalInflows: number;
  investment: number;
  opex: number;
  totalOutflows: number;
  netPeriod: number;
  cashEnd: number;
};

export type CashFlowInputs = {
  subsidyMonth?: number;
  subsidyAmount?: number;
  capital?: number;
  commissionRate?: number;
  gmvScale?: number;
  /** GMV anual explícito [Y1, Y2, Y3] — prioridad sobre gmvScale */
  gmvByYear?: [number, number, number];
  /** Primer mes con ingresos comerciales (base Mes 6) */
  launchMonth?: number;
  fixed?: FixedCostParts;
  y1SaleMonths?: number;
};

export type CashFlowModelResult = {
  y1Buckets: CashFlowBucket[];
  annual: CashFlowAnnualRow[];
  minCashBeforeSubsidy: number;
  minCashOverall: number;
  cashEndY1: number;
  cashEndY2: number;
  cashEndY3: number;
  subsidyMonth: number;
  launchMonth: number;
  monthlyTimeline: { month: number; balance: number; inflows: number; outflows: number }[];
};

export type SubsidyTimingRow = {
  label: string;
  subsidyMonth: number;
  minCashApprox: string;
  minCashComputed: number;
  risk: "Bajo" | "Medio" | "Alto" | "Muy alto" | "Crítico";
  comment: string;
};

export type SubsidyDelayRow = {
  label: string;
  subsidyMonth: number;
  delayVsBase: string;
  minCashApprox: string;
  minCashComputed: number;
  cashEndY1Approx: string;
  cashEndY1Computed: number;
  risk: "Bajo" | "Medio" | "Alto" | "Muy alto" | "Crítico";
  partnerSupport: string;
};

export type CombinedDelayRow = {
  label: string;
  launchMonth: number;
  subsidyMonth: number;
  minCashApprox: string;
  minCashComputed: number;
  evaluation: string;
};

export type GmvDelayRow = {
  label: string;
  gmvY1: number;
  gmvY2: number;
  cashEndY2Approx: string;
  cashEndY2Computed: number;
  comment: string;
};

export type TreasuryRiskRow = {
  situation: string;
  probability: string;
  cashImpact: string;
  mitigationPriority: string;
};

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
        fixed: { ...DEFAULT_FIXED, marketing: 100, reta: 100, cloud: 250, office: 250 },
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

/** Escenario base de referencia (Plan Viabilidad §5.M) */
export const PLAN_BASE_REFERENCE = {
  commissionPct: 17,
  ticketEur: 62,
  fixedMonthly: 1_250,
  gmvY1: 14_000,
  gmvY2: 48_000,
  gmvY3: 75_000,
  netAccum3y: -16_260,
  gmvBreakevenMonthly: 8_065,
} as const;

export type FixedCostSensitivityRow = {
  label: string;
  fixedMonthly: number;
  gmvBreakeven: number;
  ordersPerMonth: number;
  netY2: number;
  netAccum3y: number;
  deltaAccum3yVsBase: number | null;
  note: string;
};

export type MarketingSensitivityRow = {
  marketingMonthly: number;
  fixedMonthly: number;
  netY2: number;
  note: string;
};

export type RetaSensitivityRow = {
  retaMonthly: number;
  impactAnnual: number;
  impactAccum3y: number;
  note: string;
};

export type CombinedScenarioRow = {
  id: string;
  label: string;
  fixedMonthly: number;
  commissionPct: number;
  netAccum3y: number;
  evaluation: string;
};

function fixedFromTotal(target: number, overrides: Partial<FixedCostParts> = {}): FixedCostParts {
  const base = { ...DEFAULT_FIXED, ...overrides };
  const current = sumFixedMonthly(base);
  if (current === target) return base;
  const delta = target - current;
  return { ...base, marketing: Math.max(0, base.marketing + delta) };
}

/** §5.M.1 — Sensibilidad a costes fijos mensuales (resto = base prudente). */
export function sensitivityFixedCosts(): FixedCostSensitivityRow[] {
  const configs: { label: string; fixed: FixedCostParts; note: string }[] = [
    {
      label: "1.000 € (muy contenido)",
      fixed: fixedFromTotal(1_000, { marketing: 100, cloud: 250, office: 250 }),
      note: "Mejora ≈ +7.500 € acum. 3 años",
    },
    {
      label: "1.250 € (base)",
      fixed: { ...DEFAULT_FIXED },
      note: "Referencia del plan",
    },
    {
      label: "1.450 €",
      fixed: { ...DEFAULT_FIXED, marketing: 450 },
      note: "Empeora ≈ −6.000 € acum. 3 años",
    },
    {
      label: "1.650 € (alquiler / más estructura)",
      fixed: { ...DEFAULT_FIXED, rent: 300, marketing: 350 },
      note: "Empeora ≈ −12.000 € acum. 3 años",
    },
  ];

  const baseResult = runSimulation({ ...DEFAULT_SIMULATION, fixed: { ...DEFAULT_FIXED } });

  return configs.map((c) => {
    const r = runSimulation({ ...DEFAULT_SIMULATION, fixed: c.fixed });
    const delta = r.netAccum3y - baseResult.netAccum3y;
    return {
      label: c.label,
      fixedMonthly: r.fixedMonthly,
      gmvBreakeven: r.gmvBreakevenMonthly,
      ordersPerMonth: r.ordersBreakevenMonthly,
      netY2: r.years[1]!.net,
      netAccum3y: r.netAccum3y,
      deltaAccum3yVsBase: c.label.includes("base") ? null : delta,
      note: c.note,
    };
  });
}

/** §5.M.2 — Sensibilidad al gasto de marketing. */
export function sensitivityMarketing(): MarketingSensitivityRow[] {
  const levels: { m: number; note: string }[] = [
    { m: 100, note: "Solo mantenimiento mínimo" },
    { m: 250, note: "Equilibrio razonable (base)" },
    { m: 400, note: "Necesita mejor conversión" },
    { m: 600, note: "Solo justificable con tracción clara" },
  ];

  return levels.map(({ m, note }) => {
    const r = runSimulation({
      ...DEFAULT_SIMULATION,
      fixed: { ...DEFAULT_FIXED, marketing: m },
    });
    return {
      marketingMonthly: m,
      fixedMonthly: r.fixedMonthly,
      netY2: r.years[1]!.net,
      note,
    };
  });
}

/** §5.M.3 — Sensibilidad al coste neto mensual del RETA (Socio 2). */
export function sensitivityReta(): RetaSensitivityRow[] {
  const levels: { r: number; note: string }[] = [
    { r: 100, note: "Escenario favorable (buena ayuda al autoempleo)" },
    { r: 200, note: "Referencia actual" },
    { r: 300, note: "Empeora de forma relevante" },
  ];

  return levels.map(({ r, note }) => ({
    retaMonthly: r,
    impactAnnual: -r * 12,
    impactAccum3y: -(r * 12 * 2 + r * 6), // Y1 6 meses + Y2–Y3 24 meses
    note,
  }));
}

/** §5.M.4 — Casos combinados prácticos. */
export function sensitivityCombinedScenarios(): CombinedScenarioRow[] {
  const evaluations: Record<string, string> = {
    base: "Referencia",
    lean: "Mucho más manejable",
    rent: "Claramente peor",
    c15: "Peor que el base",
    "ads-high": "Se come parte de la ventaja del 17 %",
  };

  return PRESET_SCENARIOS.map((preset) => {
    const inputs: SimulationInputs = {
      ...DEFAULT_SIMULATION,
      ...preset.patch,
      fixed: preset.patch.fixed ? { ...preset.patch.fixed } : { ...DEFAULT_FIXED },
    };
    const r = runSimulation(inputs);
    return {
      id: preset.id,
      label: preset.label,
      fixedMonthly: r.fixedMonthly,
      commissionPct: Math.round(inputs.commissionRate * 100),
      netAccum3y: r.netAccum3y,
      evaluation: evaluations[preset.id] ?? "—",
    };
  });
}

/** §5.M.5 — Variables ordenadas por impacto (referencia estática del plan). */
export const COST_SENSITIVITY_PRIORITIES = [
  {
    priority: 1,
    variable: "Costes fijos (local, personal, estructura)",
    impact: "Muy alto",
    control: "Alta (comodato vs alquiler, RETA, marketing)",
  },
  {
    priority: 2,
    variable: "Comisión",
    impact: "Alto",
    control: "Alta (decisión: 17 %)",
  },
  {
    priority: 3,
    variable: "Marketing",
    impact: "Medio-alto",
    control: "Alta",
  },
  {
    priority: 4,
    variable: "Coste RETA del Socio 2",
    impact: "Medio",
    control: "Media (depende de ayudas)",
  },
  {
    priority: 5,
    variable: "Ticket medio",
    impact: "Medio",
    control: "Media (mix de productos y cestas)",
  },
] as const;

function simInputsFromCash(p: CashFlowInputs): SimulationInputs {
  return {
    commissionRate: p.commissionRate ?? DEFAULT_SIMULATION.commissionRate,
    ticketEur: DEFAULT_SIMULATION.ticketEur,
    gmvScale: p.gmvScale ?? 1,
    fixed: p.fixed ? { ...p.fixed } : { ...DEFAULT_FIXED },
    y1SaleMonths: p.y1SaleMonths ?? DEFAULT_SIMULATION.y1SaleMonths,
  };
}

/**
 * Modelo de tesorería prudente (Plan §caja / §retrasos): capital Mes 0, inversión Mes 1-6,
 * operativa desde Mes 7, lanzamiento comercial configurable, subvención configurable.
 */
export function runCashFlowModel(params: CashFlowInputs = {}): CashFlowModelResult {
  const capital = params.capital ?? CAPITAL_REF;
  const subsidyAmount = params.subsidyAmount ?? SUBSIDY_REF;
  const subsidyMonth = params.subsidyMonth ?? DEFAULT_SUBSIDY_MONTH;
  const launchMonth = Math.min(12, Math.max(5, params.launchMonth ?? DEFAULT_LAUNCH_MONTH));
  const commissionRate = params.commissionRate ?? DEFAULT_SIMULATION.commissionRate;
  const gmvScale = params.gmvScale ?? 1;

  const sim = runSimulation(simInputsFromCash(params));
  const gmvY1 = params.gmvByYear?.[0] ?? Math.round(BASE_GMV_BY_YEAR[0] * gmvScale);
  const gmvY2 = params.gmvByYear?.[1] ?? Math.round(BASE_GMV_BY_YEAR[1] * gmvScale);
  const gmvY3 = params.gmvByYear?.[2] ?? Math.round(BASE_GMV_BY_YEAR[2] * gmvScale);

  const y1Commission = gmvY1 * commissionRate;
  const y2Commission = gmvY2 * commissionRate;
  const y3Commission = gmvY3 * commissionRate;

  const y1Opex = sim.years[0]!.opex;
  const y2Opex = sim.years[1]!.opex;
  const y3Opex = sim.years[2]!.opex;
  const opexPerMonthY1 = y1Opex / Math.max(1, 13 - 7);

  const monthIn = Array<number>(25).fill(0);
  const monthOut = Array<number>(25).fill(0);

  monthIn[0] = capital;
  monthOut[1] = 4_000;
  monthOut[2] = 4_000;
  monthOut[3] = 6_000;
  monthOut[4] = 6_000;
  monthOut[5] = 5_750;
  monthOut[6] = 5_750;

  const revenueMonths = Math.max(1, 13 - launchMonth);
  const monthlyRevY1 = y1Commission / revenueMonths;
  for (let m = launchMonth; m <= 12; m++) {
    monthIn[m] += monthlyRevY1;
  }

  for (let m = 7; m <= 12; m++) {
    monthOut[m] += opexPerMonthY1;
  }

  if (subsidyAmount > 0 && subsidyMonth >= 1 && subsidyMonth <= 24) {
    monthIn[subsidyMonth] += subsidyAmount;
  }

  const y2MonthlyNet = (y2Commission - y2Opex) / 12;
  const y3MonthlyNet = (y3Commission - y3Opex) / 12;
  for (let m = 13; m <= 18; m++) {
    if (y2MonthlyNet >= 0) monthIn[m] = y2MonthlyNet;
    else monthOut[m] = -y2MonthlyNet;
  }
  for (let m = 19; m <= 24; m++) {
    if (y3MonthlyNet >= 0) monthIn[m] = y3MonthlyNet;
    else monthOut[m] = -y3MonthlyNet;
  }

  const monthlyTimeline: CashFlowModelResult["monthlyTimeline"] = [];
  let balance = 0;
  let minCashBeforeSubsidy = Infinity;
  let minCashOverall = Infinity;
  let cashEndY1 = 0;
  let cashEndY2 = 0;

  for (let m = 0; m <= 24; m++) {
    balance += monthIn[m]! - monthOut[m]!;
    monthlyTimeline.push({
      month: m,
      balance: Math.round(balance),
      inflows: monthIn[m]!,
      outflows: monthOut[m]!,
    });
    minCashOverall = Math.min(minCashOverall, balance);
    if (subsidyAmount > 0 && m < subsidyMonth) {
      minCashBeforeSubsidy = Math.min(minCashBeforeSubsidy, balance);
    }
    if (m === 12) cashEndY1 = Math.round(balance);
    if (m === 18) cashEndY2 = Math.round(balance);
  }

  if (subsidyAmount === 0 || !Number.isFinite(minCashBeforeSubsidy)) {
    minCashBeforeSubsidy = minCashOverall;
  }

  const bucketRanges: { label: string; from: number; to: number; concept: string }[] = [
    { label: "Mes 0", from: 0, to: 0, concept: "Desembolso capital social" },
    { label: "Mes 1-2", from: 1, to: 2, concept: "Constitución + inicio inversión" },
    { label: "Mes 3-4", from: 3, to: 4, concept: "Desarrollo + equipamiento + obras" },
    {
      label: "Mes 5-6",
      from: 5,
      to: 6,
      concept:
        launchMonth <= 6
          ? "Final inversión + lanzamiento"
          : "Final inversión (lanzamiento retrasado)",
    },
    {
      label: "Mes 7-9",
      from: 7,
      to: 9,
      concept:
        launchMonth > 6 && launchMonth <= 9
          ? "Opex + inicio ventas (retraso)"
          : "Operativa (GMV bajo)",
    },
    {
      label: "Mes 10-12",
      from: 10,
      to: 12,
      concept:
        subsidyMonth >= 10 && subsidyMonth <= 12
          ? `Operativa + subvención (Mes ${subsidyMonth})`
          : subsidyMonth > 12
            ? "Operativa (subvención pendiente)"
            : "Operativa",
    },
  ];

  const y1Buckets: CashFlowBucket[] = bucketRanges.map((range) => {
    let inflows = 0;
    let outflows = 0;
    let endBalance = 0;
    for (let m = range.from; m <= range.to; m++) {
      inflows += monthIn[m]!;
      outflows += monthOut[m]!;
      endBalance = monthlyTimeline[m]!.balance;
    }
    return {
      label: range.label,
      concept: range.concept,
      inflows: Math.round(inflows),
      outflows: Math.round(outflows),
      netMonth: Math.round(inflows - outflows),
      balanceAccum: endBalance,
    };
  });

  let cash = 0;
  const annual: CashFlowAnnualRow[] = [];

  const y1SubsidyInYear = subsidyMonth >= 1 && subsidyMonth <= 12 ? subsidyAmount : 0;
  const y1Row: CashFlowAnnualRow = {
    year: 1,
    capital,
    subsidy: y1SubsidyInYear,
    commissionRevenue: y1Commission,
    totalInflows: capital + y1SubsidyInYear + y1Commission,
    investment: INVESTMENT_ELIGIBLE,
    opex: y1Opex,
    totalOutflows: INVESTMENT_ELIGIBLE + y1Opex,
    netPeriod: 0,
    cashEnd: 0,
  };
  y1Row.netPeriod = y1Row.totalInflows - y1Row.totalOutflows;
  cash += y1Row.netPeriod;
  y1Row.cashEnd = cashEndY1;
  annual.push(y1Row);

  for (const [year, commission, opex, endBal] of [
    [2, y2Commission, y2Opex, cashEndY2],
    [3, y3Commission, y3Opex, monthlyTimeline[24]!.balance],
  ] as const) {
    const subsidy =
      year === 2 && subsidyMonth > 12 && subsidyMonth <= 18
        ? subsidyAmount
        : year === 3 && subsidyMonth > 18 && subsidyMonth <= 24
          ? subsidyAmount
          : 0;
    const row: CashFlowAnnualRow = {
      year,
      capital: 0,
      subsidy,
      commissionRevenue: commission,
      totalInflows: commission + subsidy,
      investment: 0,
      opex,
      totalOutflows: opex,
      netPeriod: commission + subsidy - opex,
      cashEnd: endBal,
    };
    annual.push(row);
  }

  return {
    y1Buckets,
    annual,
    minCashBeforeSubsidy: Math.round(minCashBeforeSubsidy),
    minCashOverall: Math.round(minCashOverall),
    cashEndY1,
    cashEndY2,
    cashEndY3: annual[2]!.cashEnd,
    subsidyMonth,
    launchMonth,
    monthlyTimeline,
  };
}

/** Sensibilidad al momento de cobro de la subvención (§caja). */
export function sensitivitySubsidyTiming(base: CashFlowInputs = {}): SubsidyTimingRow[] {
  return sensitivitySubsidyDelay(base).map((row) => ({
    label: row.label,
    subsidyMonth: row.subsidyMonth,
    minCashApprox: row.minCashApprox,
    minCashComputed: row.minCashComputed,
    risk: row.risk,
    comment: row.partnerSupport === "No" ? "Referencia del plan" : row.partnerSupport,
  }));
}

/** §retrasos — Sensibilidad detallada al retraso en el cobro de la subvención. */
export function sensitivitySubsidyDelay(base: CashFlowInputs = {}): SubsidyDelayRow[] {
  const scenarios: Omit<
    SubsidyDelayRow,
    "minCashComputed" | "cashEndY1Computed"
  >[] = [
    {
      label: "Mes 9-10",
      subsidyMonth: 10,
      delayVsBase: "−2 / −3 meses",
      minCashApprox: "13.000 – 15.000 €",
      cashEndY1Approx: "32.000 – 34.000 €",
      risk: "Bajo",
      partnerSupport: "No",
    },
    {
      label: "Mes 12 (base)",
      subsidyMonth: 12,
      delayVsBase: "0",
      minCashApprox: "8.500 – 9.500 €",
      cashEndY1Approx: "≈ 29.900 €",
      risk: "Medio",
      partnerSupport: "No (justo)",
    },
    {
      label: "Mes 14",
      subsidyMonth: 14,
      delayVsBase: "+2 meses",
      minCashApprox: "5.500 – 6.500 €",
      cashEndY1Approx: "27.000 – 28.000 €",
      risk: "Alto",
      partnerSupport: "Recomendable línea de apoyo",
    },
    {
      label: "Mes 16",
      subsidyMonth: 16,
      delayVsBase: "+4 meses",
      minCashApprox: "3.000 – 4.500 €",
      cashEndY1Approx: "25.000 – 26.500 €",
      risk: "Muy alto",
      partnerSupport: "Probable aportación o préstamo",
    },
    {
      label: "Mes 18 o más",
      subsidyMonth: 18,
      delayVsBase: "+6 meses o más",
      minCashApprox: "< 2.500 €",
      cashEndY1Approx: "< 25.000 €",
      risk: "Crítico",
      partnerSupport: "Casi seguro hace falta apoyo",
    },
    {
      label: "Sin subvención / −50 %",
      subsidyMonth: 99,
      delayVsBase: "—",
      minCashApprox: "Puede bajar de 2.000 €",
      cashEndY1Approx: "15.000 – 18.000 €",
      risk: "Crítico",
      partnerSupport: "Sí",
    },
  ];

  return scenarios.map((s) => {
    const model = runCashFlowModel({
      ...base,
      launchMonth: base.launchMonth ?? DEFAULT_LAUNCH_MONTH,
      subsidyMonth: s.subsidyMonth === 99 ? 99 : s.subsidyMonth,
      subsidyAmount: s.subsidyMonth === 99 ? 0 : undefined,
    });
    return {
      ...s,
      minCashComputed: model.minCashOverall,
      cashEndY1Computed: model.cashEndY1,
    };
  });
}

/** §retrasos — Subvención + retraso de lanzamiento comercial. */
export function sensitivityCombinedDelays(base: CashFlowInputs = {}): CombinedDelayRow[] {
  const scenarios: (CombinedDelayRow & {
    patch: CashFlowInputs;
  })[] = [
    {
      label: "Favorable",
      launchMonth: 6,
      subsidyMonth: 10,
      minCashApprox: "14.000 – 16.000 €",
      minCashComputed: 0,
      evaluation: "Cómodo",
      patch: { launchMonth: 6, subsidyMonth: 10 },
    },
    {
      label: "Base",
      launchMonth: 6,
      subsidyMonth: 12,
      minCashApprox: "8.500 – 9.500 €",
      minCashComputed: 0,
      evaluation: "Aceptable",
      patch: { launchMonth: 6, subsidyMonth: 12 },
    },
    {
      label: "Retraso moderado",
      launchMonth: 8,
      subsidyMonth: 14,
      minCashApprox: "4.500 – 6.000 €",
      minCashComputed: 0,
      evaluation: "Tenso",
      patch: { launchMonth: 8, subsidyMonth: 14 },
    },
    {
      label: "Retraso fuerte",
      launchMonth: 9,
      subsidyMonth: 16,
      minCashApprox: "2.000 – 3.500 €",
      minCashComputed: 0,
      evaluation: "Alto riesgo",
      patch: { launchMonth: 9, subsidyMonth: 16 },
    },
    {
      label: "Doble retraso + ventas flojas",
      launchMonth: 8,
      subsidyMonth: 16,
      minCashApprox: "< 2.000 €",
      minCashComputed: 0,
      evaluation: "Crítico",
      patch: {
        launchMonth: 8,
        subsidyMonth: 16,
        gmvByYear: [
          Math.round(BASE_GMV_BY_YEAR[0] * 0.8),
          Math.round(BASE_GMV_BY_YEAR[1] * 0.8),
          Math.round(BASE_GMV_BY_YEAR[2] * 0.8),
        ],
      },
    },
  ];

  return scenarios.map(({ patch, ...row }) => ({
    ...row,
    minCashComputed: runCashFlowModel({ ...base, ...patch }).minCashOverall,
  }));
}

/** §retrasos — Sensibilidad al GMV (subvención en Mes 12, lanzamiento Mes 6). */
export function sensitivityGmvDelay(base: CashFlowInputs = {}): GmvDelayRow[] {
  const scenarios: (Omit<GmvDelayRow, "cashEndY2Computed"> & {
    patch: CashFlowInputs;
  })[] = [
    {
      label: "Base prudente",
      gmvY1: 14_000,
      gmvY2: 48_000,
      cashEndY2Approx: "≈ 21.500 €",
      comment: "Referencia",
      patch: { gmvByYear: [14_000, 48_000, 75_000] },
    },
    {
      label: "−20 % sobre base",
      gmvY1: 11_200,
      gmvY2: 38_400,
      cashEndY2Approx: "≈ 18.000 – 19.000 €",
      comment: "Todavía manejable",
      patch: { gmvByYear: [11_200, 38_400, 60_000] },
    },
    {
      label: "−40 % sobre base",
      gmvY1: 8_400,
      gmvY2: 28_800,
      cashEndY2Approx: "≈ 14.000 – 15.500 €",
      comment: "Caja más justa",
      patch: { gmvByYear: [8_400, 28_800, 45_000] },
    },
    {
      label: "Ventas casi nulas A1",
      gmvY1: 4_000,
      gmvY2: 30_000,
      cashEndY2Approx: "≈ 12.000 – 13.500 €",
      comment: "Dependencia total de la subvención",
      patch: { gmvByYear: [4_000, 30_000, 75_000] },
    },
  ];

  return scenarios.map(({ patch, ...row }) => ({
    ...row,
    cashEndY2Computed: runCashFlowModel({
      ...base,
      launchMonth: 6,
      subsidyMonth: 12,
      ...patch,
    }).cashEndY2,
  }));
}

/** §retrasos — Mapa de riesgo de tesorería (referencia estática). */
export const TREASURY_RISK_MAP: TreasuryRiskRow[] = [
  {
    situation: "Retraso cobro subvención (2-4 meses)",
    probability: "Media-Alta",
    cashImpact: "Muy alto",
    mitigationPriority: "Máxima",
  },
  {
    situation: "Retraso lanzamiento (1-2 meses)",
    probability: "Media",
    cashImpact: "Medio",
    mitigationPriority: "Alta",
  },
  {
    situation: "GMV significativamente por debajo de lo prudente",
    probability: "Media",
    cashImpact: "Medio",
    mitigationPriority: "Alta",
  },
  {
    situation: "Subvención denegada o muy reducida",
    probability: "Baja-Media",
    cashImpact: "Crítico",
    mitigationPriority: "Máxima (plan B)",
  },
  {
    situation: "Costes fijos más altos de lo previsto",
    probability: "Media",
    cashImpact: "Alto",
    mitigationPriority: "Alta",
  },
];

export const DELAY_MANAGEMENT_TIPS = [
  "Priorizar al máximo la calidad y rapidez de la justificación de la ayuda.",
  "Mantener un colchón mínimo de 7.000–8.000 €.",
  "Preacordar préstamo participativo o aportación de socios si cobro > Mes 14.",
  "No comprometer gastos adicionales hasta confirmar calendario de pago de la ayuda.",
  "Cada mes de retraso en subvención reduce la caja mínima ~1.100–1.300 €.",
] as const;

export const CASH_MANAGEMENT_TIPS = [
  "Mantener un colchón mínimo de 6.000–8.000 € (objetivo retrasos: 7.000–8.000 €).",
  "No repartir dividendos hasta cobrar y justificar la subvención.",
  "Vigilar mensualmente inversión ejecutada y estado del expediente.",
  "Prever apoyo de socios si el cobro se retrasa más allá del Mes 14–15.",
  "Priorizar comodato: el alquiler erosiona el colchón de caja.",
  ...DELAY_MANAGEMENT_TIPS,
] as const;

/** §contingencia — Caja mínima de seguridad (Plan de Contingencia). */
export const CASH_SAFETY_FLOOR = 7_000;

export type CashAlertLevelId = "verde" | "amarillo" | "naranja" | "rojo";

export type CashAlertLevel = {
  id: CashAlertLevelId;
  label: string;
  minExclusive: number;
  maxInclusive: number | null;
  situation: string;
  action: string;
  reviewCadence: string;
};

/** §contingencia — Niveles de alerta de caja. */
export const CASH_ALERT_LEVELS: CashAlertLevel[] = [
  {
    id: "verde",
    label: "Verde",
    minExclusive: 12_000,
    maxInclusive: null,
    situation: "Normal",
    action: "Seguimiento mensual ordinario",
    reviewCadence: "Mensual",
  },
  {
    id: "amarillo",
    label: "Amarillo",
    minExclusive: 8_000,
    maxInclusive: 12_000,
    situation: "Vigilancia",
    action: "Congelar gastos no críticos + seguimiento quincenal",
    reviewCadence: "Quincenal",
  },
  {
    id: "naranja",
    label: "Naranja",
    minExclusive: 5_000,
    maxInclusive: 8_000,
    situation: "Tensión",
    action: "Activar medidas de contención + preparar apoyo de socios",
    reviewCadence: "Semanal",
  },
  {
    id: "rojo",
    label: "Rojo",
    minExclusive: Number.NEGATIVE_INFINITY,
    maxInclusive: 5_000,
    situation: "Crítico",
    action: "Activar plan de apoyo de socios de forma inmediata",
    reviewCadence: "Semanal",
  },
];

export function resolveCashAlertLevel(cash: number): CashAlertLevel {
  if (cash > 12_000) return CASH_ALERT_LEVELS[0]!;
  if (cash >= 8_000) return CASH_ALERT_LEVELS[1]!;
  if (cash >= 5_000) return CASH_ALERT_LEVELS[2]!;
  return CASH_ALERT_LEVELS[3]!;
}

export type ContingencyScenario = {
  id: "A" | "B" | "C";
  title: string;
  trigger: string;
  probability: string;
  impact: string;
  measures: string[];
};

/** §contingencia — Escenarios A/B/C. */
export const CONTINGENCY_SCENARIOS: ContingencyScenario[] = [
  {
    id: "A",
    title: "Retraso moderado de la subvención",
    trigger: "Cobro entre Mes 13 y 15",
    probability: "Media-Alta",
    impact: "Medio-Alto",
    measures: [
      "Congelar todo gasto no estrictamente necesario.",
      "Reducir marketing al mínimo de mantenimiento (100–150 €/mes).",
      "Negociar aplazamiento de pagos no críticos con proveedores.",
      "Informar a los socios del calendario actualizado.",
      "Preparar documentación para aportación o préstamo participativo.",
    ],
  },
  {
    id: "B",
    title: "Retraso importante",
    trigger: "Cobro entre Mes 16 y 18",
    probability: "Media",
    impact: "Alto",
    measures: [
      "Activar de forma inmediata el apoyo de socios.",
      "Reducir costes fijos al mínimo vital (≈ 900–1.000 €/mes si es posible).",
      "Priorizar solo gestoría, cloud esencial, RETA Socio 2 y mantenimiento mínimo.",
      "Suspender temporalmente acciones comerciales de pago.",
      "Comunicación transparente y documentada a todos los socios.",
    ],
  },
  {
    id: "C",
    title: "Retraso grave o reducción importante de la subvención",
    trigger: "Cobro > Mes 18, denegación o recorte fuerte",
    probability: "Baja-Media",
    impact: "Crítico",
    measures: [
      "Convocatoria urgente de Junta / reunión de socios.",
      "Aportación obligatoria o préstamo participativo según Pacto de Socios.",
      "Evaluación de recortes adicionales de actividad.",
      "Análisis de continuidad vs. redimensionamiento del proyecto.",
      "En último extremo, suspensión temporal operativa manteniendo elegibilidad de la ayuda.",
    ],
  },
];

export const PARTNER_SUPPORT_MECHANISMS = [
  {
    name: "Préstamo participativo de socios",
    detail:
      "Importe orientativo 8.000–12.000 €; interés bajo o 0 % los primeros 12 meses; devolución preferente con caja estable > 15.000 € o con cargo a la subvención.",
  },
  {
    name: "Aportación adicional de capital",
    detail:
      "Solo si el préstamo no basta o se prefiere reforzar fondos propios (ampliación).",
  },
  {
    name: "Compromiso de respuesta rápida",
    detail:
      "Decisión y, en su caso, transferencia en máximo 15 días naturales desde nivel Rojo o Naranja avanzado.",
  },
] as const;

export const COST_CONTAINMENT_STEPS = [
  "Reducción de marketing digital al mínimo técnico.",
  "Aplazamiento de cualquier inversión o mejora no crítica.",
  "Negociación de aplazamientos con proveedores y gestoría.",
  "Revisión de suscripciones SaaS (eliminar las no esenciales).",
  "Reducción temporal del retén de mantenimiento técnico (si no pone en riesgo la plataforma).",
  "En último caso, reducir actividad de tienda física si genera más coste que beneficio.",
] as const;

export const CONTINGENCY_GOVERNANCE = {
  treasurer: "Administrador / Socio 1",
  reportItems: [
    "Saldo de caja",
    "Previsión de cobros y pagos a 30/60/90 días",
    "Estado del expediente de justificación de la subvención",
    "Desviaciones respecto al presupuesto",
  ],
} as const;

export const PARTNER_PACT_CLAUSE_SUMMARY =
  "Los socios acuerdan un Plan de Contingencia de Tesorería. Por debajo de 8.000 € el Administrador activa contención; por debajo de 5.000 € o con retraso de subvención > 4 meses se activa apoyo de socios (préstamo participativo o aportación), con respuesta en máximo 15 días naturales.";
