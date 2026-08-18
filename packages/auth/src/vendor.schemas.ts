import { z } from "zod";

export const slugSchema = z
  .string()
  .trim()
  .min(3)
  .max(120)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug invalido");

export const vendorProfileSchema = z.object({
  tradeName: z.string().trim().min(2).max(200),
  legalName: z.string().trim().min(2).max(200).optional(),
  taxId: z.string().trim().min(3).max(20).optional(),
  description: z.string().trim().max(5000).optional(),
  history: z.string().trim().max(5000).optional(),
  street: z.string().trim().max(200).optional(),
  city: z.string().trim().max(100).optional(),
  province: z.string().trim().max(100).optional(),
  postalCode: z.string().trim().max(10).optional(),
  country: z.string().trim().length(2).default("ES"),
  phone: z.string().trim().max(30).optional(),
  email: z.string().trim().email().max(255).optional(),
  website: z.string().trim().url().max(500).optional().or(z.literal("")),
  socialLinks: z
    .object({
      instagram: z.string().url().optional(),
      facebook: z.string().url().optional(),
      x: z.string().url().optional(),
    })
    .partial()
    .optional(),
  logoUrl: z.string().url().max(500).optional(),
});

export const vendorApplySchema = vendorProfileSchema;

export const vendorUpdateSchema = vendorProfileSchema.partial();

export const vendorStatusUpdateSchema = z.object({
  status: z.enum(["ACTIVE", "SUSPENDED", "REJECTED", "PENDING_REVIEW", "DRAFT"]),
  reviewNotes: z.string().trim().max(2000).optional(),
});

export type VendorApplyInput = z.infer<typeof vendorApplySchema>;
export type VendorUpdateInput = z.infer<typeof vendorUpdateSchema>;
export type VendorStatusUpdateInput = z.infer<typeof vendorStatusUpdateSchema>;
