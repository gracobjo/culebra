import { z } from "zod";

export const AFFILIATE_PARTNER_TYPES = [
  "LODGING",
  "PRODUCER",
  "CREATOR",
  "GUIDE",
  "AMBASSADOR",
  "PARTNER_SHOP",
] as const;

export const AFFILIATE_PROGRAM_STATUSES = ["PENDING", "ACTIVE", "SUSPENDED"] as const;

export const AFFILIATE_COMMISSION_TYPES = [
  "ONLINE_ORDER",
  "BASKET_SALE",
  "SHOWROOM_SALE",
] as const;

export const affiliateUpsertSchema = z.object({
  code: z
    .string()
    .trim()
    .min(2)
    .max(40)
    .transform((value) => value.toUpperCase().replace(/\s+/g, "")),
  label: z.string().trim().min(2).max(120),
  affiliateType: z.enum(AFFILIATE_PARTNER_TYPES).default("LODGING"),
  commissionPct: z.coerce.number().min(0).max(10).default(10),
  accommodationId: z.string().trim().min(1).optional().or(z.literal("")),
  vendorId: z.string().trim().min(1).optional().or(z.literal("")),
  contactEmail: z.string().trim().email().optional().or(z.literal("")),
  contactPhone: z.string().trim().max(40).optional().or(z.literal("")),
  cookieDays: z.coerce.number().int().min(15).max(30).default(30),
  payoutMinimum: z.coerce.number().min(0).max(9999).default(30),
  programStatus: z.enum(AFFILIATE_PROGRAM_STATUSES).default("ACTIVE"),
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

export const manualShowroomCommissionSchema = z.object({
  affiliateId: z.string().trim().min(1),
  baseAmount: z.coerce.number().positive().max(99999),
  commissionPct: z.coerce.number().min(0).max(10).optional(),
  notes: z.string().trim().max(500).optional(),
});

export const markAffiliatePayoutSchema = z.object({
  affiliateId: z.string().trim().min(1),
  commissionIds: z.array(z.string().trim().min(1)).min(1),
  payoutNote: z.string().trim().max(200).optional(),
});

export type AffiliateUpsertInput = z.infer<typeof affiliateUpsertSchema>;
export type AffiliateRefInput = z.infer<typeof affiliateRefSchema>;
export type ManualShowroomCommissionInput = z.infer<typeof manualShowroomCommissionSchema>;
export type MarkAffiliatePayoutInput = z.infer<typeof markAffiliatePayoutSchema>;
