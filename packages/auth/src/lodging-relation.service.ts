import {
  LodgingCollabModality,
  LodgingRelationEventType,
  LodgingRelationStatus,
  LodgingWelcomeMode,
} from "@culebra/domain";
import { prisma } from "@culebra/db";
import type {
  LodgingOfferContactsInput,
  LodgingRelationEventInput,
  LodgingRelationUpsertInput,
} from "./lodging-relation.schemas.js";

export type LodgingRelationRecord = {
  id: string;
  accommodationId: string | null;
  accommodationName: string | null;
  name: string;
  contactPerson: string | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  city: string | null;
  distanceMinutes: number | null;
  rating: string | null;
  status: LodgingRelationStatus;
  collabLevel: number;
  primaryModality: LodgingCollabModality | null;
  modalities: LodgingCollabModality[];
  welcomeMode: LodgingWelcomeMode | null;
  welcomeSpecialPrice: string | null;
  referralThreshold: number;
  referredClientsCount: number;
  thankYouGiftsSent: number;
  basketsViaCount: number;
  showroomVisitsAttributed: number;
  onlineOrdersAttributed: number;
  materialPlacedAt: Date | null;
  agreementAcceptedAt: Date | null;
  agreementNotes: string | null;
  nextFollowUpAt: Date | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  giftsDue: number;
};

export type LodgingRelationEventRecord = {
  id: string;
  relationId: string;
  type: LodgingRelationEventType;
  quantity: number | null;
  amount: string | null;
  note: string | null;
  occurredAt: Date;
  createdAt: Date;
};

export type LodgingOfferContactsRecord = {
  whatsapp: string | null;
  phone: string | null;
  email: string | null;
  websiteUrl: string | null;
  contactPerson: string | null;
  showroomAddress: string | null;
};

function emptyToNull(value?: string | null) {
  if (value == null || value === "") return null;
  return value;
}

function parseModalities(json: string): LodgingCollabModality[] {
  try {
    const parsed = JSON.parse(json) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (v): v is LodgingCollabModality =>
        typeof v === "string" && v in LodgingCollabModality,
    );
  } catch {
    return [];
  }
}

function mapRelation(row: {
  id: string;
  accommodationId: string | null;
  name: string;
  contactPerson: string | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  city: string | null;
  distanceMinutes: number | null;
  rating: { toString(): string } | null;
  status: string;
  collabLevel: number;
  primaryModality: string | null;
  modalitiesJson: string;
  welcomeMode: string | null;
  welcomeSpecialPrice: { toString(): string } | null;
  referralThreshold: number;
  referredClientsCount: number;
  thankYouGiftsSent: number;
  basketsViaCount: number;
  showroomVisitsAttributed: number;
  onlineOrdersAttributed: number;
  materialPlacedAt: Date | null;
  agreementAcceptedAt: Date | null;
  agreementNotes: string | null;
  nextFollowUpAt: Date | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  accommodation?: { name: string } | null;
}): LodgingRelationRecord {
  const threshold = Math.max(1, row.referralThreshold);
  const giftsDue = Math.max(
    0,
    Math.floor(row.referredClientsCount / threshold) - row.thankYouGiftsSent,
  );
  return {
    id: row.id,
    accommodationId: row.accommodationId,
    accommodationName: row.accommodation?.name ?? null,
    name: row.name,
    contactPerson: row.contactPerson,
    phone: row.phone,
    whatsapp: row.whatsapp,
    email: row.email,
    city: row.city,
    distanceMinutes: row.distanceMinutes,
    rating: row.rating?.toString() ?? null,
    status: row.status as LodgingRelationStatus,
    collabLevel: row.collabLevel,
    primaryModality: (row.primaryModality as LodgingCollabModality | null) ?? null,
    modalities: parseModalities(row.modalitiesJson),
    welcomeMode: (row.welcomeMode as LodgingWelcomeMode | null) ?? null,
    welcomeSpecialPrice: row.welcomeSpecialPrice?.toString() ?? null,
    referralThreshold: row.referralThreshold,
    referredClientsCount: row.referredClientsCount,
    thankYouGiftsSent: row.thankYouGiftsSent,
    basketsViaCount: row.basketsViaCount,
    showroomVisitsAttributed: row.showroomVisitsAttributed,
    onlineOrdersAttributed: row.onlineOrdersAttributed,
    materialPlacedAt: row.materialPlacedAt,
    agreementAcceptedAt: row.agreementAcceptedAt,
    agreementNotes: row.agreementNotes,
    nextFollowUpAt: row.nextFollowUpAt,
    notes: row.notes,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    giftsDue,
  };
}

export async function listLodgingRelationsForAdmin(): Promise<LodgingRelationRecord[]> {
  const items = await prisma.lodgingPartnerRelation.findMany({
    include: { accommodation: { select: { name: true } } },
    orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
  });
  return items.map(mapRelation);
}

export async function getLodgingRelationById(
  id: string,
): Promise<(LodgingRelationRecord & { events: LodgingRelationEventRecord[] }) | null> {
  const row = await prisma.lodgingPartnerRelation.findUnique({
    where: { id },
    include: {
      accommodation: { select: { name: true } },
      events: { orderBy: { occurredAt: "desc" }, take: 80 },
    },
  });
  if (!row) return null;
  return {
    ...mapRelation(row),
    events: row.events.map((e) => ({
      id: e.id,
      relationId: e.relationId,
      type: e.type as LodgingRelationEventType,
      quantity: e.quantity,
      amount: e.amount?.toString() ?? null,
      note: e.note,
      occurredAt: e.occurredAt,
      createdAt: e.createdAt,
    })),
  };
}

export type LodgingCrmSummary = {
  total: number;
  byStatus: Record<string, number>;
  withMaterial: number;
  active: number;
  referredClients: number;
  basketsVia: number;
  giftsDue: number;
  agreements: number;
};

export function summarizeLodgingCrm(items: LodgingRelationRecord[]): LodgingCrmSummary {
  const byStatus: Record<string, number> = {};
  for (const item of items) {
    byStatus[item.status] = (byStatus[item.status] ?? 0) + 1;
  }
  return {
    total: items.length,
    byStatus,
    withMaterial: items.filter(
      (i) => i.materialPlacedAt || i.status === "MATERIAL_PLACED" || i.status === "ACTIVE",
    ).length,
    active: items.filter((i) => i.status === "ACTIVE").length,
    referredClients: items.reduce((s, i) => s + i.referredClientsCount, 0),
    basketsVia: items.reduce((s, i) => s + i.basketsViaCount, 0),
    giftsDue: items.reduce((s, i) => s + i.giftsDue, 0),
    agreements: items.filter((i) => i.agreementAcceptedAt).length,
  };
}

export async function getLodgingCrmSummary(): Promise<LodgingCrmSummary> {
  const items = await listLodgingRelationsForAdmin();
  return summarizeLodgingCrm(items);
}

export async function upsertLodgingRelationForAdmin(
  input: LodgingRelationUpsertInput,
): Promise<LodgingRelationRecord> {
  const modalities = input.modalities ?? [];
  const modalitiesJson = JSON.stringify(modalities);
  const primaryModality =
    input.primaryModality ?? (modalities.length > 0 ? modalities[0] : null);
  const nextFollowUpAt = input.nextFollowUpAt
    ? new Date(input.nextFollowUpAt)
    : null;

  const existing = input.id
    ? await prisma.lodgingPartnerRelation.findUnique({ where: { id: input.id } })
    : null;

  const firstAgreement = Boolean(input.agreementAccepted && !existing?.agreementAcceptedAt);
  const firstMaterial = Boolean(input.materialPlaced && !existing?.materialPlacedAt);

  const data = {
    accommodationId: emptyToNull(input.accommodationId),
    name: input.name.trim(),
    contactPerson: emptyToNull(input.contactPerson),
    phone: emptyToNull(input.phone),
    whatsapp: emptyToNull(input.whatsapp),
    email: emptyToNull(input.email),
    city: emptyToNull(input.city),
    distanceMinutes: input.distanceMinutes ?? null,
    rating: input.rating ?? null,
    status: input.status,
    collabLevel: input.collabLevel,
    primaryModality,
    modalitiesJson,
    welcomeMode: input.welcomeMode ?? null,
    welcomeSpecialPrice: input.welcomeSpecialPrice ?? null,
    referralThreshold: input.referralThreshold,
    notes: emptyToNull(input.notes),
    nextFollowUpAt:
      nextFollowUpAt && !Number.isNaN(nextFollowUpAt.getTime())
        ? nextFollowUpAt
        : null,
    agreementNotes: emptyToNull(input.agreementNotes),
    ...(firstMaterial
      ? {
          materialPlacedAt: new Date(),
          status:
            input.status === "PROSPECT" || input.status === "CONTACTED"
              ? "MATERIAL_PLACED"
              : input.status,
        }
      : {}),
    ...(firstAgreement
      ? { agreementAcceptedAt: new Date(), status: "ACTIVE" as const }
      : {}),
  };

  const row = input.id
    ? await prisma.lodgingPartnerRelation.update({
        where: { id: input.id },
        data,
        include: { accommodation: { select: { name: true } } },
      })
    : await prisma.lodgingPartnerRelation.create({
        data,
        include: { accommodation: { select: { name: true } } },
      });

  if (firstAgreement) {
    await prisma.lodgingRelationEvent.create({
      data: {
        relationId: row.id,
        type: LodgingRelationEventType.AGREEMENT,
        note: input.id ? "Aceptación de colaboración registrada" : "Alta con aceptación de colaboración",
      },
    });
  }

  return mapRelation(row);
}

export async function addLodgingRelationEventForAdmin(
  input: LodgingRelationEventInput,
): Promise<LodgingRelationRecord> {
  const relation = await prisma.lodgingPartnerRelation.findUnique({
    where: { id: input.relationId },
  });
  if (!relation) {
    throw new Error("Relación no encontrada");
  }

  const qty = input.quantity ?? 1;
  const counters: {
    referredClientsCount?: number;
    basketsViaCount?: number;
    thankYouGiftsSent?: number;
    showroomVisitsAttributed?: number;
    onlineOrdersAttributed?: number;
    materialPlacedAt?: Date;
    status?: LodgingRelationStatus;
  } = {};

  if (input.type === LodgingRelationEventType.REFERRAL) {
    counters.referredClientsCount = relation.referredClientsCount + qty;
    counters.showroomVisitsAttributed = relation.showroomVisitsAttributed + qty;
  }
  if (input.type === LodgingRelationEventType.BASKET) {
    counters.basketsViaCount = relation.basketsViaCount + qty;
  }
  if (input.type === LodgingRelationEventType.THANK_YOU_GIFT) {
    counters.thankYouGiftsSent = relation.thankYouGiftsSent + qty;
  }
  if (input.type === LodgingRelationEventType.MATERIAL) {
    counters.materialPlacedAt = relation.materialPlacedAt ?? new Date();
    if (relation.status === "PROSPECT" || relation.status === "CONTACTED") {
      counters.status = LodgingRelationStatus.MATERIAL_PLACED;
    }
  }
  if (input.type === LodgingRelationEventType.AGREEMENT) {
    counters.status = LodgingRelationStatus.ACTIVE;
  }

  await prisma.$transaction([
    prisma.lodgingRelationEvent.create({
      data: {
        relationId: input.relationId,
        type: input.type,
        quantity: qty,
        amount: input.amount ?? null,
        note: emptyToNull(input.note),
      },
    }),
    prisma.lodgingPartnerRelation.update({
      where: { id: input.relationId },
      data: {
        ...counters,
        ...(input.type === LodgingRelationEventType.AGREEMENT
          ? { agreementAcceptedAt: new Date() }
          : {}),
      },
    }),
  ]);

  const updated = await getLodgingRelationById(input.relationId);
  if (!updated) throw new Error("Relación no encontrada tras evento");
  return updated;
}

export async function getLodgingOfferContacts(): Promise<LodgingOfferContactsRecord> {
  const row = await prisma.siteLodgingOfferContacts.findUnique({ where: { id: 1 } });
  return {
    whatsapp: row?.whatsapp ?? null,
    phone: row?.phone ?? null,
    email: row?.email ?? null,
    websiteUrl: row?.websiteUrl ?? null,
    contactPerson: row?.contactPerson ?? null,
    showroomAddress: row?.showroomAddress ?? "Villardeciervos (Zamora)",
  };
}

export async function upsertLodgingOfferContacts(
  input: LodgingOfferContactsInput,
): Promise<LodgingOfferContactsRecord> {
  const row = await prisma.siteLodgingOfferContacts.upsert({
    where: { id: 1 },
    create: {
      id: 1,
      whatsapp: emptyToNull(input.whatsapp),
      phone: emptyToNull(input.phone),
      email: emptyToNull(input.email),
      websiteUrl: emptyToNull(input.websiteUrl),
      contactPerson: emptyToNull(input.contactPerson),
      showroomAddress: emptyToNull(input.showroomAddress) ?? "Villardeciervos (Zamora)",
    },
    update: {
      whatsapp: emptyToNull(input.whatsapp),
      phone: emptyToNull(input.phone),
      email: emptyToNull(input.email),
      websiteUrl: emptyToNull(input.websiteUrl),
      contactPerson: emptyToNull(input.contactPerson),
      showroomAddress: emptyToNull(input.showroomAddress) ?? "Villardeciervos (Zamora)",
    },
  });
  return {
    whatsapp: row.whatsapp,
    phone: row.phone,
    email: row.email,
    websiteUrl: row.websiteUrl,
    contactPerson: row.contactPerson,
    showroomAddress: row.showroomAddress,
  };
}
