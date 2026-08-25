import { z } from "zod";

const optionalString = z
  .union([z.string(), z.literal(""), z.null(), z.undefined()])
  .transform((v) => {
    if (v == null || v === "") return undefined;
    return String(v).trim() || undefined;
  });

const boolField = z
  .union([z.boolean(), z.string(), z.number()])
  .transform((v) => v === true || v === "true" || v === "on" || v === 1 || v === "1");

export const SHOWROOM_FOOTFALL_TYPES = ["VISIT", "PURCHASE"] as const;
export const SHOWROOM_ORIGIN_GROUPS = [
  "LOCAL",
  "ZAMORA",
  "CASTILLA_LEON",
  "MADRID",
  "OTRAS_CCAA",
  "EXTRANJERO",
  "NO_INDICADO",
] as const;
export const SHOWROOM_DISCOVERY_CHANNELS = [
  "LODGING",
  "PASSING_BY",
  "SOCIAL",
  "REFERRAL",
  "OTHER",
] as const;

export type ShowroomFootfallType = (typeof SHOWROOM_FOOTFALL_TYPES)[number];
export type ShowroomOriginGroup = (typeof SHOWROOM_ORIGIN_GROUPS)[number];
export type ShowroomDiscoveryChannel = (typeof SHOWROOM_DISCOVERY_CHANNELS)[number];

export const SHOWROOM_ORIGIN_GROUP_LABELS: Record<ShowroomOriginGroup, string> = {
  LOCAL: "Local (Villardeciervos y muy cerca)",
  ZAMORA: "Zamora provincia",
  CASTILLA_LEON: "Castilla y León",
  MADRID: "Madrid y alrededores",
  OTRAS_CCAA: "Otras CCAA",
  EXTRANJERO: "Extranjero",
  NO_INDICADO: "No indicado",
};

export const SHOWROOM_FOOTFALL_TYPE_LABELS: Record<ShowroomFootfallType, string> = {
  VISIT: "Visita",
  PURCHASE: "Compra",
};

export const SHOWROOM_DISCOVERY_CHANNEL_LABELS: Record<ShowroomDiscoveryChannel, string> = {
  LODGING: "Alojamiento",
  PASSING_BY: "Pasaba / de paso",
  SOCIAL: "Redes sociales",
  REFERRAL: "Recomendación",
  OTHER: "Otro",
};

export const showroomFootfallCreateSchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha YYYY-MM-DD")
    .optional(),
  entryType: z.enum(SHOWROOM_FOOTFALL_TYPES),
  originGroup: z.enum(SHOWROOM_ORIGIN_GROUPS).default("NO_INDICADO"),
  localityDetail: optionalString,
  discoveryChannel: z
    .union([z.enum(SHOWROOM_DISCOVERY_CHANNELS), z.literal(""), z.null(), z.undefined()])
    .transform((v) => (v == null || v === "" ? undefined : v)),
  contactCaptured: boolField.optional().default(false),
  notes: optionalString,
  syncDailyStat: boolField.optional().default(true),
});

export type ShowroomFootfallCreateInput = z.infer<typeof showroomFootfallCreateSchema>;

export const showroomFootfallListSchema = z.object({
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  limit: z.coerce.number().int().min(1).max(500).optional().default(100),
});
