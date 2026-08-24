/**
 * Optimización del showroom: motor de margen + plan 90 días.
 * El online prudente no sostiene solo; el showroom debe ser motor de margen y captación.
 */

export const SHOWROOM_COMMISSION_RATE = 0.17;
/** Margen efectivo medio sobre GMV (17 % − packaging y descuentos) */
export const SHOWROOM_NET_MARGIN_ON_GMV = 0.145;

export type ShowroomOptInputs = {
  /** Días de apertura al año (proyección anual) */
  openDays: number;
  visitsPerDay: number;
  conversionPct: number; // 0–100
  avgTicket: number;
  packagingPerSale: number;
  catasAnnual: number;
  contactCapturePct: number; // % de compradores que dejan contacto
  onlineOrdersFromShowroom: number;
  onlineOrderTicket: number;
  /** Días de apertura dentro del sprint (p. ej. 90 días calendario) */
  openDaysInSprint: number;
  horizonDays: number;
};

export const DEFAULT_SHOWROOM_OPT: ShowroomOptInputs = {
  openDays: 115,
  visitsPerDay: 15,
  conversionPct: 35,
  avgTicket: 40,
  packagingPerSale: 2.2,
  catasAnnual: 1_200,
  contactCapturePct: 40,
  onlineOrdersFromShowroom: 80,
  onlineOrderTicket: 42,
  openDaysInSprint: 32,
  horizonDays: 90,
};

/** Escenario base (sin optimizar) vs objetivos anuales */
export const SHOWROOM_YEAR_TARGETS = {
  base: {
    label: "Base (sin optimizar)",
    onlineMargin: 3_900,
    showroomMargin: 2_650,
    fixedCosts: 15_000,
  },
  optimizedY1: {
    label: "Año 1 optimizado",
    openDays: 115,
    visitsPerDay: 15,
    conversionPct: 35,
    avgTicket: 40,
    gmvShowroom: 30_000,
    showroomNetMargin: 8_000,
    onlineMargin: 4_000,
    catas: 1_200,
    fixedCosts: 15_000,
  },
  optimizedY2: {
    label: "Año 2 optimizado",
    openDays: 145,
    visitsPerDay: 21,
    conversionPct: 38,
    avgTicket: 43,
    gmvShowroom: 51_500,
    showroomNetMargin: 15_500,
    onlineMargin: 8_500,
    catas: 2_000,
    fixedCosts: 17_000,
  },
} as const;

export type ShowroomOptResult = {
  inputs: ShowroomOptInputs;
  visitsYear: number;
  purchasesYear: number;
  gmvShowroom: number;
  commissionShowroom: number;
  packagingTotal: number;
  marginSales: number;
  marginCatas: number;
  onlineGmvAttributed: number;
  onlineCommissionAttributed: number;
  netShowroomTotal: number;
  contactsCaptured: number;
  shareOfDualMargin: number;
  openDaysInSprint: number;
  visits90: number;
  purchases90: number;
  basketsProxy90: number;
  gmv90: number;
  netMargin90: number;
  contacts90: number;
  onlineOrders90: number;
  onlineCommission90: number;
  goals90: Showroom90GoalsStatus;
  /** Equilibrio anual: margen showroom + online atrib. − fijos Y1 */
  balanceY1: { totalMargin: number; fixed: number; result: number };
};

export type Showroom90GoalsStatus = {
  netMargin: { targetMin: number; targetMax: number; value: number; ok: boolean };
  avgTicket: { target: number; value: number; ok: boolean };
  conversion: { targetMin: number; targetMax: number; value: number; ok: boolean };
  baskets: { targetMin: number; targetMax: number; value: number; ok: boolean };
  contacts: { target: number; value: number; ok: boolean };
  onlineOrders: { target: number; value: number; ok: boolean };
};

export function runShowroomOptimization(raw: ShowroomOptInputs): ShowroomOptResult {
  const inputs: ShowroomOptInputs = { ...DEFAULT_SHOWROOM_OPT, ...raw };
  const conversion = Math.min(100, Math.max(0, inputs.conversionPct)) / 100;
  const contactRate = Math.min(100, Math.max(0, inputs.contactCapturePct)) / 100;

  const visitsYear = Math.round(inputs.openDays * inputs.visitsPerDay);
  const purchasesYear = Math.round(visitsYear * conversion);
  const gmvShowroom = Math.round(purchasesYear * inputs.avgTicket);
  const commissionShowroom = Math.round(gmvShowroom * SHOWROOM_COMMISSION_RATE);
  const packagingTotal = Math.round(purchasesYear * inputs.packagingPerSale);
  const marginSales = commissionShowroom - packagingTotal;
  const marginCatas = Math.max(0, Math.round(inputs.catasAnnual));
  const netShowroomTotal = marginSales + marginCatas;

  const onlineGmvAttributed = Math.round(
    inputs.onlineOrdersFromShowroom * inputs.onlineOrderTicket,
  );
  const onlineCommissionAttributed = Math.round(
    onlineGmvAttributed * SHOWROOM_COMMISSION_RATE,
  );

  const dual = netShowroomTotal + onlineCommissionAttributed;
  const shareOfDualMargin = dual > 0 ? Math.round((netShowroomTotal / dual) * 1000) / 10 : 100;

  const horizon = Math.min(365, Math.max(30, Math.round(inputs.horizonDays)));
  const openDaysInSprint = Math.min(
    horizon,
    Math.max(1, Math.round(inputs.openDaysInSprint)),
  );

  const visits90 = Math.round(openDaysInSprint * inputs.visitsPerDay);
  const purchases90 = Math.round(visits90 * conversion);
  // Proxy cestas: ~55 % de las compras son cesta (Comarca estrella)
  const basketsProxy90 = Math.round(purchases90 * 0.55);
  const gmv90 = Math.round(purchases90 * inputs.avgTicket);
  const commission90 = Math.round(gmv90 * SHOWROOM_COMMISSION_RATE);
  const packaging90 = Math.round(purchases90 * inputs.packagingPerSale);
  const catas90 = Math.round(marginCatas * (horizon / 365));
  const netMargin90 = commission90 - packaging90 + catas90;
  const contacts90 = Math.round(purchases90 * contactRate);
  const onlineOrders90 = Math.round(
    inputs.onlineOrdersFromShowroom * (openDaysInSprint / Math.max(1, inputs.openDays)),
  );
  const onlineCommission90 = Math.round(
    onlineOrders90 * inputs.onlineOrderTicket * SHOWROOM_COMMISSION_RATE,
  );

  const fixedY1 = SHOWROOM_YEAR_TARGETS.base.fixedCosts;
  const totalMarginY1 = netShowroomTotal + onlineCommissionAttributed;
  const balanceY1 = {
    totalMargin: totalMarginY1,
    fixed: fixedY1,
    result: totalMarginY1 - fixedY1,
  };

  const goals90: Showroom90GoalsStatus = {
    netMargin: {
      targetMin: 1_800,
      targetMax: 2_400,
      value: netMargin90,
      ok: netMargin90 >= 1_800,
    },
    avgTicket: {
      target: 38,
      value: inputs.avgTicket,
      ok: inputs.avgTicket >= 38,
    },
    conversion: {
      targetMin: 30,
      targetMax: 35,
      value: inputs.conversionPct,
      ok: inputs.conversionPct >= 30,
    },
    baskets: {
      targetMin: 90,
      targetMax: 120,
      value: basketsProxy90,
      ok: basketsProxy90 >= 90,
    },
    contacts: {
      target: 120,
      value: contacts90,
      ok: contacts90 >= 120,
    },
    onlineOrders: {
      target: 25,
      value: onlineOrders90,
      ok: onlineOrders90 >= 25,
    },
  };

  return {
    inputs: { ...inputs, openDaysInSprint, horizonDays: horizon },
    visitsYear,
    purchasesYear,
    gmvShowroom,
    commissionShowroom,
    packagingTotal,
    marginSales,
    marginCatas,
    onlineGmvAttributed,
    onlineCommissionAttributed,
    netShowroomTotal,
    contactsCaptured: Math.round(purchasesYear * contactRate),
    shareOfDualMargin,
    openDaysInSprint,
    visits90,
    purchases90,
    basketsProxy90,
    gmv90,
    netMargin90,
    contacts90,
    onlineOrders90,
    onlineCommission90,
    goals90,
    balanceY1,
  };
}

export const SHOWROOM_LEVERS = [
  {
    id: "ticket",
    title: "A. Subir ticket medio",
    meta: "≥ 38–42 €",
    actions: [
      "Empujar Cesta Comarca (45 €) como estrella",
      "8–12 cestas montadas siempre visibles",
      "Oferta en caja: miel / embutido suelto (+8–15 €)",
      "Pack «cesta + envío a un familiar»",
    ],
  },
  {
    id: "conversion",
    title: "B. Subir conversión visita → compra",
    meta: "≥ 35 %",
    actions: [
      "Degustación sistemática (mini) a quien entra",
      "Script 30 s: ¿llevas un sabor o te lo enviamos?",
      "Cestas ya montadas (no componer)",
      "Precio muy visible",
    ],
  },
  {
    id: "traffic",
    title: "C. Tráfico cualificado",
    meta: "Temporada + alojamientos",
    actions: [
      "Verano, berrea, puentes, Navidad (máxima)",
      "Folletos en alojamientos rurales + derivación",
      "Eventos locales y mercados",
      "Redes «estamos abiertos» + señalética",
    ],
  },
  {
    id: "capture",
    title: "D. Captación para online",
    meta: "≥ 40 % dejan contacto",
    actions: [
      "QR/tablet: avisos de lotes y novedades",
      "WhatsApp directo",
      "Email/teléfono en el detalle de compra",
      "≥ 1 comunicación posterior a cada contacto",
    ],
  },
  {
    id: "extra",
    title: "E. Ingresos extra de bajo coste",
    meta: "Margen directo",
    actions: [
      "Mini-cata 6–8 € (fines de semana)",
      "Cata completa 15–18 € (2–4×/mes temporada)",
      "Taller ligero 20–25 € (1×/mes)",
      "Lotes temporada 55–89 € (campañas)",
    ],
  },
] as const;

export type SprintPhase = {
  id: string;
  title: string;
  days: string;
  focus: string;
  weeks: Array<{ week: string; actions: string }>;
  goals: string[];
};

export const SPRINT_90_PHASES: SprintPhase[] = [
  {
    id: "f1",
    title: "Fase 1 · Poner a punto y vender lo básico",
    days: "Días 1–30",
    focus: "Que el espacio funcione y empiece a cobrar",
    weeks: [
      {
        week: "Semana 1",
        actions:
          "Montar distribución definitiva (escaparate, estantería, isla cestas, caja, trastienda). Precios visibles. 8–10 cestas montadas (Escapada + Comarca).",
      },
      {
        week: "Semana 2",
        actions:
          "Script de atención 30–40 s. Degustación mínima (miel o embutido). QR/tablet de captación.",
      },
      {
        week: "Semana 3",
        actions:
          "Apertura regular (fines de semana + días con tráfico). Medir visitas y conversión cada día. Ajustar colocación de cestas.",
      },
      {
        week: "Semana 4",
        actions:
          "Revisar qué rota. Reponer solo lo que vende. Feedback rápido («¿Qué echas de menos?»).",
      },
    ],
    goals: [
      "25–35 cestas vendidas",
      "Ticket medio ≥ 35 €",
      "Captación de contactos funcionando",
      "Socio 2 cómodo con el flujo",
    ],
  },
  {
    id: "f2",
    title: "Fase 2 · Subir conversión y ticket",
    days: "Días 31–60",
    focus: "Que cada visita valga más",
    weeks: [
      {
        week: "Semana 5",
        actions:
          "Cesta Comarca (45 €) como «la recomendada». Oferta en caja: miel o embutido suelto.",
      },
      {
        week: "Semana 6",
        actions:
          "Mini-cata de pago (6–8 €) o condicionada a compra. Concentrar en 2 horarios de más afluencia.",
      },
      {
        week: "Semana 7",
        actions:
          "Material en 4–6 alojamientos rurales. Acordar detalle o comisión por derivación.",
      },
      {
        week: "Semana 8",
        actions:
          "Primera cata completa o taller (15–18 €). Medir asistencia y venta posterior. Revisar stock mínimo.",
      },
    ],
    goals: [
      "Ticket medio ≥ 38 €",
      "Conversión ≥ 32 %",
      "35–45 cestas en el periodo",
      "40–50 contactos nuevos de calidad",
      "≥ 1 alianza con alojamientos activa",
    ],
  },
  {
    id: "f3",
    title: "Fase 3 · Escalar y conectar con el online",
    days: "Días 61–90",
    focus: "Más tráfico + recurrencia + margen",
    weeks: [
      {
        week: "Semana 9",
        actions:
          "Campaña de temporada o «Lote de la sierra». Empujar Cesta Sierra (65 €) y packs regalo.",
      },
      {
        week: "Semana 10",
        actions:
          "Secuencia WhatsApp/email a contactos. Medir pedidos online que vienen del showroom.",
      },
      {
        week: "Semana 11",
        actions:
          "Segunda experiencia (cata/taller). Optimizar presentación. Revisar márgenes reales por cesta.",
      },
      {
        week: "Semana 12",
        actions:
          "Cierre de trimestre: números, qué se mantiene, qué se elimina, qué se potencia los siguientes 90 días.",
      },
    ],
    goals: [
      "90–120 cestas acumuladas en 90 días",
      "Margen neto acumulado 1.800–2.400 €",
      "≥ 120 contactos captados",
      "≥ 25 pedidos online atribuibles",
      "Proceso de atención y montaje rodado",
    ],
  },
] as const;

export const SPRINT_90_GOALS = [
  { id: "margin", label: "Margen neto showroom + cestas + catas", target: "1.800–2.400 €" },
  { id: "ticket", label: "Ticket medio", target: "≥ 38 €" },
  { id: "conversion", label: "Conversión visita → compra", target: "≥ 30–35 %" },
  { id: "baskets", label: "Cestas vendidas", target: "90–120" },
  { id: "contacts", label: "Contactos captados", target: "≥ 120" },
  { id: "online", label: "Pedidos online desde showroom", target: "≥ 25" },
] as const;

export const WEEKLY_RITUALS = [
  { when: "Lunes o martes", action: "Revisar ventas de la semana anterior y reponer cestas" },
  { when: "Antes de abrir", action: "Montar/reponer isla de cestas y degustación" },
  { when: "Cada día de apertura", action: "Anotar visitas, compras y contactos captados" },
  { when: "Domingo noche o lunes", action: "Foto de la semana + nota de lo que ha funcionado" },
] as const;

export const BIWEEKLY_KPIS = [
  "Nº de visitas",
  "% de conversión",
  "Ticket medio",
  "Cestas vendidas por tipo",
  "Contactos nuevos",
  "Pedidos online que vienen del showroom",
  "Margen neto acumulado",
] as const;

export const SPRINT_MINIMUM_RESOURCES = [
  "8–12 cestas siempre montadas",
  "Material de degustación sencillo",
  "QR o tablet de captación",
  "Script de atención escrito y ensayado",
  "Hoja de registro diario (visitas / ventas / contactos)",
  "Relación con 4–6 alojamientos",
] as const;

export const OPTIMIZATION_PRIORITIES = [
  "Cestas siempre montadas y visibles (Comarca como estrella)",
  "Script de atención + degustación en cada visita",
  "Captación de contacto obligatoria",
  "Horario inteligente: concentrar apertura en tráfico real",
  "Alianzas con alojamientos de la zona",
  "Catas y talleres solo cuando haya flujo",
] as const;

export function modelBalance(showroomNet: number, onlineNet: number, fixed: number) {
  const total = showroomNet + onlineNet;
  return {
    total,
    result: total - fixed,
    showroomShare: total > 0 ? Math.round((showroomNet / total) * 1000) / 10 : 0,
  };
}
