import { z } from "zod";

const urlOrEmpty = z
  .union([z.string().trim().max(500).url(), z.literal("")])
  .optional()
  .transform((v) => (v === "" ? undefined : v));

export const siteSocialLinksUpsertSchema = z.object({
  facebookUrl: urlOrEmpty.optional(),
  instagramUrl: urlOrEmpty.optional(),
  whatsappUrl: urlOrEmpty.optional(),
});

export type SiteSocialLinksUpsertInput = z.infer<typeof siteSocialLinksUpsertSchema>;

