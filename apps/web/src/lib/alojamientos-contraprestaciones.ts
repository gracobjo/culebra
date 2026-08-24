/**
 * Qué perciben los alojamientos por la promoción — claro, justo y sin comerse el margen.
 */

export const ESCAPADA_PVP = 29;
export const ESCAPADA_SPECIAL = 23;
export const COMISSION_RATE_LODGING = 0.1;
export const SHOWROOM_COMMISSION_RATE = 0.17;

export const COMPENSATION_BY_LEVEL = [
  {
    level: 1,
    name: "Presencia",
    lodgingDoes: "Tiene folletos / tarjetas y da indicaciones si le preguntan",
    receives: "Material gratis + mención ocasional en vuestras redes",
    ourCost: "Muy bajo",
    priority90: "Alta",
  },
  {
    level: 2,
    name: "Recomendación activa",
    lodgingDoes: "Recomienda visitar el showroom o comprar cestas",
    receives:
      "Detalle periódico (cesta o lote pequeño cada X clientes enviados) + prioridad en novedades",
    ourCost: "Bajo (1 Escapada cada 8–10 referidos)",
    priority90: "Alta",
  },
  {
    level: 3,
    name: "Cesta de bienvenida",
    lodgingDoes: "Ofrece o regala una cesta a sus huéspedes",
    receives: "Precio especial (margen propio) o facilidad de reposición",
    ourCost: "Medio (descuento vs PVP; comisión sobre precio especial)",
    priority90: "Alta",
  },
  {
    level: 4,
    name: "Venta con comisión",
    lodgingDoes: "Vende cestas o genera el pedido",
    receives: "Comisión 10 % sobre el PVP de la cesta",
    ourCost: "Medio (10 % del PVP sale del margen de la S.L.)",
    priority90: "Media (cuando fluye)",
  },
  {
    level: 5,
    name: "Pack noche + cesta",
    lodgingDoes: "Incluye la cesta en su oferta",
    receives: "Precio especial de la cesta + diferenciación del alojamiento",
    ourCost: "Similar a bienvenida",
    priority90: "Baja al inicio",
  },
] as const;

export const START_PRIORITIES = [
  {
    priority: "Alta",
    offer: "Precio especial en cestas de bienvenida (22–24 € la Escapada)",
    why: "Es lo que más valoran y más fácil de activar",
  },
  {
    priority: "Alta",
    offer: "Material gratis + recomendación",
    why: "Barrera de entrada cero",
  },
  {
    priority: "Media",
    offer: "Detalle de agradecimiento por volumen de clientes enviados",
    why: "Genera reciprocidad",
  },
  {
    priority: "Media",
    offer: "Comisión 10 % cuando empiecen a vender",
    why: "Solo cuando ya fluya",
  },
  {
    priority: "Baja al inicio",
    offer: "Packs complejos",
    why: "Dejarlo para más adelante",
  },
] as const;

export const CLEAR_PITCH = `Por recomendar el showroom y tener material, os dejamos todo gratis y os hacemos un detalle de agradecimiento.
Si queréis ofrecer una cesta de bienvenida a vuestros huéspedes, os la dejamos a precio especial (22–24 € la de 29 €) para que podáis regalarla o venderla con margen.
Si preferís vender y cobrar comisión, os damos un 10 % de cada cesta.`;

export const WHAT_THEY_GET = [
  "Diferenciación de su alojamiento (experiencia local).",
  "Material gratis.",
  "Precio especial en cestas (margen o regalo a huéspedes).",
  "Comisión del 10 % si venden.",
  "Detalle de agradecimiento por enviaros clientes.",
  "Visibilidad en vuestras redes.",
] as const;

export const BASKET_COMMISSION_EXAMPLES = [
  { name: "Cesta Escapada", pvp: 29, lodgingEarns: 2.9 },
  { name: "Cesta Comarca", pvp: 45, lodgingEarns: 4.5 },
  { name: "Cesta Sierra", pvp: 65, lodgingEarns: 6.5 },
] as const;

export type CompensationSimInputs = {
  referredClients: number;
  referralThreshold: number;
  welcomeBaskets: number;
  welcomeSpecialPrice: number;
  commissionBaskets: number;
  avgCommissionBasketPvp: number;
  materialCost: number;
};

export const DEFAULT_COMPENSATION_SIM: CompensationSimInputs = {
  referredClients: 24,
  referralThreshold: 8,
  welcomeBaskets: 10,
  welcomeSpecialPrice: ESCAPADA_SPECIAL,
  commissionBaskets: 6,
  avgCommissionBasketPvp: 45,
  materialCost: 25,
};

export type CompensationSimResult = {
  thankYouGiftsDue: number;
  thankYouCostAtPvp: number;
  welcomeDiscountGiven: number;
  ourCommissionOnWelcome: number;
  lodgingCommissionPaid: number;
  ourCommissionOnCommissionSales: number;
  netMarginAfterLodging: number;
  lodgingPerceivedValue: number;
};

/** Estima coste/margen nuestro vs valor percibido por el alojamiento. */
export function runCompensationSim(raw: CompensationSimInputs): CompensationSimResult {
  const inputs = { ...DEFAULT_COMPENSATION_SIM, ...raw };
  const threshold = Math.max(1, inputs.referralThreshold);
  const thankYouGiftsDue = Math.floor(inputs.referredClients / threshold);
  const thankYouCostAtPvp = thankYouGiftsDue * ESCAPADA_PVP;

  const welcomeDiscountGiven =
    inputs.welcomeBaskets * Math.max(0, ESCAPADA_PVP - inputs.welcomeSpecialPrice);
  const ourCommissionOnWelcome = Math.round(
    inputs.welcomeBaskets * inputs.welcomeSpecialPrice * SHOWROOM_COMMISSION_RATE * 100,
  ) / 100;

  const lodgingCommissionPaid =
    Math.round(inputs.commissionBaskets * inputs.avgCommissionBasketPvp * COMISSION_RATE_LODGING * 100) /
    100;
  const commissionGmv = inputs.commissionBaskets * inputs.avgCommissionBasketPvp;
  const ourCommissionOnCommissionSales =
    Math.round(commissionGmv * SHOWROOM_COMMISSION_RATE * 100) / 100;

  const netMarginAfterLodging =
    Math.round(
      (ourCommissionOnWelcome + ourCommissionOnCommissionSales - lodgingCommissionPaid - inputs.materialCost) *
        100,
    ) / 100;

  const lodgingPerceivedValue =
    Math.round(
      (inputs.materialCost +
        thankYouCostAtPvp +
        welcomeDiscountGiven +
        lodgingCommissionPaid) *
        100,
    ) / 100;

  return {
    thankYouGiftsDue,
    thankYouCostAtPvp,
    welcomeDiscountGiven,
    ourCommissionOnWelcome,
    lodgingCommissionPaid,
    ourCommissionOnCommissionSales,
    netMarginAfterLodging,
    lodgingPerceivedValue,
  };
}

export const AGREEMENT_MODALITIES = [
  {
    id: "PRESENCE_RECOMMEND" as const,
    title: "Presencia y recomendación",
    body: `Os dejamos material gratuito (folletos, tarjetas y QR).
Vosotros lo tenéis visible y recomendáis la visita al showroom o la compra de productos/cestas cuando encaje.
A cambio: material gratis + detalle de agradecimiento según volumen de clientes enviados + mención ocasional en nuestras redes.`,
  },
  {
    id: "WELCOME_BASKET" as const,
    title: "Cesta de bienvenida",
    body: `Podéis ofrecer o regalar una cesta de productos locales a vuestros huéspedes.
Precio especial para el alojamiento:
Cesta Escapada (PVP ${ESCAPADA_PVP} €) → ${ESCAPADA_SPECIAL} €
Otras cestas: precio especial bajo consulta.
Vosotros decidís si la regaláis o la cobráis al huésped.
Reposición bajo pedido (WhatsApp).`,
  },
  {
    id: "COMMISSION_SALE" as const,
    title: "Venta con comisión",
    body: `Vendéis cestas directamente a vuestros huéspedes o generáis el pedido.
Comisión para el alojamiento: 10 % sobre el PVP de la cesta.
Ejemplo:
Cesta Comarca (45 €) → comisión 4,50 €
Cesta Sierra (65 €) → comisión 6,50 €`,
  },
  {
    id: "NIGHT_PACK" as const,
    title: "Pack «Noche + cesta» (opcional)",
    body: `Podéis incluir una cesta en vuestra oferta de estancia.
Os aplicamos precio especial de la cesta.
La reserva del alojamiento la gestionáis vosotros; nosotros solo preparamos y entregamos la cesta.`,
  },
] as const;

export const AGREEMENT_GENERAL_CONDITIONS = [
  "La colaboración no es exclusiva.",
  "El material promocional es gratuito.",
  "Los pedidos y reposiciones se gestionan por WhatsApp de forma ágil.",
  "El pago de las cestas se realiza al contado o a 15–30 días, según se acuerde.",
  "Los precios especiales y comisiones se revisarán de forma anual o si cambian las condiciones de coste.",
  "Cualquiera de las partes puede dar por finalizada la colaboración avisando con antelación razonable.",
] as const;

export const AGREEMENT_WE_OFFER = [
  "Productos de productores locales de la Sierra de la Culebra.",
  "Cestas ya preparadas y listas para regalar o vender.",
  "Facilidad de reposición.",
  "Soporte rápido por WhatsApp.",
  "Posibilidad de personalizar mensajes o tarjetas de origen.",
] as const;

export const STATUS_LABELS: Record<string, string> = {
  PROSPECT: "Prospecto",
  CONTACTED: "Contactado",
  MATERIAL_PLACED: "Material puesto",
  ACTIVE: "Activo",
  PAUSED: "En pausa",
  ENDED: "Finalizado",
};

export const MODALITY_LABELS: Record<string, string> = {
  PRESENCE_RECOMMEND: "Presencia y recomendación",
  WELCOME_BASKET: "Cesta de bienvenida",
  COMMISSION_SALE: "Venta con comisión",
  NIGHT_PACK: "Pack noche + cesta",
};

export const EVENT_TYPE_LABELS: Record<string, string> = {
  CONTACT: "Contacto",
  MATERIAL: "Material",
  REFERRAL: "Cliente referido",
  BASKET: "Cesta vía alojamiento",
  THANK_YOU_GIFT: "Detalle de agradecimiento",
  COMMISSION: "Comisión liquidada",
  AGREEMENT: "Aceptación colaboración",
  NOTE: "Nota",
  STATUS_CHANGE: "Cambio de estado",
};
