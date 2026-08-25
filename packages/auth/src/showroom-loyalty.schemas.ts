import { z } from "zod";
import { SHOWROOM_FOOTFALL_TYPES, SHOWROOM_ORIGIN_GROUPS } from "./showroom-footfall.schemas.js";

const optionalString = z
  .union([z.string(), z.literal(""), z.null(), z.undefined()])
  .transform((v) => {
    if (v == null || v === "") return undefined;
    return String(v).trim() || undefined;
  });

const boolField = z
  .union([z.boolean(), z.string(), z.number()])
  .transform((v) => v === true || v === "true" || v === "on" || v === 1 || v === "1");

export const SHOWROOM_SCRATCH_PRIZES = [
  "MINI_CATA",
  "DISCOUNT_10_TODAY",
  "MIEL_OR_LONCHEADO",
  "BASKET_UPGRADE",
  "TOTE_BAG",
  "BASKET_ESCAPADA",
] as const;

export type ShowroomScratchPrize = (typeof SHOWROOM_SCRATCH_PRIZES)[number];

export const SHOWROOM_SCRATCH_PRIZE_META: Record<
  ShowroomScratchPrize,
  { label: string; cost: string; maxPerMonth: number; weight: number }
> = {
  MINI_CATA: {
    label: "Mini-cata gratis",
    cost: "Muy bajo",
    maxPerMonth: 999,
    weight: 35,
  },
  DISCOUNT_10_TODAY: {
    label: "10 % dto compra del día",
    cost: "Bajo",
    maxPerMonth: 999,
    weight: 28,
  },
  MIEL_OR_LONCHEADO: {
    label: "Miel pequeña o loncheado",
    cost: "Medio",
    maxPerMonth: 30,
    weight: 18,
  },
  BASKET_UPGRADE: {
    label: "Upgrade cesta (Escapada → Comarca)",
    cost: "Medio",
    maxPerMonth: 12,
    weight: 10,
  },
  TOTE_BAG: {
    label: "Tote bag",
    cost: "Medio",
    maxPerMonth: 10,
    weight: 6,
  },
  BASKET_ESCAPADA: {
    label: "Cesta Escapada gratis",
    cost: "Alto",
    maxPerMonth: 2,
    weight: 3,
  },
};

export const SHOWROOM_STAMP_REWARDS = [
  "Tote bag",
  "Mini-cesta",
  "15 % en la siguiente compra",
] as const;

export const SHOWROOM_CLUB_CHANNELS = ["WHATSAPP", "EMAIL", "BOTH"] as const;
export type ShowroomClubChannel = (typeof SHOWROOM_CLUB_CHANNELS)[number];

export const SHOWROOM_CLUB_CHANNEL_LABELS: Record<ShowroomClubChannel, string> = {
  WHATSAPP: "WhatsApp",
  EMAIL: "Email",
  BOTH: "WhatsApp + email",
};

export const scratchPlaySchema = z.object({
  entryType: z.enum(SHOWROOM_FOOTFALL_TYPES),
  customerLabel: optionalString,
  notes: optionalString,
});

export const stampCardCreateSchema = z.object({
  customerName: z.string().trim().min(1).max(120),
  contactHint: optionalString,
  stampsRequired: z.coerce.number().int().min(3).max(12).optional().default(6),
  notes: optionalString,
});

export const stampAddSchema = z.object({
  cardId: z.string().min(1),
  notes: optionalString,
});

export const stampRedeemSchema = z.object({
  cardId: z.string().min(1),
});

export const clubJoinSchema = z.object({
  name: z.string().trim().min(1).max(120),
  contact: z.string().trim().min(3).max(120),
  channel: z.enum(SHOWROOM_CLUB_CHANNELS).default("WHATSAPP"),
  originGroup: z.enum(SHOWROOM_ORIGIN_GROUPS).optional(),
  birthday: optionalString,
  notes: optionalString,
});

export const referralCreateSchema = z.object({
  referrerName: z.string().trim().min(1).max(120),
  referredName: z.string().trim().min(1).max(120),
  referredPurchased: boolField.optional().default(false),
  rewardGiven: boolField.optional().default(false),
  notes: optionalString,
});

export const loyaltyMonthSettingsSchema = z.object({
  monthKey: z.string().regex(/^\d{4}-\d{2}$/),
  scratchWinEveryN: z.coerce.number().int().min(2).max(20).optional(),
  scratchMaxWins: z.coerce.number().int().min(1).max(500).optional(),
  notes: optionalString,
});

export type ScratchPlayInput = z.infer<typeof scratchPlaySchema>;
export type StampCardCreateInput = z.infer<typeof stampCardCreateSchema>;
export type ClubJoinInput = z.infer<typeof clubJoinSchema>;
export type ReferralCreateInput = z.infer<typeof referralCreateSchema>;
