import { z } from "zod";

export const tourismPackStatusSchema = z.enum(["DRAFT", "PUBLISHED", "DISABLED"]);

export const tourismPackItemSchema = z.object({
  productId: z.string().trim().min(1),
  quantity: z.coerce.number().int().min(1).max(99).default(1),
});

export const tourismPackUpsertSchema = z.object({
  name: z.string().trim().min(2).max(200),
  shortDescription: z.string().trim().max(2000).optional(),
  longDescription: z.string().trim().max(20000).optional(),
  accommodationId: z.string().trim().min(1).optional().or(z.literal("")),
  nightsHint: z.string().trim().max(200).optional(),
  imageUrl: z.string().trim().url().max(500).optional().or(z.literal("")),
  status: tourismPackStatusSchema.default("DRAFT"),
  sortOrder: z.coerce.number().int().min(0).max(9999).default(0),
  couponId: z.string().trim().min(1).optional().or(z.literal("")),
  items: z.array(tourismPackItemSchema).min(1).max(20),
});

export type TourismPackUpsertInput = z.infer<typeof tourismPackUpsertSchema>;
