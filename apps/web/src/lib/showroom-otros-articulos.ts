/** Otros artículos del showroom: ticket, margen e impulso sin romper el modelo. */

export type ShowroomArticlePriority = "alta" | "media";

export type ShowroomExtraArticle = {
  name: string;
  why: string;
  model: string;
  margin?: string;
  priority: ShowroomArticlePriority;
};

export type ShowroomExperienceItem = {
  name: string;
  price: string;
  notes: string;
};

export type ShowroomPriorityEightItem = {
  order: number;
  name: string;
  format: string;
  model: string;
  pvp: string;
  goal: string;
};

/** Lista corta prioritaria — 8 artículos (orden de implantación). */
export const PRIORITY_EIGHT_ARTICLES: ShowroomPriorityEightItem[] = [
  {
    order: 1,
    name: "Miel tarro pequeño",
    format: "250 g",
    model: "Comisión / depósito",
    pvp: "6,50–8,50 €",
    goal: "Impulso + regalo pequeño",
  },
  {
    order: 2,
    name: "Embutido loncheado",
    format: "100–150 g al vacío",
    model: "Comisión / depósito",
    pvp: "4,50–7,00 €",
    goal: "Compra rápida",
  },
  {
    order: 3,
    name: "Mermelada o dulce artesano",
    format: "Tarro pequeño",
    model: "Comisión / depósito",
    pvp: "4,50–6,50 €",
    goal: "Complemento de cesta y regalo",
  },
  {
    order: 4,
    name: "Queso cuña pequeña",
    format: "150–200 g",
    model: "Comisión / depósito",
    pvp: "5,50–8,00 €",
    goal: "Ticket medio y percepción calidad",
  },
  {
    order: 5,
    name: "Bolsa tote / bolsa kraft marca",
    format: "Algodón o kraft resistente",
    model: "Compra propia",
    pvp: "6–10 €",
    goal: "Margen alto + publicidad",
  },
  {
    order: 6,
    name: "Picos o regañás artesanas",
    format: "Bolsa pequeña",
    model: "Comisión / depósito",
    pvp: "2,50–4,00 €",
    goal: "Añadido fácil en caja",
  },
  {
    order: 7,
    name: "Vino o licor de la zona",
    format: "Botella unidad",
    model: "Comisión / depósito",
    pvp: "9–15 €",
    goal: "Ticket alto y regalo",
  },
  {
    order: 8,
    name: "Mini-cata (experiencia)",
    format: "3 productos",
    model: "Servicio propio",
    pvp: "6–8 €",
    goal: "Conversión de visitas",
  },
];

export const PRIORITY_EIGHT_PLACEMENT = [
  {
    zone: "Junto a la caja (impulso)",
    items: "Miel 250 g · Loncheado · Mermelada · Picos · Tote bag",
  },
  {
    zone: "Isla de cestas",
    items: "Miel y mermelada como «añade este producto»",
  },
  {
    zone: "Estantería productores",
    items: "Queso pequeño · Vino/licor · Embutido",
  },
  {
    zone: "Zona de cata",
    items: "Todo lo que se pueda probar (miel, embutido, queso, vino)",
  },
] as const;

export const PRIORITY_EIGHT_NEGOTIATION = [
  "Preferir depósito / consignación antes que compra.",
  "Formatos pequeños pensados para showroom (no solo el formato grande de siempre).",
  "Pedir precio de depósito claro y posibilidad de devolución de lo que no rote.",
  "Priorizar productores del piloto ya en tarifa Bronce (17 %).",
] as const;

export const PRIORITY_EIGHT_GOALS = [
  "Subir el ticket medio en 4–12 € por venta.",
  "Tener opciones de compra rápida (12–20 €) para quien no quiere cesta.",
  "Dar margen propio con la tote bag.",
  "Convertir más visitas con la mini-cata.",
] as const;

export const PRIORITY_EIGHT_ROLLOUT = [
  "Miel 250 g + embutido loncheado + mermelada",
  "Tote bag de la marca",
  "Queso pequeño + picos",
  "Vino / licor",
  "Mini-cata como servicio habitual",
] as const;

export type ToteBagSupplier = {
  name: string;
  minOrder: string;
  idealFor: string;
  priceHint: string;
  url: string;
  note: string;
};

export const TOTE_BAG_SUPPLIERS: ToteBagSupplier[] = [
  {
    name: "La Tostadora",
    minOrder: "1 unidad",
    idealFor: "Probar diseño o pedir pocas",
    priceHint: "Más alto por unidad",
    url: "https://www.latostadora.com",
    note: "Impresión digital, muy fácil",
  },
  {
    name: "HelloPrint",
    minOrder: "Muy bajo",
    idealFor: "Pequeñas tiradas rápidas",
    priceHint: "Desde ~2,5–4 €",
    url: "https://www.helloprint.com/es-es",
    note: "Tiradas rápidas online",
  },
  {
    name: "Sheedo Studio",
    minOrder: "25 uds",
    idealFor: "Buena relación calidad-precio",
    priceHint: "~1,9–4,5 € según cantidad",
    url: "https://sheedostudio.com",
    note: "Cuando empiece a rotar",
  },
  {
    name: "Euroserigrafía",
    minOrder: "~10 uds",
    idealFor: "Serigrafía clásica",
    priceHint: "Desde ~0,60–2 €",
    url: "https://euroserigrafia.com",
    note: "Mejor con pocos colores",
  },
  {
    name: "Garment Printing",
    minOrder: "Flexible",
    idealFor: "Asesoramiento y varias técnicas",
    priceHint: "Variable",
    url: "https://garmentprinting.es",
    note: "DTG / DTF / serigrafía",
  },
  {
    name: "Wordans / mayoristas",
    minOrder: "Variable",
    idealFor: "Cuando ya sepa que rotan",
    priceHint: "Más barato en volumen",
    url: "https://www.wordans.es",
    note: "Volumen alto",
  },
];

export const TOTE_BAG_PHASES = [
  {
    phase: "Ahora — probar",
    detail:
      "La Tostadora o HelloPrint: 20–40 uds para ver el logo a todo color sin arriesgar mucho.",
  },
  {
    phase: "Cuando rote (50–150)",
    detail:
      "Sheedo Studio o Euroserigrafía: mejor precio; algodón 140 g natural (encaja con kraft y logo).",
  },
  {
    phase: "Logo muy colorido",
    detail:
      "Priorizar digital / DTG / DTF. La serigrafía clásica limita colores o encarece diseños geométricos.",
  },
] as const;

export const TOTE_BAG_SPECS = [
  { aspect: "Material", value: "Algodón 140–180 g (natural / crudo)" },
  { aspect: "Tamaño", value: "37×41 cm o similar (clásico)" },
  { aspect: "Asas", value: "Largas (para llevar al hombro)" },
  { aspect: "Color bolsa", value: "Natural / beige kraft" },
  { aspect: "Impresión", value: "Logo a todo color (1 cara)" },
  {
    aspect: "Extra opcional",
    value: "Claim: «Esencia artesana de la tierra salvaje»",
  },
] as const;

export const TOTE_BAG_TIP =
  "Empieza con 30–50 unidades (La Tostadora o HelloPrint), PVP 8–10 €. Si rotan, pasa a 100–200 con mejor precio. Pide siempre muestra o previsualización.";

export const HIGH_PRIORITY_ARTICLES: ShowroomExtraArticle[] = [
  {
    name: "Miel monodosis / tarros pequeños (250 g)",
    why: "Impulso, regalo pequeño, fácil de llevar",
    model: "Comisión o depósito",
    margin: "Alto",
    priority: "alta",
  },
  {
    name: "Embutido loncheado al vacío (100–150 g)",
    why: "Compra rápida, no necesita cesta",
    model: "Comisión",
    margin: "Alto",
    priority: "alta",
  },
  {
    name: "Queso en cuña pequeña",
    why: "Mismo efecto que el embutido",
    model: "Comisión",
    margin: "Alto",
    priority: "alta",
  },
  {
    name: "Mermeladas / dulces artesanos",
    why: "Complemento perfecto de cestas y regalo",
    model: "Comisión",
    margin: "Medio-Alto",
    priority: "alta",
  },
  {
    name: "Picos, regañás o panadería seca",
    why: "Se añade en caja casi sin esfuerzo",
    model: "Comisión o compra mínima",
    margin: "Medio",
    priority: "alta",
  },
  {
    name: "Licores o vinos de la zona (unidades sueltas)",
    why: "Ticket alto y muy «regalo»",
    model: "Comisión",
    margin: "Alto",
    priority: "alta",
  },
  {
    name: "Bolsas kraft / tote bag de la marca",
    why: "Recuerdo + publicidad ambulante",
    model: "Margen propio",
    margin: "Alto",
    priority: "alta",
  },
];

export const MEDIUM_PRIORITY_ARTICLES: ShowroomExtraArticle[] = [
  {
    name: "Libros o guías de la Sierra de la Culebra / La Raya",
    why: "Encaja con turismo y territorio",
    model: "Compra o consignación",
    priority: "media",
  },
  {
    name: "Mapas o rutas impresas",
    why: "Muy útil para el visitante",
    model: "Margen propio o precio simbólico",
    priority: "media",
  },
  {
    name: "Tarjetas postales / prints del territorio",
    why: "Impulso barato y fotogénico",
    model: "Margen propio",
    priority: "media",
  },
  {
    name: "Delantal o paño de cocina con logo",
    why: "Recuerdo útil y visible",
    model: "Margen propio",
    priority: "media",
  },
  {
    name: "Caja regalo vacía / packaging premium",
    why: "Para quien quiere montar su propio regalo",
    model: "Margen propio",
    priority: "media",
  },
  {
    name: "Velas o jabones artesanos locales (si hay productor)",
    why: "Amplía la experiencia sensorial",
    model: "Comisión",
    priority: "media",
  },
];

export const SHOWROOM_EXPERIENCES: ShowroomExperienceItem[] = [
  {
    name: "Mini-cata (3 productos)",
    price: "6–8 €",
    notes: "Muy fácil de ejecutar",
  },
  {
    name: "Cata completa (30–45 min)",
    price: "15–18 €",
    notes: "Fines de semana",
  },
  {
    name: "Taller ligero (corte de embutido, maridaje…)",
    price: "20–25 €",
    notes: "1–2 veces al mes",
  },
  {
    name: "«Monta tu cesta»",
    price: "Variable",
    notes: "Sube el ticket y la percepción de personalización",
  },
];

export const CHECKOUT_IMPULSE_ITEMS = [
  "Tarro pequeño de miel",
  "Loncheado de embutido",
  "Mermelada pequeña",
  "Bolsa tote de la marca",
  "Tarjeta / imán / detalle barato",
] as const;

export const CHECKOUT_IMPULSE_GOAL =
  "Que un % alto de las ventas sumen +4–12 € en el último momento.";

export const SHOWROOM_AVOID_ITEMS = [
  { item: "Productos frescos o que necesiten frío", reason: "Complica operación y mermas" },
  {
    item: "Artesanía genérica no alimentaria sin vínculo claro",
    reason: "Diluye el posicionamiento",
  },
  { item: "Stock alto de merchandising", reason: "Inmoviliza dinero" },
  { item: "Productos de fuera de la zona", reason: "Rompe el relato de territorio" },
  {
    item: "Artículos muy baratos de baja calidad",
    reason: "Resta percepción premium",
  },
] as const;

export const SHOWROOM_COMBOS = [
  { combo: "Cesta + bolsa tote", effect: "Sube ticket y da visibilidad" },
  { combo: "Producto suelto + mini-cata", effect: "Convierte al indeciso" },
  {
    combo: "Cesta + tarjeta de origen + tote",
    effect: "Percepción de regalo completo",
  },
  { combo: "Loncheado + miel pequeña", effect: "Compra rápida de 15–20 €" },
] as const;

export const EXTRA_ARTICLES_PHASES = [
  {
    phase: "Fase 1 — ahora",
    items: [
      "Miel pequeña",
      "Embutido loncheado",
      "Mermelada / dulce",
      "Bolsa tote de la marca",
      "Mini-cata",
    ],
  },
  {
    phase: "Fase 2",
    items: [
      "Vino / licor suelto",
      "Guías o mapas del territorio",
      "Paño / delantal",
      "«Monta tu cesta»",
    ],
  },
  {
    phase: "Fase 3",
    items: ["Experiencias más elaboradas", "Ediciones limitadas de temporada"],
  },
] as const;

export const EXTRA_ARTICLES_SUMMARY = [
  "Versiones pequeñas de lo que ya vendéis (miel, embutido, queso, dulce).",
  "Complementos de impulso junto a la caja.",
  "Merchandising útil con marca (tote, paño).",
  "Experiencias ligeras (catas y talleres).",
  "Productos de territorio (mapas, guías) que refuercen el relato.",
] as const;
