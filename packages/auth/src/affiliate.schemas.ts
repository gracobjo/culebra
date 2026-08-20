import { z } from "zod";

export const affiliateUpsertSchema = z.object({
  code: z
    .string()
    .trim()
    .min(2)
    .max(40)
    .transform((value) => value.toUpperCase().replace(/\s+/g, "")),
  label: z.string().trim().min(2).max(120),
  accommodationId: z.string().trim().min(1).optional().or(z.literal("")),
  isActive: z.boolean().default(true),
  notes: z.string().trim().max(2000).optional(),
});

export const affiliateRefSchema = z.object({
  code: z
    .string()
    .trim()
    .min(2)
    .max(40)
    .transform((value) => value.toUpperCase().replace(/\s+/g, "")),
});

export type AffiliateUpsertInput = z.infer<typeof affiliateUpsertSchema>;
export type AffiliateRefInput = z.infer<typeof affiliateRefSchema>;
