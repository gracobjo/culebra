export const DEFAULT_COMMISSION_BY_TYPE = {
  LODGING: 10,
  PRODUCER: 9,
  CREATOR: 9,
  GUIDE: 8,
  AMBASSADOR: 8,
  PARTNER_SHOP: 8,
} as const;

export const AFFILIATE_TYPE_LABELS: Record<keyof typeof DEFAULT_COMMISSION_BY_TYPE, string> = {
  LODGING: "Alojamiento rural",
  PRODUCER: "Productor colaborador",
  CREATOR: "Creador / blog",
  GUIDE: "Guía / experiencia",
  AMBASSADOR: "Embajador particular",
  PARTNER_SHOP: "Tienda / espacio afín",
};

export const AFFILIATE_STATUS_LABELS = {
  PENDING: "Pendiente de alta",
  ACTIVE: "Activo",
  SUSPENDED: "Suspendido",
} as const;

export const COMMISSION_TYPE_LABELS = {
  ONLINE_ORDER: "Venta online",
  BASKET_SALE: "Cesta atribuida",
  SHOWROOM_SALE: "Showroom atribuido",
} as const;

export const COMMISSION_STATUS_LABELS = {
  PENDING: "Pendiente",
  APPROVED: "Aprobada",
  PAID: "Pagada",
  CANCELLED: "Cancelada",
} as const;

/** Niveles del programa de fidelización de afiliados. */
export const AFFILIATE_LOYALTY_TIERS = ["COLLABORATOR", "AMBASSADOR", "PARTNER"] as const;

export type AffiliateLoyaltyTierKey = (typeof AFFILIATE_LOYALTY_TIERS)[number];

export const AFFILIATE_LOYALTY_TIER_LABELS: Record<AffiliateLoyaltyTierKey, string> = {
  COLLABORATOR: "Colaborador",
  AMBASSADOR: "Embajador",
  PARTNER: "Partner",
};

export const AFFILIATE_LOYALTY_TIER_BENEFITS: Record<AffiliateLoyaltyTierKey, string> = {
  COLLABORATOR: "Comisión base + material",
  AMBASSADOR: "+1 % comisión o detalle trimestral",
  PARTNER: "+2 % comisión, cesta regalo y prioridad",
};

/** Umbrales orientativos de ventas atribuidas / trimestre (PVP productos). */
export const AFFILIATE_VOLUME_TIER_THRESHOLDS = {
  /** Por debajo: nivel inicial */
  ACTIVE: 300,
  /** Por encima: nivel destacado */
  FEATURED: 800,
} as const;

export const AFFILIATE_PAYOUT_FREQUENCIES = ["MONTHLY", "QUARTERLY"] as const;

export const AFFILIATE_PAYOUT_FREQUENCY_LABELS = {
  MONTHLY: "Mensual",
  QUARTERLY: "Trimestral",
} as const;

export function suggestAffiliateLoyaltyTier(quarterlyVolume: number): AffiliateLoyaltyTierKey {
  if (quarterlyVolume >= AFFILIATE_VOLUME_TIER_THRESHOLDS.FEATURED) return "PARTNER";
  if (quarterlyVolume >= AFFILIATE_VOLUME_TIER_THRESHOLDS.ACTIVE) return "AMBASSADOR";
  return "COLLABORATOR";
}

export const AFFILIATE_TIER_RANK: Record<AffiliateLoyaltyTierKey, number> = {
  COLLABORATOR: 1,
  AMBASSADOR: 2,
  PARTNER: 3,
};
