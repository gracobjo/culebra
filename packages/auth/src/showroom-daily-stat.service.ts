import { prisma } from "@culebra/db";
import type { ShowroomDailyStatUpsertInput } from "./showroom-daily-stat.schemas.js";

export type ShowroomDailyStatRecord = {
  id: string;
  date: string;
  open: boolean;
  visits: number;
  purchases: number;
  gmv: number;
  avgTicketBase: number;
  impulseAttachPct: number;
  impulseAvgEur: number;
  quickBuyPct: number;
  quickBuyTicket: number;
  mielU: number;
  loncheadoU: number;
  mermeladaU: number;
  quesoU: number;
  toteU: number;
  picosU: number;
  vinoU: number;
  minicataU: number;
  toteStock: number;
  onlineOrders: number;
  onlineOrdersAttr: number;
  contacts: number;
  referredVisits: number;
  basketsViaLodging: number;
  partnersActive: number;
  promotion: boolean;
  holidayOrEvent: boolean;
  marketSegment: string | null;
  distributionChannel: string | null;
  notes: string | null;
  sourceSyncedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

/** Fila enriquecida compatible con `culebra_showroom_daily.csv` (43 columnas). */
export type ShowroomDailyStatExportRow = {
  date: string;
  open: number;
  Customer_Footfall: number;
  visits: number;
  purchases: number;
  conversion_rate: number;
  Sales_Amount: number;
  gmv: number;
  avg_ticket_base: number;
  avg_ticket_with_impulse: number;
  impulse_attach_pct: number;
  impulse_avg_eur: number;
  items_per_ticket: number;
  quick_buy_pct: number;
  quick_buy_ticket: number;
  miel_u: number;
  loncheado_u: number;
  mermelada_u: number;
  queso_u: number;
  tote_u: number;
  picos_u: number;
  vino_u: number;
  minicata_u: number;
  Units_Sold: number;
  Inventory_Level: number;
  tote_stock: number;
  Online_Orders: number;
  online_orders_attr: number;
  contacts: number;
  campaign_conversions: number;
  referred_visits: number;
  baskets_via_lodging: number;
  market_segment: string;
  distribution_channel: string;
  Promotion: string;
  Holiday: string;
  holiday_or_event: number;
  Season: string;
  Day_Of_Week: string;
  Month: number;
  Year: number;
  partners_active: number;
  Demand_Level: string;
};

export const SHOWROOM_DAILY_CSV_COLUMNS: (keyof ShowroomDailyStatExportRow)[] = [
  "date",
  "open",
  "Customer_Footfall",
  "visits",
  "purchases",
  "conversion_rate",
  "Sales_Amount",
  "gmv",
  "avg_ticket_base",
  "avg_ticket_with_impulse",
  "impulse_attach_pct",
  "impulse_avg_eur",
  "items_per_ticket",
  "quick_buy_pct",
  "quick_buy_ticket",
  "miel_u",
  "loncheado_u",
  "mermelada_u",
  "queso_u",
  "tote_u",
  "picos_u",
  "vino_u",
  "minicata_u",
  "Units_Sold",
  "Inventory_Level",
  "tote_stock",
  "Online_Orders",
  "online_orders_attr",
  "contacts",
  "campaign_conversions",
  "referred_visits",
  "baskets_via_lodging",
  "market_segment",
  "distribution_channel",
  "Promotion",
  "Holiday",
  "holiday_or_event",
  "Season",
  "Day_Of_Week",
  "Month",
  "Year",
  "partners_active",
  "Demand_Level",
];

const DAY_NAMES = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

function toNumber(value: { toString(): string } | number | null | undefined) {
  if (value == null) return 0;
  const n = typeof value === "number" ? value : Number(value.toString());
  return Number.isFinite(n) ? n : 0;
}

function toDateOnlyString(value: Date) {
  return value.toISOString().slice(0, 10);
}

function parseDateOnly(value: string) {
  return new Date(`${value}T12:00:00.000Z`);
}

function seasonFor(month: number): string {
  if (month === 12 || month <= 2) return "Invierno";
  if (month <= 5) return "Primavera";
  if (month <= 8) return "Verano";
  return "Otoño";
}

function demandLevel(gmv: number, open: boolean): string {
  if (!open) return "None";
  if (gmv >= 900) return "High";
  if (gmv >= 450) return "Medium";
  return "Low";
}

function mapRow(row: {
  id: string;
  date: Date;
  open: boolean;
  visits: number;
  purchases: number;
  gmv: { toString(): string };
  avgTicketBase: { toString(): string };
  impulseAttachPct: { toString(): string };
  impulseAvgEur: { toString(): string };
  quickBuyPct: { toString(): string };
  quickBuyTicket: { toString(): string };
  mielU: number;
  loncheadoU: number;
  mermeladaU: number;
  quesoU: number;
  toteU: number;
  picosU: number;
  vinoU: number;
  minicataU: number;
  toteStock: number;
  onlineOrders: number;
  onlineOrdersAttr: number;
  contacts: number;
  referredVisits: number;
  basketsViaLodging: number;
  partnersActive: number;
  promotion: boolean;
  holidayOrEvent: boolean;
  marketSegment: string | null;
  distributionChannel: string | null;
  notes: string | null;
  sourceSyncedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}): ShowroomDailyStatRecord {
  return {
    id: row.id,
    date: toDateOnlyString(row.date),
    open: row.open,
    visits: row.visits,
    purchases: row.purchases,
    gmv: toNumber(row.gmv),
    avgTicketBase: toNumber(row.avgTicketBase),
    impulseAttachPct: toNumber(row.impulseAttachPct),
    impulseAvgEur: toNumber(row.impulseAvgEur),
    quickBuyPct: toNumber(row.quickBuyPct),
    quickBuyTicket: toNumber(row.quickBuyTicket),
    mielU: row.mielU,
    loncheadoU: row.loncheadoU,
    mermeladaU: row.mermeladaU,
    quesoU: row.quesoU,
    toteU: row.toteU,
    picosU: row.picosU,
    vinoU: row.vinoU,
    minicataU: row.minicataU,
    toteStock: row.toteStock,
    onlineOrders: row.onlineOrders,
    onlineOrdersAttr: row.onlineOrdersAttr,
    contacts: row.contacts,
    referredVisits: row.referredVisits,
    basketsViaLodging: row.basketsViaLodging,
    partnersActive: row.partnersActive,
    promotion: row.promotion,
    holidayOrEvent: row.holidayOrEvent,
    marketSegment: row.marketSegment,
    distributionChannel: row.distributionChannel,
    notes: row.notes,
    sourceSyncedAt: row.sourceSyncedAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function enrichShowroomDailyStat(
  record: ShowroomDailyStatRecord,
): ShowroomDailyStatExportRow {
  const ts = parseDateOnly(record.date);
  const month = ts.getUTCMonth() + 1;
  const year = ts.getUTCFullYear();
  const dayOfWeek = DAY_NAMES[ts.getUTCDay() === 0 ? 6 : ts.getUTCDay() - 1] ?? "Monday";

  const unitsSold =
    record.mielU +
    record.loncheadoU +
    record.mermeladaU +
    record.quesoU +
    record.toteU +
    record.picosU +
    record.vinoU +
    record.minicataU;

  const attachRatio = record.impulseAttachPct / 100;
  const avgTicketWithImpulse =
    record.open && record.purchases > 0
      ? record.avgTicketBase + attachRatio * record.impulseAvgEur
      : 0;

  const conversion =
    record.open && record.visits > 0
      ? Math.round((record.purchases / record.visits) * 10_000) / 10_000
      : 0;

  const itemsPerTicket =
    record.open && record.purchases > 0
      ? Math.round((unitsSold / record.purchases) * 100) / 100
      : 0;

  const segment =
    record.marketSegment ??
    (record.open
      ? record.referredVisits > 0
        ? "Rural_lodging"
        : "Direct"
      : "Closed");

  const channel =
    record.distributionChannel ??
    (segment === "Rural_lodging"
      ? "Partner_referral"
      : segment === "Direct"
        ? "Direct"
        : "Walk_in");

  return {
    date: record.date,
    open: record.open ? 1 : 0,
    Customer_Footfall: record.visits,
    visits: record.visits,
    purchases: record.purchases,
    conversion_rate: conversion,
    Sales_Amount: record.gmv,
    gmv: record.gmv,
    avg_ticket_base: record.avgTicketBase,
    avg_ticket_with_impulse: Math.round(avgTicketWithImpulse * 100) / 100,
    impulse_attach_pct: record.impulseAttachPct,
    impulse_avg_eur: record.impulseAvgEur,
    items_per_ticket: itemsPerTicket,
    quick_buy_pct: record.quickBuyPct,
    quick_buy_ticket: record.quickBuyTicket,
    miel_u: record.mielU,
    loncheado_u: record.loncheadoU,
    mermelada_u: record.mermeladaU,
    queso_u: record.quesoU,
    tote_u: record.toteU,
    picos_u: record.picosU,
    vino_u: record.vinoU,
    minicata_u: record.minicataU,
    Units_Sold: unitsSold,
    Inventory_Level: record.toteStock,
    tote_stock: record.toteStock,
    Online_Orders: record.onlineOrders,
    online_orders_attr: record.onlineOrdersAttr,
    contacts: record.contacts,
    campaign_conversions: record.onlineOrdersAttr,
    referred_visits: record.referredVisits,
    baskets_via_lodging: record.basketsViaLodging,
    market_segment: segment,
    distribution_channel: channel,
    Promotion: record.promotion ? "Yes" : "No",
    Holiday: record.holidayOrEvent ? "Yes" : "No",
    holiday_or_event: record.holidayOrEvent ? 1 : 0,
    Season: seasonFor(month),
    Day_Of_Week: dayOfWeek,
    Month: month,
    Year: year,
    partners_active: record.partnersActive,
    Demand_Level: demandLevel(record.gmv, record.open),
  };
}

function csvEscape(value: string | number) {
  const text = String(value);
  if (/[",\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

export function showroomDailyStatsToCsv(rows: ShowroomDailyStatExportRow[]) {
  const header = SHOWROOM_DAILY_CSV_COLUMNS.join(",");
  const body = rows
    .map((row) =>
      SHOWROOM_DAILY_CSV_COLUMNS.map((col) => csvEscape(row[col])).join(","),
    )
    .join("\n");
  return `${header}\n${body}\n`;
}

export async function listShowroomDailyStatsForAdmin(options?: {
  from?: string;
  to?: string;
}) {
  const where: { date?: { gte?: Date; lte?: Date } } = {};
  if (options?.from) {
    where.date = { ...where.date, gte: parseDateOnly(options.from) };
  }
  if (options?.to) {
    where.date = { ...where.date, lte: parseDateOnly(options.to) };
  }

  const rows = await prisma.showroomDailyStat.findMany({
    where,
    orderBy: { date: "asc" },
  });

  return rows.map(mapRow);
}

export async function getShowroomDailyStatsEnrichedForAdmin(options?: {
  from?: string;
  to?: string;
}) {
  const records = await listShowroomDailyStatsForAdmin(options);
  return records.map(enrichShowroomDailyStat);
}

export async function exportShowroomDailyStatsCsvForAdmin(options?: {
  from?: string;
  to?: string;
}) {
  const enriched = await getShowroomDailyStatsEnrichedForAdmin(options);
  return showroomDailyStatsToCsv(enriched);
}

export async function upsertShowroomDailyStatForAdmin(
  input: ShowroomDailyStatUpsertInput,
) {
  const date = parseDateOnly(input.date);
  const data = {
    open: input.open,
    visits: input.visits,
    purchases: input.purchases,
    gmv: input.gmv,
    avgTicketBase: input.avgTicketBase,
    impulseAttachPct: input.impulseAttachPct,
    impulseAvgEur: input.impulseAvgEur,
    quickBuyPct: input.quickBuyPct,
    quickBuyTicket: input.quickBuyTicket,
    mielU: input.mielU,
    loncheadoU: input.loncheadoU,
    mermeladaU: input.mermeladaU,
    quesoU: input.quesoU,
    toteU: input.toteU,
    picosU: input.picosU,
    vinoU: input.vinoU,
    minicataU: input.minicataU,
    toteStock: input.toteStock,
    onlineOrders: input.onlineOrders,
    onlineOrdersAttr: input.onlineOrdersAttr,
    contacts: input.contacts,
    referredVisits: input.referredVisits,
    basketsViaLodging: input.basketsViaLodging,
    partnersActive: input.partnersActive,
    promotion: input.promotion,
    holidayOrEvent: input.holidayOrEvent,
    marketSegment: input.marketSegment ?? null,
    distributionChannel: input.distributionChannel ?? null,
    notes: input.notes ?? null,
  };

  const row = await prisma.showroomDailyStat.upsert({
    where: { date },
    create: { date, ...data },
    update: data,
  });

  return mapRow(row);
}

export async function deleteShowroomDailyStatForAdmin(date: string) {
  await prisma.showroomDailyStat.delete({
    where: { date: parseDateOnly(date) },
  });
}

type DaySync = {
  onlineOrders: number;
  onlineOrdersAttr: number;
  referredVisits: number;
  basketsViaLodging: number;
};

async function collectSystemMetricsByDay(from: string, to: string) {
  const fromDate = parseDateOnly(from);
  const toDate = parseDateOnly(`${to}T23:59:59.999Z`);

  const [orders, lodgingEvents, partnersActive] = await Promise.all([
    prisma.order.findMany({
      where: {
        createdAt: { gte: fromDate, lte: toDate },
        status: { in: ["PAID", "PARTIALLY_SHIPPED", "SHIPPED", "DELIVERED"] },
      },
      select: { createdAt: true, affiliateCode: true },
    }),
    prisma.lodgingRelationEvent.findMany({
      where: {
        occurredAt: { gte: fromDate, lte: toDate },
        type: { in: ["REFERRAL", "BASKET"] },
      },
      select: { occurredAt: true, type: true, quantity: true },
    }),
    prisma.lodgingPartnerRelation.count({
      where: { status: "ACTIVE", collabLevel: { gte: 3 } },
    }),
  ]);

  const byDay = new Map<string, DaySync>();

  function ensureDay(key: string): DaySync {
    const existing = byDay.get(key);
    if (existing) return existing;
    const created = {
      onlineOrders: 0,
      onlineOrdersAttr: 0,
      referredVisits: 0,
      basketsViaLodging: 0,
    };
    byDay.set(key, created);
    return created;
  }

  for (const order of orders) {
    const key = toDateOnlyString(order.createdAt);
    const bucket = ensureDay(key);
    bucket.onlineOrders += 1;
    if (order.affiliateCode) {
      bucket.onlineOrdersAttr += 1;
    }
  }

  for (const event of lodgingEvents) {
    const key = toDateOnlyString(event.occurredAt);
    const bucket = ensureDay(key);
    const qty = event.quantity ?? 1;
    if (event.type === "REFERRAL") {
      bucket.referredVisits += qty;
    } else if (event.type === "BASKET") {
      bucket.basketsViaLodging += qty;
    }
  }

  return { byDay, partnersActive };
}

/** Rellena online/referidos desde pedidos y CRM sin sobrescribir visitas manuales. */
export async function syncShowroomDailyStatsFromSystem(from: string, to: string) {
  const { byDay, partnersActive } = await collectSystemMetricsByDay(from, to);
  const now = new Date();
  let touched = 0;

  for (const [dateKey, metrics] of byDay.entries()) {
    if (dateKey < from || dateKey > to) continue;

    const date = parseDateOnly(dateKey);
    const existing = await prisma.showroomDailyStat.findUnique({ where: { date } });

    if (existing) {
      await prisma.showroomDailyStat.update({
        where: { date },
        data: {
          onlineOrders: metrics.onlineOrders,
          onlineOrdersAttr: metrics.onlineOrdersAttr,
          referredVisits: metrics.referredVisits,
          basketsViaLodging: metrics.basketsViaLodging,
          partnersActive,
          sourceSyncedAt: now,
        },
      });
    } else {
      await prisma.showroomDailyStat.create({
        data: {
          date,
          open: false,
          onlineOrders: metrics.onlineOrders,
          onlineOrdersAttr: metrics.onlineOrdersAttr,
          referredVisits: metrics.referredVisits,
          basketsViaLodging: metrics.basketsViaLodging,
          partnersActive,
          sourceSyncedAt: now,
        },
      });
    }
    touched += 1;
  }

  return { daysSynced: touched, partnersActive };
}

export type ShowroomDailyStatsSummary = {
  daysTotal: number;
  daysOpen: number;
  visits: number;
  purchases: number;
  gmv: number;
  avgConversion: number;
  avgTicket: number;
  impulseAttachPct: number;
  quickBuyPct: number;
  unitsSold: number;
  contacts: number;
  onlineOrdersAttr: number;
  referredVisits: number;
  basketsViaLodging: number;
  toteSold: number;
  toteStockLast: number;
};

export function summarizeShowroomDailyStats(
  enriched: ShowroomDailyStatExportRow[],
): ShowroomDailyStatsSummary {
  const openRows = enriched.filter((r) => r.open === 1);
  const visits = openRows.reduce((s, r) => s + r.visits, 0);
  const purchases = openRows.reduce((s, r) => s + r.purchases, 0);
  const gmv = openRows.reduce((s, r) => s + r.gmv, 0);
  const unitsSold = openRows.reduce((s, r) => s + r.Units_Sold, 0);
  const contacts = openRows.reduce((s, r) => s + r.contacts, 0);
  const onlineOrdersAttr = enriched.reduce((s, r) => s + r.online_orders_attr, 0);
  const referredVisits = enriched.reduce((s, r) => s + r.referred_visits, 0);
  const basketsViaLodging = enriched.reduce((s, r) => s + r.baskets_via_lodging, 0);
  const toteSold = openRows.reduce((s, r) => s + r.tote_u, 0);

  const weightedAttach =
    purchases > 0
      ? openRows.reduce((s, r) => s + r.impulse_attach_pct * r.purchases, 0) / purchases
      : 0;

  const weightedQuick =
    purchases > 0
      ? openRows.reduce((s, r) => s + r.quick_buy_pct * r.purchases, 0) / purchases
      : 0;

  const lastOpen = [...openRows].reverse()[0];

  return {
    daysTotal: enriched.length,
    daysOpen: openRows.length,
    visits,
    purchases,
    gmv: Math.round(gmv * 100) / 100,
    avgConversion: visits > 0 ? Math.round((purchases / visits) * 10_000) / 100 : 0,
    avgTicket: purchases > 0 ? Math.round((gmv / purchases) * 100) / 100 : 0,
    impulseAttachPct: Math.round(weightedAttach * 10) / 10,
    quickBuyPct: Math.round(weightedQuick * 10) / 10,
    unitsSold,
    contacts,
    onlineOrdersAttr,
    referredVisits,
    basketsViaLodging,
    toteSold,
    toteStockLast: lastOpen?.tote_stock ?? 0,
  };
}
