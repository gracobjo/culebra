/** Sistema de packaging: mosaico geométrico sobre kraft. Lockup corporativo (escudo) en documentos. */

export const PACKAGING_CLAIMS = {
  primary: "Esencia artesana de la tierra salvaje",
  secondary: "Productos de la Sierra de la Culebra",
  close: "De productores locales · Un solo envío",
  bagBack: "Gracias por llevarte la sierra",
  cardLine: "De la Sierra de la Culebra a tu mesa",
} as const;

export const PACKAGING_SYSTEM = [
  {
    item: "Caja kraft cúbica / rectangular",
    use: "Cestas Escapada, Comarca y Sierra",
    material: "Cartón kraft reciclado",
    notes: "Pieza central del sistema",
    launch: true,
  },
  {
    item: "Caja kraft premium (solapa o tapa)",
    use: "Cesta Reserva y regalos",
    material: "Kraft más grueso + interior negro o verde monte",
    notes: "Para 89 € / Navidad",
    launch: false,
  },
  {
    item: "Bolsa de papel kraft con asa",
    use: "Compra suelta en showroom",
    material: "Kraft 120–140 g + asa retorcida",
    notes: "Venta inmediata",
    launch: true,
  },
  {
    item: "Cesta viruta / mimbre pequeño",
    use: "Ediciones especiales / Navidad",
    material: "Mimbre natural o cartón efecto cesta",
    notes: "Solo temporada",
    launch: false,
  },
  {
    item: "Tag redondo (madera o cartón)",
    use: "Todas las cestas",
    material: "Madera clara o cartón grueso",
    notes: "Atado con yute o algodón",
    launch: true,
  },
  {
    item: "Tarjeta de origen",
    use: "Todas las cestas",
    material: "Papel ecológico",
    notes: "Productores + QR + frase corta",
    launch: true,
  },
] as const;

export const PACKAGING_BY_BASKET = [
  {
    basket: "Escapada 29 €",
    pack: "Caja kraft pequeña + tag",
    extra: "Relleno de viruta o papel",
    costRange: "1,60 – 2,40 €",
    plannedCost: 1.8,
  },
  {
    basket: "Comarca 45 €",
    pack: "Caja kraft mediana + tag + tarjeta origen",
    extra: "Relleno + posible cinta de algodón",
    costRange: "1,60 – 2,40 €",
    plannedCost: 2.4,
  },
  {
    basket: "Sierra 65 €",
    pack: "Caja kraft mediana-grande + tag + tarjeta",
    extra: "Cinta verde monte o natural",
    costRange: "2,80 – 4,50 €",
    plannedCost: 3.2,
  },
  {
    basket: "Reserva 89 €",
    pack: "Caja kraft premium + tag madera + tarjeta",
    extra: "Lazo cuidado + posible impresión interior",
    costRange: "2,80 – 4,50 €",
    plannedCost: 4.5,
  },
] as const;

export const PACKAGING_UNIT_COSTS = [
  { item: "Caja kraft pequeña/mediana", range: "0,70 – 1,20 €" },
  { item: "Caja kraft premium", range: "1,80 – 2,80 €" },
  { item: "Tag madera/cartón", range: "0,25 – 0,45 €" },
  { item: "Relleno + cordel", range: "0,30 – 0,50 €" },
  { item: "Tarjeta origen", range: "0,15 – 0,25 €" },
] as const;

export const PACKAGING_DO = [
  "Relleno: viruta de madera o papel kraft troceado (sin plástico)",
  "Cordel: yute o algodón crudo",
  "Cinta opcional: algodón verde monte o terracota suave",
  "Tarjeta: mosaico pequeño o nombres de productores + QR + frase de cierre",
] as const;

export const PACKAGING_DONT = [
  "Plásticos brillantes",
  "Lazos sintéticos rojos",
  "Tipografías genéricas de sistema en el rótulo",
  "Sustituir el mosaico por el escudo corporativo en la caja (el escudo va en documentos)",
] as const;

export const PACKAGING_LAUNCH = [
  "Caja kraft estándar (2 tamaños: pequeño y mediano)",
  "Tag redondo (cartón grueso o madera clara)",
  "Tarjeta de origen sencilla",
  "Relleno de viruta o papel kraft",
  "Bolsa kraft con asa para venta suelta en showroom",
] as const;
