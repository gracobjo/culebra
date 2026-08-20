import { z } from "zod";

export const addCartItemSchema = z.object({
  productId: z.string().trim().min(1),
  variantId: z.string().trim().min(1).optional(),
  quantity: z.coerce.number().int().min(1).max(99).default(1),
});

export const updateCartItemSchema = z.object({
  itemId: z.string().trim().min(1),
  quantity: z.coerce.number().int().min(0).max(99),
});

export const addressSnapshotSchema = z.object({
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().min(1).max(100),
  street: z.string().trim().min(3).max(200),
  city: z.string().trim().min(1).max(100),
  province: z.string().trim().min(1).max(100),
  postalCode: z.string().trim().min(3).max(10),
  country: z.string().trim().length(2).default("ES"),
  phone: z.string().trim().max(30).optional(),
  taxId: z.string().trim().max(20).optional(),
  company: z.string().trim().max(200).optional(),
});

export const checkoutSchema = z.object({
  customerEmail: z.string().trim().email().max(255),
  customerPhone: z.string().trim().min(6).max(30),
  customerFirstName: z.string().trim().min(1).max(100),
  customerLastName: z.string().trim().min(1).max(100),
  shipping: addressSnapshotSchema,
  billing: addressSnapshotSchema.optional(),
  billingSameAsShipping: z.boolean().optional(),
  notes: z.string().trim().max(2000).optional(),
  couponCode: z
    .string()
    .trim()
    .max(40)
    .optional()
    .transform((value) =>
      value ? value.toUpperCase().replace(/\s+/g, "") : undefined,
    ),
  affiliateCode: z
    .string()
    .trim()
    .max(40)
    .optional()
    .transform((value) =>
      value ? value.toUpperCase().replace(/\s+/g, "") : undefined,
    ),
});

export const applyCartCouponSchema = z.object({
  code: z
    .string()
    .trim()
    .min(3)
    .max(40)
    .transform((value) => value.toUpperCase().replace(/\s+/g, "")),
});

export type AddCartItemInput = z.infer<typeof addCartItemSchema>;
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>;
export type AddressSnapshot = z.infer<typeof addressSnapshotSchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type ApplyCartCouponInput = z.infer<typeof applyCartCouponSchema>;
