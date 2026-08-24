/** Playbook comercial del showroom (sin compra de stock, comisión 17 %, porte al cliente). */

export const SHOWROOM_COMMISSION_PERCENT = 17;

export const INCOME_SOURCES = [
  {
    source: "Venta física inmediata",
    how: "El cliente compra y se lleva el producto",
    fit: "Misma comisión 17 % (o la acordada)",
    potential: "Medio-Alto en temporada",
  },
  {
    source: "Pedido para envío desde el showroom",
    how: "Prueba / elige en tienda y se lo mandáis a casa",
    fit: "Comisión + porte 6,50 € al cliente",
    potential: "Alto",
  },
  {
    source: "Cesta / lote preparado",
    how: "Lotes ya montados (regalo, degustación, sabor de la sierra)",
    fit: "Comisión sobre los productos del lote",
    potential: "Alto",
  },
  {
    source: "Experiencias de pago",
    how: "Cata, taller, visita guiada corta",
    fit: "Ingreso directo de la S.L. o comisión",
    potential: "Medio",
  },
  {
    source: "Derivación a alojamientos / packs",
    how: "Enlace o reserva asistida (sin asumir riesgo)",
    fit: "Comisión por derivación si se acuerda",
    potential: "Bajo-Medio",
  },
  {
    source: "Productos de alta rotación en depósito",
    how: "Miel, embutido loncheado, dulces, legumbres",
    fit: "Comisión 17 %",
    potential: "Medio",
  },
] as const;

export const SPACE_ZONES = [
  {
    zone: "Entrada / escaparate",
    role: "Productos más visuales y de impulso (miel, dulces, lotes pequeños)",
    goal: "Parar al visitante",
  },
  {
    zone: "Mesa central / isla",
    role: "Cestas preparadas y «elige 3»",
    goal: "Venta rápida",
  },
  {
    zone: "Estantería por productor",
    role: "Historia + cara del artesano + 2–4 referencias",
    goal: "Confianza y ticket más alto",
  },
  {
    zone: "Zona de cata",
    role: "Mesa pequeña + vasos/platos desechables elegantes",
    goal: "Convertir prueba en compra",
  },
  {
    zone: "Punto de cierre",
    role: "TPV móvil / tablet + opción «te lo envío»",
    goal: "No perder la venta",
  },
] as const;

export const REVENUE_SCENARIOS = [
  {
    name: "Conservador",
    openDays: 80,
    purchases: 250,
    avgTicket: 30,
    gmv: 7500,
    commission: 1275,
  },
  {
    name: "Base",
    openDays: 120,
    purchases: 450,
    avgTicket: 35,
    gmv: 15750,
    commission: 2680,
  },
  {
    name: "Bueno",
    openDays: 150,
    purchases: 700,
    avgTicket: 38,
    gmv: 26600,
    commission: 4520,
  },
] as const;

export const IMPLANTATION_PRIORITY = [
  "Cestas preparadas + venta física inmediata",
  "Opción «te lo envío a casa» desde el showroom",
  "Captación de contacto (WhatsApp / email) de cada visitante",
  "Degustación sencilla (de pago o condicionada)",
  "Cata o taller 1–2 veces al mes en temporada",
  "Lotes de temporada (Navidad, berrea, etc.)",
] as const;

export type ShowroomBasket = {
  slug: string;
  name: string;
  pvp: number;
  positioning: string;
  idealFor: string;
  sensation: string;
  launch: boolean;
  items: Array<{ product: string; format: string; producerCost: number; pvpInBasket: number }>;
  packagingCost: number;
};

export const SHOWROOM_BASKETS: ShowroomBasket[] = [
  {
    slug: "cesta-escapada",
    name: "Cesta Escapada",
    pvp: 29,
    positioning: "Impulso / turista",
    idealFor: "Showroom, compra rápida",
    sensation: "Me llevo un sabor de la sierra sin pensármelo.",
    launch: true,
    packagingCost: 1.8,
    items: [
      { product: "Miel artesana", format: "500 g (o 2×250 g)", producerCost: 6.5, pvpInBasket: 9.5 },
      { product: "Embutido loncheado o pieza pequeña", format: "200–220 g", producerCost: 4.8, pvpInBasket: 7.5 },
      { product: "Queso oveja/cabra (cuña) o legumbre/conserva", format: "200–220 g", producerCost: 5.2, pvpInBasket: 8 },
    ],
  },
  {
    slug: "cesta-comarca",
    name: "Cesta Comarca",
    pvp: 45,
    positioning: "Estándar de regalo (estrella)",
    idealFor: "Showroom + online",
    sensation: "Regalo completo y equilibrado sin llegar a «caro».",
    launch: true,
    packagingCost: 2.4,
    items: [
      { product: "Miel artesana", format: "500 g", producerCost: 6.5, pvpInBasket: 9.5 },
      { product: "Embutidos (chorizo + salchichón)", format: "400–450 g", producerCost: 9.5, pvpInBasket: 14.5 },
      { product: "Queso oveja/cabra", format: "300–320 g", producerCost: 7.5, pvpInBasket: 11.5 },
      { product: "Dulce / mermelada / galletas", format: "1 unidad", producerCost: 3.2, pvpInBasket: 5 },
    ],
  },
  {
    slug: "cesta-sierra",
    name: "Cesta Sierra",
    pvp: 65,
    positioning: "Regalo bueno",
    idealFor: "Online + showroom temporada + packs turismo",
    sensation: "Esto sí es un regalo de la sierra.",
    launch: true,
    packagingCost: 3.2,
    items: [
      { product: "Miel artesana", format: "500 g – 1 kg", producerCost: 8.5, pvpInBasket: 12.5 },
      { product: "Embutidos variados", format: "600–650 g", producerCost: 13.5, pvpInBasket: 20 },
      { product: "Queso", format: "350–400 g", producerCost: 9, pvpInBasket: 13.5 },
      { product: "Dulce / mermelada", format: "1 unidad", producerCost: 3.2, pvpInBasket: 5 },
      { product: "Vino de la zona o licor artesano", format: "1 botella", producerCost: 6.5, pvpInBasket: 10 },
    ],
  },
  {
    slug: "cesta-reserva",
    name: "Cesta Reserva",
    pvp: 89,
    positioning: "Premium / regalo especial",
    idealFor: "Navidad, empresas (activar cuando haya rotación)",
    sensation: "Regalo serio, comparable a las Gourmet Box altas.",
    launch: false,
    packagingCost: 4.5,
    items: [
      { product: "Miel selección", format: "1 kg o 2×500 g", producerCost: 12, pvpInBasket: 17 },
      { product: "Embutidos de más calidad / cantidad", format: "800–900 g", producerCost: 18.5, pvpInBasket: 27.5 },
      { product: "Quesos (1 o 2 variedades)", format: "450–500 g", producerCost: 11.5, pvpInBasket: 17 },
      { product: "Dulce / mermelada / legumbres", format: "1–2 unidades", producerCost: 4.5, pvpInBasket: 7 },
      { product: "Vino bueno de la zona", format: "1 botella", producerCost: 9, pvpInBasket: 13.5 },
    ],
  },
];

export function basketEconomics(basket: ShowroomBasket) {
  const productsPvp = basket.items.reduce((sum, item) => sum + item.pvpInBasket, 0);
  const commission = Math.round(productsPvp * SHOWROOM_COMMISSION_PERCENT) / 100;
  const netMargin = Math.round((commission - basket.packagingCost) * 100) / 100;
  const netPercent = Math.round((netMargin / basket.pvp) * 1000) / 10;
  return { productsPvp, commission, netMargin, netPercent };
}
