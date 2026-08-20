import { z } from "zod";

export const couponDiscountTypeSchema = z.enum(["PERCENTAGE", "FIXED"]);

export const couponUpsertSchema = z.object({
  code: z
    .string()
    .trim()
    .min(3)
    .max(40)
    .transform((value) => value.toUpperCase().replace(/\s+/g, "")),
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().max(2000).optional(),
  discountType: couponDiscountTypeSchema,
  discountValue: z.coerce.number().positive().max(100000),
  minOrderAmount: z.coerce.number().min(0).max(100000).optional(),
  maxRedemptions: z.coerce.number().int().min(1).max(1_000_000).optional(),
  startsAt: z.coerce.date().optional(),
  endsAt: z.coerce.date().optional(),
  isActive: z.boolean().default(true),
});

export const applyCouponSchema = z.object({
  code: z
    .string()
    .trim()
    .min(3)
    .max(40)
    .transform((value) => value.toUpperCase().replace(/\s+/g, "")),
});

export type CouponUpsertInput = z.infer<typeof couponUpsertSchema>;
export type ApplyCouponInput = z.infer<typeof applyCouponSchema>;
