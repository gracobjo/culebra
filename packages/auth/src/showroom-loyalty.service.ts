import { prisma } from "@culebra/db";
import type { ShowroomFootfallType, ShowroomOriginGroup } from "./showroom-footfall.schemas.js";
import {
  SHOWROOM_SCRATCH_PRIZE_META,
  type ScratchPlayInput,
  type ShowroomScratchPrize,
  type StampCardCreateInput,
  type ClubJoinInput,
  type ReferralCreateInput,
} from "./showroom-loyalty.schemas.js";

export type ShowroomScratchPlayRecord = {
  id: string;
  monthKey: string;
  playNumber: number;
  won: boolean;
  prize: ShowroomScratchPrize | null;
  prizeLabel: string | null;
  entryType: ShowroomFootfallType;
  customerLabel: string | null;
  notes: string | null;
  createdAt: string;
};

export type ShowroomStampCardRecord = {
  id: string;
  cardCode: string;
  customerName: string;
  contactHint: string | null;
  stampsRequired: number;
  stampsCount: number;
  status: "ACTIVE" | "COMPLETED" | "REDEEMED";
  completedAt: string | null;
  redeemedAt: string | null;
  notes: string | null;
};

export type ShowroomClubMemberRecord = {
  id: string;
  name: string;
  contact: string;
  channel: string;
  originGroup: ShowroomOriginGroup | null;
  promoCode: string | null;
  birthday: string | null;
  isActive: boolean;
  joinedAt: string;
};

export type ShowroomReferralRecord = {
  id: string;
  referrerName: string;
  referredName: string;
  referredPurchased: boolean;
  rewardGiven: boolean;
  eventDate: string;
  notes: string | null;
};

export type ShowroomLoyaltySummary = {
  monthKey: string;
  scratchPlays: number;
  scratchWins: number;
  scratchWinRatePct: number;
  stampCardsActive: number;
  stampCardsCompleted: number;
  stampCardsRedeemed: number;
  clubMembersActive: number;
  clubJoinsThisMonth: number;
  referralsPending: number;
  referralsRewarded: number;
  prizesByType: Array<{ prize: ShowroomScratchPrize; label: string; count: number }>;
};

function monthKeyNow(): string {
  return new Date().toISOString().slice(0, 7);
}

function parseDateOnly(value: string): Date {
  return new Date(`${value}T12:00:00.000Z`);
}

function randomPromoSuffix(): string {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

function provenancePromoPrefix(origin: ShowroomOriginGroup | undefined): string {
  switch (origin) {
    case "MADRID":
    case "OTRAS_CCAA":
    case "EXTRANJERO":
      return "ENVIO-SIERRA";
    case "LOCAL":
    case "ZAMORA":
      return "VUELVE-SIERRA";
    default:
      return "CLUB-SIERRA";
  }
}

async function ensureLoyaltyMonth(monthKey: string) {
  return prisma.showroomLoyaltyMonth.upsert({
    where: { monthKey },
    create: { monthKey },
    update: {},
  });
}

async function nextCardCode(): Promise<string> {
  const count = await prisma.showroomStampCard.count();
  return `ST-${String(count + 1).padStart(4, "0")}`;
}

async function prizeCountsForMonth(monthKey: string): Promise<Map<ShowroomScratchPrize, number>> {
  const rows = await prisma.showroomScratchPlay.groupBy({
    by: ["prize"],
    where: { monthKey, won: true, prize: { not: null } },
    _count: { prize: true },
  });
  const map = new Map<ShowroomScratchPrize, number>();
  for (const row of rows) {
    if (row.prize) map.set(row.prize, row._count.prize);
  }
  return map;
}

function pickPrize(counts: Map<ShowroomScratchPrize, number>): ShowroomScratchPrize | null {
  const available = (Object.keys(SHOWROOM_SCRATCH_PRIZE_META) as ShowroomScratchPrize[]).filter(
    (p) => (counts.get(p) ?? 0) < SHOWROOM_SCRATCH_PRIZE_META[p].maxPerMonth,
  );
  if (available.length === 0) return null;

  const totalWeight = available.reduce((s, p) => s + SHOWROOM_SCRATCH_PRIZE_META[p].weight, 0);
  let roll = Math.random() * totalWeight;
  for (const p of available) {
    roll -= SHOWROOM_SCRATCH_PRIZE_META[p].weight;
    if (roll <= 0) return p;
  }
  return available[available.length - 1] ?? null;
}

function mapScratch(row: {
  id: string;
  monthKey: string;
  playNumber: number;
  won: boolean;
  prize: ShowroomScratchPrize | null;
  entryType: ShowroomFootfallType;
  customerLabel: string | null;
  notes: string | null;
  createdAt: Date;
}): ShowroomScratchPlayRecord {
  return {
    id: row.id,
    monthKey: row.monthKey,
    playNumber: row.playNumber,
    won: row.won,
    prize: row.prize,
    prizeLabel: row.prize ? SHOWROOM_SCRATCH_PRIZE_META[row.prize].label : null,
    entryType: row.entryType,
    customerLabel: row.customerLabel,
    notes: row.notes,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function registerScratchPlay(
  input: ScratchPlayInput,
): Promise<ShowroomScratchPlayRecord> {
  const monthKey = monthKeyNow();
  const month = await ensureLoyaltyMonth(monthKey);
  const playNumber = month.scratchPlays + 1;

  const prizeCounts = await prizeCountsForMonth(monthKey);
  const underWinCap = month.scratchWins < month.scratchMaxWins;
  const winsSlot = playNumber % month.scratchWinEveryN === 0;

  let won = false;
  let prize: ShowroomScratchPrize | null = null;

  if (underWinCap && winsSlot) {
    prize = pickPrize(prizeCounts);
    won = prize != null;
  }

  const row = await prisma.$transaction(async (tx) => {
    const play = await tx.showroomScratchPlay.create({
      data: {
        monthKey,
        playNumber,
        won,
        prize: won ? prize : null,
        entryType: input.entryType,
        customerLabel: input.customerLabel ?? null,
        notes: input.notes ?? null,
      },
    });

    await tx.showroomLoyaltyMonth.update({
      where: { monthKey },
      data: {
        scratchPlays: { increment: 1 },
        ...(won ? { scratchWins: { increment: 1 } } : {}),
      },
    });

    return play;
  });

  return mapScratch(row);
}

export async function createStampCardForAdmin(
  input: StampCardCreateInput,
): Promise<ShowroomStampCardRecord> {
  const cardCode = await nextCardCode();
  const row = await prisma.showroomStampCard.create({
    data: {
      cardCode,
      customerName: input.customerName,
      contactHint: input.contactHint ?? null,
      stampsRequired: input.stampsRequired,
      notes: input.notes ?? null,
    },
  });
  return mapStampCard(row);
}

function mapStampCard(row: {
  id: string;
  cardCode: string;
  customerName: string;
  contactHint: string | null;
  stampsRequired: number;
  stampsCount: number;
  status: "ACTIVE" | "COMPLETED" | "REDEEMED";
  completedAt: Date | null;
  redeemedAt: Date | null;
  notes: string | null;
}): ShowroomStampCardRecord {
  return {
    id: row.id,
    cardCode: row.cardCode,
    customerName: row.customerName,
    contactHint: row.contactHint,
    stampsRequired: row.stampsRequired,
    stampsCount: row.stampsCount,
    status: row.status,
    completedAt: row.completedAt?.toISOString() ?? null,
    redeemedAt: row.redeemedAt?.toISOString() ?? null,
    notes: row.notes,
  };
}

export async function addStampToCard(cardId: string, notes?: string): Promise<ShowroomStampCardRecord> {
  const card = await prisma.showroomStampCard.findUnique({ where: { id: cardId } });
  if (!card) throw new Error("Tarjeta no encontrada");
  if (card.status !== "ACTIVE") throw new Error("La tarjeta ya está completada o canjeada");

  const newCount = card.stampsCount + 1;
  const completed = newCount >= card.stampsRequired;

  const row = await prisma.$transaction(async (tx) => {
    await tx.showroomStampEvent.create({
      data: {
        cardId,
        eventDate: parseDateOnly(new Date().toISOString().slice(0, 10)),
        notes: notes ?? null,
      },
    });

    const updated = await tx.showroomStampCard.update({
      where: { id: cardId },
      data: {
        stampsCount: newCount,
        ...(completed
          ? { status: "COMPLETED", completedAt: new Date() }
          : {}),
      },
    });

    if (completed) {
      const monthKey = monthKeyNow();
      await ensureLoyaltyMonth(monthKey);
      await tx.showroomLoyaltyMonth.update({
        where: { monthKey },
        data: { stampCardsCompleted: { increment: 1 } },
      });
    }

    return updated;
  });

  return mapStampCard(row);
}

export async function redeemStampCard(cardId: string): Promise<ShowroomStampCardRecord> {
  const card = await prisma.showroomStampCard.findUnique({ where: { id: cardId } });
  if (!card) throw new Error("Tarjeta no encontrada");
  if (card.status !== "COMPLETED") throw new Error("La tarjeta aún no está completa");

  const row = await prisma.showroomStampCard.update({
    where: { id: cardId },
    data: { status: "REDEEMED", redeemedAt: new Date() },
  });
  return mapStampCard(row);
}

export async function listStampCardsForAdmin(limit = 30): Promise<ShowroomStampCardRecord[]> {
  const rows = await prisma.showroomStampCard.findMany({
    orderBy: { updatedAt: "desc" },
    take: limit,
  });
  return rows.map(mapStampCard);
}

export async function findStampCardsByQuery(q: string): Promise<ShowroomStampCardRecord[]> {
  const term = q.trim();
  if (!term) return listStampCardsForAdmin(20);
  const rows = await prisma.showroomStampCard.findMany({
    where: {
      OR: [
        { customerName: { contains: term, mode: "insensitive" } },
        { cardCode: { contains: term, mode: "insensitive" } },
        { contactHint: { contains: term, mode: "insensitive" } },
      ],
    },
    orderBy: { updatedAt: "desc" },
    take: 20,
  });
  return rows.map(mapStampCard);
}

export async function joinShowroomClub(input: ClubJoinInput): Promise<ShowroomClubMemberRecord> {
  const monthKey = monthKeyNow();
  await ensureLoyaltyMonth(monthKey);

  const prefix = provenancePromoPrefix(input.originGroup);
  const promoCode = `${prefix}-${randomPromoSuffix()}`;

  const row = await prisma.$transaction(async (tx) => {
    const member = await tx.showroomClubMember.create({
      data: {
        name: input.name,
        contact: input.contact,
        channel: input.channel,
        originGroup: input.originGroup ?? null,
        promoCode,
        birthday: input.birthday ? parseDateOnly(input.birthday) : null,
        notes: input.notes ?? null,
      },
    });

    await tx.showroomLoyaltyMonth.update({
      where: { monthKey },
      data: { clubJoins: { increment: 1 } },
    });

    return member;
  });

  return mapClubMember(row);
}

function mapClubMember(row: {
  id: string;
  name: string;
  contact: string;
  channel: string;
  originGroup: ShowroomOriginGroup | null;
  promoCode: string | null;
  birthday: Date | null;
  isActive: boolean;
  joinedAt: Date;
}): ShowroomClubMemberRecord {
  return {
    id: row.id,
    name: row.name,
    contact: row.contact,
    channel: row.channel,
    originGroup: row.originGroup,
    promoCode: row.promoCode,
    birthday: row.birthday ? row.birthday.toISOString().slice(0, 10) : null,
    isActive: row.isActive,
    joinedAt: row.joinedAt.toISOString(),
  };
}

export async function listClubMembersForAdmin(limit = 40): Promise<ShowroomClubMemberRecord[]> {
  const rows = await prisma.showroomClubMember.findMany({
    where: { isActive: true },
    orderBy: { joinedAt: "desc" },
    take: limit,
  });
  return rows.map(mapClubMember);
}

export async function registerReferral(input: ReferralCreateInput): Promise<ShowroomReferralRecord> {
  const monthKey = monthKeyNow();
  await ensureLoyaltyMonth(monthKey);

  const row = await prisma.$transaction(async (tx) => {
    const ref = await tx.showroomReferral.create({
      data: {
        referrerName: input.referrerName,
        referredName: input.referredName,
        referredPurchased: input.referredPurchased,
        rewardGiven: input.rewardGiven,
        eventDate: parseDateOnly(new Date().toISOString().slice(0, 10)),
        notes: input.notes ?? null,
      },
    });

    if (input.rewardGiven) {
      await tx.showroomLoyaltyMonth.update({
        where: { monthKey },
        data: { referralsRewarded: { increment: 1 } },
      });
    }

    return ref;
  });

  return mapReferral(row);
}

function mapReferral(row: {
  id: string;
  referrerName: string;
  referredName: string;
  referredPurchased: boolean;
  rewardGiven: boolean;
  eventDate: Date;
  notes: string | null;
}): ShowroomReferralRecord {
  return {
    id: row.id,
    referrerName: row.referrerName,
    referredName: row.referredName,
    referredPurchased: row.referredPurchased,
    rewardGiven: row.rewardGiven,
    eventDate: row.eventDate.toISOString().slice(0, 10),
    notes: row.notes,
  };
}

export async function listReferralsForAdmin(limit = 30): Promise<ShowroomReferralRecord[]> {
  const rows = await prisma.showroomReferral.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
  });
  return rows.map(mapReferral);
}

export async function markReferralRewarded(id: string): Promise<ShowroomReferralRecord> {
  const existing = await prisma.showroomReferral.findUnique({ where: { id } });
  if (!existing) throw new Error("Referido no encontrado");
  if (existing.rewardGiven) return mapReferral(existing);

  const monthKey = monthKeyNow();
  const row = await prisma.$transaction(async (tx) => {
    const ref = await tx.showroomReferral.update({
      where: { id },
      data: { rewardGiven: true },
    });
    await ensureLoyaltyMonth(monthKey);
    await tx.showroomLoyaltyMonth.update({
      where: { monthKey },
      data: { referralsRewarded: { increment: 1 } },
    });
    return ref;
  });
  return mapReferral(row);
}

export async function listRecentScratchPlays(limit = 20): Promise<ShowroomScratchPlayRecord[]> {
  const rows = await prisma.showroomScratchPlay.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
  });
  return rows.map(mapScratch);
}

export async function getShowroomLoyaltySummary(monthKey?: string): Promise<ShowroomLoyaltySummary> {
  const key = monthKey ?? monthKeyNow();
  await ensureLoyaltyMonth(key);

  const [month, stampActive, stampCompleted, stampRedeemed, clubActive, clubMonth, referralsPending, referralsRewarded, prizeGroups] =
    await Promise.all([
      prisma.showroomLoyaltyMonth.findUniqueOrThrow({ where: { monthKey: key } }),
      prisma.showroomStampCard.count({ where: { status: "ACTIVE" } }),
      prisma.showroomStampCard.count({ where: { status: "COMPLETED" } }),
      prisma.showroomStampCard.count({ where: { status: "REDEEMED" } }),
      prisma.showroomClubMember.count({ where: { isActive: true } }),
      prisma.showroomClubMember.count({
        where: {
          isActive: true,
          joinedAt: {
            gte: parseDateOnly(`${key}-01`),
            lt: new Date(parseDateOnly(`${key}-01`).getTime() + 32 * 86_400_000),
          },
        },
      }),
      prisma.showroomReferral.count({ where: { rewardGiven: false, referredPurchased: true } }),
      prisma.showroomReferral.count({ where: { rewardGiven: true } }),
      prisma.showroomScratchPlay.groupBy({
        by: ["prize"],
        where: { monthKey: key, won: true, prize: { not: null } },
        _count: { prize: true },
      }),
    ]);

  const prizesByType = prizeGroups
    .filter((g) => g.prize)
    .map((g) => ({
      prize: g.prize as ShowroomScratchPrize,
      label: SHOWROOM_SCRATCH_PRIZE_META[g.prize as ShowroomScratchPrize].label,
      count: g._count.prize,
    }))
    .sort((a, b) => b.count - a.count);

  return {
    monthKey: key,
    scratchPlays: month.scratchPlays,
    scratchWins: month.scratchWins,
    scratchWinRatePct:
      month.scratchPlays > 0
        ? Math.round((month.scratchWins / month.scratchPlays) * 1000) / 10
        : 0,
    stampCardsActive: stampActive,
    stampCardsCompleted: stampCompleted,
    stampCardsRedeemed: stampRedeemed,
    clubMembersActive: clubActive,
    clubJoinsThisMonth: clubMonth,
    referralsPending,
    referralsRewarded,
    prizesByType,
  };
}

export async function updateLoyaltyMonthSettings(input: {
  monthKey: string;
  scratchWinEveryN?: number;
  scratchMaxWins?: number;
  notes?: string;
}) {
  await prisma.showroomLoyaltyMonth.upsert({
    where: { monthKey: input.monthKey },
    create: {
      monthKey: input.monthKey,
      scratchWinEveryN: input.scratchWinEveryN ?? 5,
      scratchMaxWins: input.scratchMaxWins ?? 40,
      notes: input.notes ?? null,
    },
    update: {
      ...(input.scratchWinEveryN != null ? { scratchWinEveryN: input.scratchWinEveryN } : {}),
      ...(input.scratchMaxWins != null ? { scratchMaxWins: input.scratchMaxWins } : {}),
      ...(input.notes !== undefined ? { notes: input.notes ?? null } : {}),
    },
  });
}

export { SHOWROOM_SCRATCH_PRIZE_META };
