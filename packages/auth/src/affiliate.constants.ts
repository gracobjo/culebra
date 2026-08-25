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
