import { z } from "zod";

export const lodgingRelationStatusSchema = z.enum([
  "PROSPECT",
  "CONTACTED",
  "MATERIAL_PLACED",
  "ACTIVE",
  "PAUSED",
  "ENDED",
]);

export const lodgingCollabModalitySchema = z.enum([
  "PRESENCE_RECOMMEND",
  "WELCOME_BASKET",
  "COMMISSION_SALE",
  "NIGHT_PACK",
]);

export const lodgingWelcomeModeSchema = z.enum(["SPECIAL_PRICE", "CONSIGNMENT"]);

export const lodgingRelationEventTypeSchema = z.enum([
  "CONTACT",
  "MATERIAL",
  "REFERRAL",
  "BASKET",
  "THANK_YOU_GIFT",
  "COMMISSION",
  "AGREEMENT",
  "NOTE",
  "STATUS_CHANGE",
]);

const optionalString = z
  .union([z.string(), z.literal(""), z.null(), z.undefined()])
  .transform((v) => {
    if (v == null || v === "") return undefined;
    return String(v).trim() || undefined;
  });

const optionalInt = z
  .union([z.string(), z.number(), z.literal(""), z.null(), z.undefined()])
  .transform((v) => {
    if (v == null || v === "") return undefined;
    const n = typeof v === "number" ? v : Number(v);
    return Number.isFinite(n) ? Math.round(n) : undefined;
  });

const optionalDecimal = z
  .union([z.string(), z.number(), z.literal(""), z.null(), z.undefined()])
  .transform((v) => {
    if (v == null || v === "") return undefined;
    const n = typeof v === "number" ? v : Number(String(v).replace(",", "."));
    return Number.isFinite(n) ? n : undefined;
  });

export const lodgingRelationUpsertSchema = z.object({
  id: optionalString,
  accommodationId: optionalString,
  name: z.string().trim().min(2).max(160),
  contactPerson: optionalString,
  phone: optionalString,
  whatsapp: optionalString,
  email: optionalString,
  city: optionalString,
  distanceMinutes: optionalInt,
  rating: optionalDecimal,
  status: lodgingRelationStatusSchema.default("PROSPECT"),
  collabLevel: z.coerce.number().int().min(1).max(5).default(1),
  primaryModality: lodgingCollabModalitySchema.optional(),
  modalities: z.array(lodgingCollabModalitySchema).default([]),
  welcomeMode: z
    .union([lodgingWelcomeModeSchema, z.literal(""), z.undefined()])
    .optional()
    .transform((v) => (v ? v : undefined)),
  welcomeSpecialPrice: optionalDecimal,
  referralThreshold: z.coerce.number().int().min(3).max(30).default(8),
  notes: optionalString,
  nextFollowUpAt: optionalString,
  agreementAccepted: z.boolean().optional(),
  agreementNotes: optionalString,
  materialPlaced: z.boolean().optional(),
});

export type LodgingRelationUpsertInput = z.infer<typeof lodgingRelationUpsertSchema>;

export const lodgingRelationEventSchema = z.object({
  relationId: z.string().min(1),
  type: lodgingRelationEventTypeSchema,
  quantity: z.coerce.number().int().min(1).max(500).optional().default(1),
  amount: optionalDecimal,
  note: optionalString,
});

export type LodgingRelationEventInput = z.infer<typeof lodgingRelationEventSchema>;

export const lodgingOfferContactsSchema = z.object({
  whatsapp: optionalString,
  phone: optionalString,
  email: optionalString,
  websiteUrl: optionalString,
  contactPerson: optionalString,
  showroomAddress: optionalString,
});

export type LodgingOfferContactsInput = z.infer<typeof lodgingOfferContactsSchema>;
