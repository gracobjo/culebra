import { prisma } from "@culebra/db";
import type { ShowroomFootfallCreateInput } from "./showroom-footfall.schemas.js";
import {
  SHOWROOM_DISCOVERY_CHANNEL_LABELS,
  SHOWROOM_FOOTFALL_TYPE_LABELS,
  SHOWROOM_ORIGIN_GROUP_LABELS,
  type ShowroomDiscoveryChannel,
  type ShowroomFootfallType,
  type ShowroomOriginGroup,
} from "./showroom-footfall.schemas.js";

export type ShowroomFootfallRecord = {
  id: string;
  date: string;
  recordedAt: string;
  entryType: ShowroomFootfallType;
  originGroup: ShowroomOriginGroup;
  localityDetail: string | null;
  discoveryChannel: ShowroomDiscoveryChannel | null;
  contactCaptured: boolean;
  notes: string | null;
  createdAt: string;
};

export type ShowroomFootfallOriginSummary = {
  total: number;
  visits: number;
  purchases: number;
  contactsCaptured: number;
  localCount: number;
  localPct: number;
  outsidePct: number;
  unknownOriginPct: number;
  fromLodgingCount: number;
  fromLodgingPct: number;
  purchasesFromLodgingPct: number;
  contactCapturePct: number;
  byOriginGroup: Array<{
    group: ShowroomOriginGroup;
    label: string;
    count: number;
    pct: number;
  }>;
  topLocalities: Array<{ locality: string; count: number }>;
  contactsByOrigin: Array<{
    group: ShowroomOriginGroup;
    label: string;
    count: number;
  }>;
};

function parseDateOnly(value: string): Date {
  return new Date(`${value}T12:00:00.000Z`);
}

function toDateOnlyString(value: Date): string {
  return value.toISOString().slice(0, 10);
}

function todayDateString(): string {
  return new Date().toISOString().slice(0, 10);
}

function mapRow(row: {
  id: string;
  date: Date;
  recordedAt: Date;
  entryType: ShowroomFootfallType;
  originGroup: ShowroomOriginGroup;
  localityDetail: string | null;
  discoveryChannel: ShowroomDiscoveryChannel | null;
  contactCaptured: boolean;
  notes: string | null;
  createdAt: Date;
}): ShowroomFootfallRecord {
  return {
    id: row.id,
    date: toDateOnlyString(row.date),
    recordedAt: row.recordedAt.toISOString(),
    entryType: row.entryType,
    originGroup: row.originGroup,
    localityDetail: row.localityDetail,
    discoveryChannel: row.discoveryChannel,
    contactCaptured: row.contactCaptured,
    notes: row.notes,
    createdAt: row.createdAt.toISOString(),
  };
}

async function bumpDailyStatForFootfall(
  date: string,
  entry: {
    entryType: ShowroomFootfallType;
    discoveryChannel?: ShowroomDiscoveryChannel;
    contactCaptured: boolean;
  },
) {
  const dateVal = parseDateOnly(date);
  const incVisits = entry.entryType === "VISIT" ? 1 : 0;
  const incPurchases = entry.entryType === "PURCHASE" ? 1 : 0;
  const incContacts = entry.contactCaptured ? 1 : 0;
  const incReferred =
    entry.discoveryChannel === "LODGING" && entry.entryType === "VISIT" ? 1 : 0;

  await prisma.showroomDailyStat.upsert({
    where: { date: dateVal },
    create: {
      date: dateVal,
      visits: incVisits,
      purchases: incPurchases,
      contacts: incContacts,
      referredVisits: incReferred,
    },
    update: {
      ...(incVisits ? { visits: { increment: incVisits } } : {}),
      ...(incPurchases ? { purchases: { increment: incPurchases } } : {}),
      ...(incContacts ? { contacts: { increment: incContacts } } : {}),
      ...(incReferred ? { referredVisits: { increment: incReferred } } : {}),
    },
  });
}

export async function createShowroomFootfallEntry(
  input: ShowroomFootfallCreateInput,
): Promise<ShowroomFootfallRecord> {
  const date = input.date ?? todayDateString();

  const row = await prisma.showroomFootfallEntry.create({
    data: {
      date: parseDateOnly(date),
      entryType: input.entryType,
      originGroup: input.originGroup,
      localityDetail: input.localityDetail ?? null,
      discoveryChannel: input.discoveryChannel ?? null,
      contactCaptured: input.contactCaptured,
      notes: input.notes ?? null,
    },
  });

  if (input.syncDailyStat !== false) {
    await bumpDailyStatForFootfall(date, {
      entryType: input.entryType,
      discoveryChannel: input.discoveryChannel,
      contactCaptured: input.contactCaptured,
    });
  }

  return mapRow(row);
}

export async function listShowroomFootfallEntriesForAdmin(options?: {
  from?: string;
  to?: string;
  limit?: number;
}): Promise<ShowroomFootfallRecord[]> {
  const where: { date?: { gte?: Date; lte?: Date } } = {};
  if (options?.from) where.date = { ...where.date, gte: parseDateOnly(options.from) };
  if (options?.to) where.date = { ...where.date, lte: parseDateOnly(options.to) };

  const rows = await prisma.showroomFootfallEntry.findMany({
    where,
    orderBy: [{ date: "desc" }, { recordedAt: "desc" }],
    take: options?.limit ?? 100,
  });

  return rows.map(mapRow);
}

export async function deleteShowroomFootfallEntryForAdmin(id: string): Promise<void> {
  await prisma.showroomFootfallEntry.delete({ where: { id } });
}

export function summarizeShowroomFootfallOrigins(
  entries: ShowroomFootfallRecord[],
): ShowroomFootfallOriginSummary {
  const total = entries.length;
  const visits = entries.filter((e) => e.entryType === "VISIT").length;
  const purchases = entries.filter((e) => e.entryType === "PURCHASE").length;
  const contactsCaptured = entries.filter((e) => e.contactCaptured).length;
  const localCount = entries.filter((e) => e.originGroup === "LOCAL").length;
  const unknownCount = entries.filter((e) => e.originGroup === "NO_INDICADO").length;
  const knownTotal = total - unknownCount;
  const fromLodging = entries.filter((e) => e.discoveryChannel === "LODGING");
  const purchasesFromLodging = fromLodging.filter((e) => e.entryType === "PURCHASE").length;

  const groupCounts = new Map<ShowroomOriginGroup, number>();
  for (const g of Object.keys(SHOWROOM_ORIGIN_GROUP_LABELS) as ShowroomOriginGroup[]) {
    groupCounts.set(g, 0);
  }
  for (const e of entries) {
    groupCounts.set(e.originGroup, (groupCounts.get(e.originGroup) ?? 0) + 1);
  }

  const byOriginGroup = [...groupCounts.entries()]
    .map(([group, count]) => ({
      group,
      label: SHOWROOM_ORIGIN_GROUP_LABELS[group],
      count,
      pct: total > 0 ? Math.round((count / total) * 1000) / 10 : 0,
    }))
    .filter((r) => r.count > 0)
    .sort((a, b) => b.count - a.count);

  const localityMap = new Map<string, number>();
  for (const e of entries) {
    const key = e.localityDetail?.trim();
    if (!key) continue;
    localityMap.set(key, (localityMap.get(key) ?? 0) + 1);
  }
  const topLocalities = [...localityMap.entries()]
    .map(([locality, count]) => ({ locality, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const contactsByOrigin = byOriginGroup
    .map(({ group, label }) => ({
      group,
      label,
      count: entries.filter((e) => e.originGroup === group && e.contactCaptured).length,
    }))
    .filter((r) => r.count > 0);

  return {
    total,
    visits,
    purchases,
    contactsCaptured,
    localCount,
    localPct: knownTotal > 0 ? Math.round((localCount / knownTotal) * 1000) / 10 : 0,
    outsidePct:
      knownTotal > 0
        ? Math.round(((knownTotal - localCount) / knownTotal) * 1000) / 10
        : 0,
    unknownOriginPct: total > 0 ? Math.round((unknownCount / total) * 1000) / 10 : 0,
    fromLodgingCount: fromLodging.length,
    fromLodgingPct: total > 0 ? Math.round((fromLodging.length / total) * 1000) / 10 : 0,
    purchasesFromLodgingPct:
      purchases > 0 ? Math.round((purchasesFromLodging / purchases) * 1000) / 10 : 0,
    contactCapturePct: total > 0 ? Math.round((contactsCaptured / total) * 1000) / 10 : 0,
    byOriginGroup,
    topLocalities,
    contactsByOrigin,
  };
}

export async function getShowroomFootfallOriginSummaryForAdmin(options?: {
  from?: string;
  to?: string;
}): Promise<ShowroomFootfallOriginSummary> {
  const entries = await listShowroomFootfallEntriesForAdmin({
    ...options,
    limit: 5000,
  });
  return summarizeShowroomFootfallOrigins(entries);
}

export function showroomFootfallToCsv(entries: ShowroomFootfallRecord[]): string {
  const headers = [
    "date",
    "recorded_at",
    "entry_type",
    "origin_group",
    "locality_detail",
    "discovery_channel",
    "contact_captured",
    "notes",
  ];
  const lines = [headers.join(",")];
  for (const e of entries) {
    lines.push(
      [
        e.date,
        e.recordedAt,
        SHOWROOM_FOOTFALL_TYPE_LABELS[e.entryType],
        SHOWROOM_ORIGIN_GROUP_LABELS[e.originGroup],
        csvEscape(e.localityDetail),
        e.discoveryChannel ? SHOWROOM_DISCOVERY_CHANNEL_LABELS[e.discoveryChannel] : "",
        e.contactCaptured ? "1" : "0",
        csvEscape(e.notes),
      ].join(","),
    );
  }
  return lines.join("\n");
}

function csvEscape(value: string | null): string {
  if (!value) return "";
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

export async function exportShowroomFootfallCsvForAdmin(options?: {
  from?: string;
  to?: string;
}): Promise<string> {
  const entries = await listShowroomFootfallEntriesForAdmin({
    ...options,
    limit: 5000,
  });
  return showroomFootfallToCsv(entries);
}
