/**
 * Estrategia de alojamientos rurales → captación showroom + marketplace.
 * Primeros 90 días: niveles 1–3; 4–5 solo con confianza.
 */

export const SHOWROOM_COMMISSION_RATE = 0.17;
export const NET_MARGIN_ON_BASKET_GMV = 0.145;

export type LodgingCollabLevel = 1 | 2 | 3 | 4 | 5;

export const COLLABORATION_LEVELS = [
  {
    level: 1 as const,
    name: "Presencia",
    lodgingGives: "Folleto + indicaciones para llegar al showroom",
    weGive: "Material gratis + mención en redes",
    difficulty: "Muy baja",
    inFirst90: true,
  },
  {
    level: 2 as const,
    name: "Recomendación activa",
    lodgingGives: "El dueño recomienda visitaros / comprar cesta",
    weGive: "Detalle para el alojamiento + prioridad en packs",
    difficulty: "Baja",
    inFirst90: true,
  },
  {
    level: 3 as const,
    name: "Cesta de bienvenida",
    lodgingGives: "Ofrecen o regalan Escapada / mini-lote al huésped",
    weGive: "Precio especial + facilidad de reposición",
    difficulty: "Media",
    inFirst90: true,
  },
  {
    level: 4 as const,
    name: "Comisión por venta",
    lodgingGives: "Venden cestas o generan pedidos y cobran un %",
    weGive: "8–12 % de comisión sobre la venta",
    difficulty: "Media",
    inFirst90: false,
  },
  {
    level: 5 as const,
    name: "Pack combinado",
    lodgingGives: "«Noche + cesta de la sierra» (ellos gestionan la reserva)",
    weGive: "Solo servís la cesta",
    difficulty: "Media-Alta",
    inFirst90: false,
  },
] as const;

export const VALUE_PROPS = [
  "Dais a vuestros huéspedes una experiencia local real (no solo dormir).",
  "Os diferenciáis de otros alojamientos de la zona.",
  "No os generamos trabajo extra: os dejamos material y os reponemos.",
  "Podéis ganar un extra vendiendo cestas o recibiendo un detalle por recomendación.",
  "Refuerza el relato de territorio y producto de proximidad.",
] as const;

export const MATERIALS = [
  { item: "Folleto / tarjeta A5 o A6", use: "Foto, dirección, horario y QR" },
  { item: "Tarjeta de visita + QR", use: "Habitaciones o recepción" },
  { item: "Mini-catálogo de cestas", use: "Escapada, Comarca y Sierra con precios" },
  { item: "Cartel / display pequeño", use: "Productos de la sierra – a X minutos" },
  { item: "WhatsApp del showroom", use: "Avisar huéspedes interesados" },
  { item: "Condiciones por escrito", use: "Colaboración simple y clara" },
] as const;

export const PRIORITY_CRITERIA = [
  "Proximidad a Villardeciervos (ideal < 25–30 min).",
  "Buena valoración online (ideal > 4,5).",
  "Público que valora producto local y experiencias.",
  "Dueño o gestor accesible y con ganas de diferenciarse.",
  "Temporada de apertura compatible con la vuestra.",
] as const;

export const CONTACT_PITCH = `Hola, somos Sabores de la Culebra, el marketplace y showroom de productos locales de Villardeciervos.
Queremos proponeros una colaboración sencilla: dejamos material para que vuestros huéspedes puedan conocer y llevarse productos de la sierra (miel, embutidos, quesos, cestas…).
No os genera gestión y refuerza la experiencia local del alojamiento.
¿Os parece si os dejamos información y lo vemos?`;

export const SPRINT_90_PHASES = [
  {
    id: "list",
    days: "1–15",
    action: "Elaborar listado de 15–20 alojamientos prioritarios (cercanía + calidad + reseñas).",
    meta: "Lista cerrada",
  },
  {
    id: "material",
    days: "16–30",
    action: "Visitar o llamar a los 8–10 primeros. Dejar material (Nivel 1).",
    meta: "6–8 con material puesto",
  },
  {
    id: "active",
    days: "31–50",
    action: "Proponer a los más receptivos Nivel 2 y 3 (recomendación + cesta de bienvenida).",
    meta: "3–5 colaboraciones activas",
  },
  {
    id: "sales",
    days: "51–75",
    action: "Activar reposición de cestas y medir resultados.",
    meta: "Primeras ventas vía alojamientos",
  },
  {
    id: "stable",
    days: "76–90",
    action: "Revisar qué funciona, eliminar los que no aportan y ampliar.",
    meta: "5–7 colaboradores estables",
  },
] as const;

export const CONDITIONS_SUMMARY = [
  {
    title: "Nivel 1 y 2",
    points: [
      "Material gratis.",
      "Mención en redes cuando tenga sentido.",
      "Detalle puntual si envían clientes de forma recurrente.",
    ],
  },
  {
    title: "Nivel 3 · Cesta de bienvenida",
    points: [
      "Precio especial (Escapada ~22–24 € vs 29 € PVP).",
      "Ellos deciden si la regalan o la cobran al huésped.",
      "Reposición bajo pedido (WhatsApp).",
      "Pago a 15–30 días o al contado según confianza.",
    ],
  },
  {
    title: "Nivel 4 · Comisión (después del sprint)",
    points: [
      "≈ 10 % de comisión sobre el PVP de la cesta vendida.",
      "Ellos cobran al huésped o generan el pedido; vosotros servís.",
    ],
  },
] as const;

export const TRACKING_METRICS = [
  { id: "withMaterial", label: "Alojamientos con material" },
  { id: "activeRecommend", label: "Alojamientos que recomiendan activamente" },
  { id: "basketsVia", label: "Cestas vendidas / regaladas vía alojamientos" },
  { id: "referredVisits", label: "Visitas al showroom por recomendación" },
  { id: "onlineFromGuests", label: "Pedidos online de huéspedes de esos alojamientos" },
] as const;

export const PRIORITY_SUMMARY = [
  "Listado de alojamientos.",
  "Material sencillo y claro.",
  "Visitas presenciales (mejor que solo WhatsApp).",
  "Empezar por presencia + recomendación.",
  "Pasar a cestas de bienvenida solo con los que respondan bien.",
  "Medir y quedarse solo con los que aportan.",
] as const;

/** Metas de cierre del sprint 90 días */
export const LODGING_90_GOALS = {
  listed: { min: 15, max: 20 },
  withMaterial: { min: 6, max: 8 },
  /** L2 + L3 estables al cierre */
  activeCollab: { min: 5, max: 7 },
  basketsVia: { min: 12, max: 30 },
  referredVisits: { min: 35, max: 80 },
  onlineFromGuests: { min: 12, max: 25 },
} as const;

export type LodgingStrategyInputs = {
  /** Listado prioritario elaborado */
  listed: number;
  /** Nivel 1: con material puesto */
  withMaterial: number;
  /** Nivel 2: recomiendan activamente */
  activeRecommend: number;
  /** Nivel 3: cesta de bienvenida */
  welcomePartners: number;
  /** Nivel 4: comisión (idealmente 0 en primeros 90 días) */
  commissionPartners: number;
  /** Cestas vendidas o regaladas atribuidas a alojamientos (acumulado sprint) */
  basketsVia: number;
  /** De ellas, cuántas van con comisión al alojamiento (L4) */
  basketsOnLodgingCommission: number;
  /** Visitas showroom atribuidas a recomendación de alojamientos */
  referredVisits: number;
  /** Pedidos online de huéspedes */
  onlineFromGuests: number;
  avgBasketPvp: number;
  welcomeSpecialPrice: number;
  /** % de cestas vía L3 a precio especial (resto a PVP) */
  welcomeSharePct: number;
  lodgingCommissionPct: number;
  onlineOrderTicket: number;
  /** Conversión aproximada visita referida → compra showroom */
  referredConversionPct: number;
};

export const DEFAULT_LODGING_STRATEGY: LodgingStrategyInputs = {
  listed: 12,
  withMaterial: 4,
  activeRecommend: 2,
  welcomePartners: 1,
  commissionPartners: 0,
  basketsVia: 6,
  basketsOnLodgingCommission: 0,
  referredVisits: 18,
  onlineFromGuests: 5,
  avgBasketPvp: 35,
  welcomeSpecialPrice: 23,
  welcomeSharePct: 40,
  lodgingCommissionPct: 10,
  onlineOrderTicket: 42,
  referredConversionPct: 35,
};

export type LodgingGoalStatus = {
  targetMin: number;
  targetMax: number;
  value: number;
  ok: boolean;
};

export type LodgingStrategyResult = {
  inputs: LodgingStrategyInputs;
  activeCollab: number;
  stableCollaborators: number;
  /** Compras showroom estimadas desde visitas referidas */
  referredPurchases: number;
  referredGmv: number;
  referredShowroomMargin: number;
  basketsGmv: number;
  basketsCommissionGross: number;
  lodgingCommissionsPaid: number;
  basketsNetMargin: number;
  onlineGmv: number;
  onlineCommission: number;
  channelNetMargin: number;
  goals90: {
    listed: LodgingGoalStatus;
    withMaterial: LodgingGoalStatus;
    activeCollab: LodgingGoalStatus;
    basketsVia: LodgingGoalStatus;
    referredVisits: LodgingGoalStatus;
    onlineFromGuests: LodgingGoalStatus;
  };
  goalsHit: number;
  goalsTotal: number;
  focusLevels: string;
};

function goal(
  value: number,
  min: number,
  max: number,
  mode: "range" | "atLeastMin" = "atLeastMin",
): LodgingGoalStatus {
  const ok =
    mode === "range" ? value >= min && value <= max + 5 : value >= min;
  return { targetMin: min, targetMax: max, value, ok };
}

export function runLodgingStrategy(raw: LodgingStrategyInputs): LodgingStrategyResult {
  const inputs: LodgingStrategyInputs = { ...DEFAULT_LODGING_STRATEGY, ...raw };
  const welcomeShare = Math.min(100, Math.max(0, inputs.welcomeSharePct)) / 100;
  const referredConv = Math.min(100, Math.max(0, inputs.referredConversionPct)) / 100;
  const lodgingComm = Math.min(30, Math.max(0, inputs.lodgingCommissionPct)) / 100;

  const activeCollab = inputs.activeRecommend + inputs.welcomePartners;
  const stableCollaborators = Math.min(
    inputs.withMaterial,
    Math.max(inputs.activeRecommend, inputs.welcomePartners) +
      Math.floor(inputs.withMaterial * 0.35),
  );

  const referredPurchases = Math.round(inputs.referredVisits * referredConv);
  const referredGmv = Math.round(referredPurchases * inputs.avgBasketPvp);
  const referredShowroomMargin = Math.round(referredGmv * NET_MARGIN_ON_BASKET_GMV);

  const welcomeCount = Math.round(inputs.basketsVia * welcomeShare);
  const fullPriceCount = Math.max(0, inputs.basketsVia - welcomeCount);
  const basketsGmv = Math.round(
    welcomeCount * inputs.welcomeSpecialPrice + fullPriceCount * inputs.avgBasketPvp,
  );
  const basketsCommissionGross = Math.round(basketsGmv * SHOWROOM_COMMISSION_RATE);
  const basketsOnComm = Math.min(
    inputs.basketsVia,
    Math.max(0, inputs.basketsOnLodgingCommission),
  );
  const lodgingCommissionsPaid = Math.round(
    basketsOnComm * inputs.avgBasketPvp * lodgingComm,
  );
  const packagingProxy = Math.round(inputs.basketsVia * 2.2);
  const basketsNetMargin = Math.max(
    0,
    basketsCommissionGross - packagingProxy - lodgingCommissionsPaid,
  );

  const onlineGmv = Math.round(inputs.onlineFromGuests * inputs.onlineOrderTicket);
  const onlineCommission = Math.round(onlineGmv * SHOWROOM_COMMISSION_RATE);

  const channelNetMargin = referredShowroomMargin + basketsNetMargin + onlineCommission;

  const goals90 = {
    listed: goal(inputs.listed, LODGING_90_GOALS.listed.min, LODGING_90_GOALS.listed.max),
    withMaterial: goal(
      inputs.withMaterial,
      LODGING_90_GOALS.withMaterial.min,
      LODGING_90_GOALS.withMaterial.max,
    ),
    activeCollab: goal(
      activeCollab,
      LODGING_90_GOALS.activeCollab.min,
      LODGING_90_GOALS.activeCollab.max,
    ),
    basketsVia: goal(
      inputs.basketsVia,
      LODGING_90_GOALS.basketsVia.min,
      LODGING_90_GOALS.basketsVia.max,
    ),
    referredVisits: goal(
      inputs.referredVisits,
      LODGING_90_GOALS.referredVisits.min,
      LODGING_90_GOALS.referredVisits.max,
    ),
    onlineFromGuests: goal(
      inputs.onlineFromGuests,
      LODGING_90_GOALS.onlineFromGuests.min,
      LODGING_90_GOALS.onlineFromGuests.max,
    ),
  };

  const goalsHit = Object.values(goals90).filter((g) => g.ok).length;
  const goalsTotal = Object.keys(goals90).length;

  return {
    inputs,
    activeCollab,
    stableCollaborators,
    referredPurchases,
    referredGmv,
    referredShowroomMargin,
    basketsGmv,
    basketsCommissionGross,
    lodgingCommissionsPaid,
    basketsNetMargin,
    onlineGmv,
    onlineCommission,
    channelNetMargin,
    goals90,
    goalsHit,
    goalsTotal,
    focusLevels: "1 · 2 · 3 (presencia, recomendación, bienvenida)",
  };
}
