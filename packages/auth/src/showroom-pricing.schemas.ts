import { z } from "zod";

export const SHOWROOM_PRICE_KINDS = [
  "BASKET",
  "PACKAGING_UNIT",
  "MERCH",
  "EXPERIENCE",
] as const;

export const showroomPriceItemUpdateSchema = z.object({
  id: z.string().trim().min(1),
  label: z.string().trim().min(1).max(120).optional(),
  costEur: z.coerce.number().min(0).max(99999).nullable().optional(),
  pvpEur: z.coerce.number().min(0).max(99999).nullable().optional(),
  notes: z.string().trim().max(2000).nullable().optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.coerce.number().int().min(0).max(9999).optional(),
});

export const showroomPriceBulkUpdateSchema = z.object({
  items: z.array(showroomPriceItemUpdateSchema).min(1).max(80),
});

export type ShowroomPriceItemUpdateInput = z.infer<typeof showroomPriceItemUpdateSchema>;
export type ShowroomPriceBulkUpdateInput = z.infer<typeof showroomPriceBulkUpdateSchema>;
