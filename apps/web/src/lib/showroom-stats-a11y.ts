import type { ShowroomDailyStatsSummary } from "@culebra/auth";
import { formatPrice } from "@/lib/format";

/** Glosario de términos del panel estadísticas / EDA showroom. */
export const SHOWROOM_STATS_GLOSSARY: { term: string; definition: string }[] = [
  {
    term: "GMV",
    definition:
      "Gross Merchandise Value: ventas brutas en euros del periodo (suma del importe de compras en el showroom).",
  },
  {
    term: "Attach impulso",
    definition:
      "Porcentaje de tickets de caja en los que el cliente añade un producto extra en el mostrador (miel, picos, tote, etc.) además de la compra principal. Meta operativa ≥ 40 %.",
  },
  {
    term: "Impulso en caja",
    definition:
      "Venta espontánea en el TPV: artículos de la lista de 8 o complementos que no formaban parte de una cesta cerrada. Suele sumar entre 4 y 12 € al ticket.",
  },
  {
    term: "Quick buy",
    definition:
      "Compra rápida sin cesta regalo: ticket corto (orientativo 12–20 €), una o pocas unidades. Meta ≥ 20 % del mix de compras.",
  },
  {
    term: "Conversión",
    definition:
      "Porcentaje de visitas al showroom que terminan en compra: compras ÷ visitas × 100. Meta ≥ 30–35 %.",
  },
  {
    term: "Ticket medio",
    definition:
      "Importe medio por compra en el periodo: GMV ÷ número de compras.",
  },
  {
    term: "Lista de 8",
    definition:
      "Ocho referencias de impulso en caja: miel, loncheado, mermelada, queso, tote bag, picos, vino y mini-cata.",
  },
  {
    term: "Online atrib. showroom",
    definition:
      "Pedidos web contados como derivados del showroom (QR, contacto captado o código afiliado).",
  },
  {
    term: "Visitas referidas",
    definition:
      "Personas que llegan al showroom recomendadas por un alojamiento partner (CRM turismo).",
  },
  {
    term: "Cestas vía alojamientos",
    definition:
      "Cestas vendidas o atribuidas a un partner de alojamiento (bienvenida, comisión L4, etc.).",
  },
  {
    term: "Demanda (Low / Medium / High)",
    definition:
      "Nivel cualitativo del día según GMV: Low < 450 €, Medium 450–899 €, High ≥ 900 € (días abiertos).",
  },
  {
    term: "EDA",
    definition:
      "Análisis exploratorio de datos: gráficos y tablas para ver tendencias antes de exportar el CSV a Python.",
  },
];

export type ShowroomKpiReportItem = {
  id: string;
  title: string;
  hint: string;
  definition: string;
  formula: string;
  meta?: string;
  valueFromSummary: (s: ShowroomDailyStatsSummary) => string;
};

export const SHOWROOM_KPI_REPORT: ShowroomKpiReportItem[] = [
  {
    id: "conversion",
    title: "Conversión media",
    hint: "Porcentaje de visitas que compran en el showroom.",
    definition: "Media ponderada del periodo filtrado, solo días abiertos.",
    formula: "Σ compras ÷ Σ visitas × 100",
    meta: "Meta ≥ 30–35 %",
    valueFromSummary: (s) => `${s.avgConversion} %`,
  },
  {
    id: "ticket",
    title: "Ticket medio",
    hint: "Euros de media por ticket de compra.",
    definition: "GMV total del periodo dividido entre compras totales.",
    formula: "GMV periodo ÷ Σ compras",
    meta: "Meta ≥ 38 €",
    valueFromSummary: (s) => formatPrice(s.avgTicket),
  },
  {
    id: "attach",
    title: "Attach impulso",
    hint: "% de ventas con añadido en caja (producto extra al ticket).",
    definition:
      "Media ponderada por compras del campo «Attach impulso (%)» de cada día abierto.",
    formula: "Σ (attach% × compras_día) ÷ Σ compras",
    meta: "Meta ≥ 40 %",
    valueFromSummary: (s) => `${s.impulseAttachPct} %`,
  },
  {
    id: "quick",
    title: "Quick buy",
    hint: "% de compras rápidas sin cesta (ticket corto).",
    definition: "Media ponderada del % quick buy registrado en días abiertos.",
    formula: "Σ (quick_buy% × compras_día) ÷ Σ compras",
    meta: "Meta ≥ 20 %",
    valueFromSummary: (s) => `${s.quickBuyPct} %`,
  },
  {
    id: "gmv",
    title: "GMV periodo",
    hint: "Ventas brutas acumuladas en euros.",
    definition: "Suma de GMV de todos los días abiertos del rango visible.",
    formula: "Σ GMV (días open = 1)",
    valueFromSummary: (s) => formatPrice(s.gmv),
  },
  {
    id: "units8",
    title: "Unidades lista de 8",
    hint: "Suma de unidades vendidas de los 8 SKU de impulso.",
    definition: "Miel + loncheado + mermelada + queso + tote + picos + vino + mini-cata.",
    formula: "Σ unidades SKU (días abiertos)",
    meta: "Referencia ≥ 60 uds / periodo medido",
    valueFromSummary: (s) => String(s.unitsSold),
  },
  {
    id: "contacts",
    title: "Contactos captados",
    hint: "Emails o teléfonos obtenidos de compradores para seguimiento web.",
    definition: "Suma diaria de contactos registrados en el formulario de captación.",
    formula: "Σ contactos",
    valueFromSummary: (s) => String(s.contacts),
  },
  {
    id: "tote",
    title: "Tote vendidas",
    hint: "Unidades de bolsa tote vendidas en el periodo.",
    definition: "Suma de tote_u en días abiertos; stock último día en nota.",
    formula: "Σ tote_u · stock = último día abierto",
    valueFromSummary: (s) =>
      `${s.toteSold} uds (stock último día: ${s.toteStockLast})`,
  },
];

export const SHOWROOM_CHART_REPORT: {
  id: string;
  title: string;
  shows: string;
  axes: string;
}[] = [
  {
    id: "monthly",
    title: "Tendencia mensual — GMV y conversión",
    shows: "Evolución mes a mes del negocio en el showroom.",
    axes:
      "Eje izquierdo: GMV € acumulado por mes. Eje derecho: conversión % media mensual (compras/visitas).",
  },
  {
    id: "season",
    title: "Estación — GMV acumulado",
    shows: "Cuánto vende el showroom por estación (Invierno, Primavera, Verano, Otoño).",
    axes: "Barras: GMV € total por estación en el periodo.",
  },
  {
    id: "holiday",
    title: "Festivo vs normal — GMV medio/día",
    shows: "Compara el ticket medio diario en festivo/evento frente a día normal.",
    axes: "Barras: GMV medio € por tipo de día.",
  },
  {
    id: "impulse",
    title: "Impulso en caja — últimos 30 días abiertos",
    shows: "Attach %, quick buy % y ticket con impulso en el tramo reciente.",
    axes: "Líneas: attach y quick en %; ticket en €.",
  },
  {
    id: "sku",
    title: "Lista de 8 — mix de unidades",
    shows: "Qué SKU de impulso concentra más unidades en el periodo.",
    axes: "Barras horizontales: unidades por producto.",
  },
  {
    id: "lodging",
    title: "Canal alojamientos — referidos y online",
    shows: "Tráfico y ventas atribuidas al canal rural por mes.",
    axes: "Visitas referidas, cestas partners y pedidos online atribuidos.",
  },
];

export type ShowroomFormFieldHint = {
  name: string;
  label: string;
  hint: string;
};

export const SHOWROOM_FORM_FIELD_HINTS: ShowroomFormFieldHint[] = [
  { name: "date", label: "Fecha", hint: "Día al que corresponden las cifras (YYYY-MM-DD)." },
  { name: "open", label: "Día abierto", hint: "Marcar si el showroom abrió al público ese día." },
  { name: "visits", label: "Visitas", hint: "Personas que entraron al espacio (footfall)." },
  { name: "purchases", label: "Compras", hint: "Tickets de caja con al menos una venta." },
  { name: "gmv", label: "GMV (€)", hint: "Importe bruto vendido ese día en el showroom." },
  {
    name: "avgTicketBase",
    label: "Ticket base (€)",
    hint: "Ticket medio sin contar el extra de impulso en caja.",
  },
  {
    name: "impulseAttachPct",
    label: "Attach impulso (%)",
    hint: "Porcentaje de tickets donde se añadió un producto de impulso.",
  },
  {
    name: "impulseAvgEur",
    label: "€ medio impulso",
    hint: "Euros medios del añadido cuando hay attach (meta 4–12 €).",
  },
  {
    name: "quickBuyPct",
    label: "Quick buy (%)",
    hint: "Porcentaje de compras rápidas sin cesta regalo.",
  },
  {
    name: "quickBuyTicket",
    label: "Ticket quick buy (€)",
    hint: "Ticket medio de esas compras rápidas (meta 12–20 €).",
  },
  { name: "mielU", label: "Miel", hint: "Unidades vendidas de miel 250 g." },
  { name: "loncheadoU", label: "Loncheado", hint: "Unidades de embutido loncheado." },
  { name: "mermeladaU", label: "Mermelada", hint: "Unidades de mermelada." },
  { name: "quesoU", label: "Queso", hint: "Unidades de queso cuña." },
  { name: "toteU", label: "Tote", hint: "Unidades de bolsa tote (margen propio)." },
  { name: "picosU", label: "Picos", hint: "Unidades de picos o regañás." },
  { name: "vinoU", label: "Vino", hint: "Unidades de vino o licor de la zona." },
  { name: "minicataU", label: "Mini-cata", hint: "Experiencias mini-cata vendidas." },
  { name: "toteStock", label: "Stock tote", hint: "Unidades de tote en almacén al cierre del día." },
  { name: "onlineOrders", label: "Pedidos online", hint: "Pedidos web pagados ese día (todos)." },
  {
    name: "onlineOrdersAttr",
    label: "Online atrib. showroom",
    hint: "De esos pedidos, los atribuidos al showroom.",
  },
  { name: "contacts", label: "Contactos", hint: "Datos de contacto captados de compradores." },
  {
    name: "referredVisits",
    label: "Visitas referidas",
    hint: "Visitas enviadas por alojamientos partners.",
  },
  {
    name: "basketsViaLodging",
    label: "Cestas vía alojamientos",
    hint: "Cestas vendidas o atribuidas al canal rural.",
  },
  {
    name: "partnersActive",
    label: "Partners activos",
    hint: "Alojamientos en nivel L3+ recomendando activamente.",
  },
];

const hintByName = new Map(SHOWROOM_FORM_FIELD_HINTS.map((f) => [f.name, f.hint]));

export function showroomFormFieldHint(name: string) {
  return hintByName.get(name) ?? "";
}

export function buildShowroomStatsTextReport(
  summary: ShowroomDailyStatsSummary,
  periodLabel: string,
): string {
  const lines: string[] = [
    "INFORME — Estadísticas showroom Sabores de la Culebra",
    `Periodo: ${periodLabel}`,
    `Generado: ${new Date().toLocaleString("es-ES")}`,
    "",
    "=== RESUMEN KPI ===",
  ];

  for (const kpi of SHOWROOM_KPI_REPORT) {
    lines.push(
      `${kpi.title}: ${kpi.valueFromSummary(summary)}`,
      `  Qué es: ${kpi.definition}`,
      `  Cálculo: ${kpi.formula}`,
      kpi.meta ? `  Meta: ${kpi.meta}` : "",
      "",
    );
  }

  lines.push(
    `Días registrados: ${summary.daysTotal} · Días abiertos: ${summary.daysOpen}`,
    `Visitas referidas (total): ${summary.referredVisits}`,
    `Cestas vía alojamientos: ${summary.basketsViaLodging}`,
    `Pedidos online atribuidos: ${summary.onlineOrdersAttr}`,
    "",
    "=== GRÁFICOS EDA ===",
  );

  for (const chart of SHOWROOM_CHART_REPORT) {
    lines.push(`${chart.title}`, `  Muestra: ${chart.shows}`, `  Ejes: ${chart.axes}`, "");
  }

  lines.push("=== GLOSARIO ===");
  for (const { term, definition } of SHOWROOM_STATS_GLOSSARY) {
    lines.push(`${term}: ${definition}`);
  }

  return lines.filter(Boolean).join("\n");
}
