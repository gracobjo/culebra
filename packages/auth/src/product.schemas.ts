import { z } from "zod";

const optionalText = z.string().trim().max(5000).optional();
const optionalShort = z.string().trim().max(500).optional();
const moneySchema = z.coerce.number().positive().max(999999.99);
const optionalMoney = z.coerce.number().positive().max(999999.99).optional();

export const productVariantInputSchema = z.object({
  label: z.string().trim().min(1).max(80),
  sku: z.string().trim().max(80).optional(),
  unit: z.string().trim().max(40).optional(),
  weight: z.coerce.number().positive().max(99999).optional(),
  price: moneySchema,
  previousPrice: optionalMoney,
  stock: z.coerce.number().int().min(0).max(1_000_000).default(0),
  isActive: z.boolean().optional(),
});

export const productImageInputSchema = z.object({
  url: z
    .string()
    .trim()
    .max(500)
    .refine(
      (value) =>
        value.startsWith("/uploads/") || z.string().url().safeParse(value).success,
      { message: "URL de imagen no válida" },
    ),
  altText: z.string().trim().max(200).optional(),
});

export const productCreateSchema = z.object({
  name: z.string().trim().min(2).max(200),
  categoryId: z.string().trim().min(1),
  subcategoryId: z.string().trim().min(1).optional(),
  shortDescription: z.string().trim().max(500).optional(),
  longDescription: optionalText,
  basePrice: moneySchema,
  previousPrice: optionalMoney,
  vatRate: z.coerce.number().min(0).max(100).default(10),
  unit: z.string().trim().max(40).optional(),
  weight: z.coerce.number().positive().max(99999).optional(),
  sku: z.string().trim().max(80).optional(),
  ingredients: optionalText,
  allergens: optionalText,
  conservation: optionalText,
  origin: optionalShort,
  producerInfo: optionalText,
  shippingConditions: optionalText,
  prepTimeDays: z.coerce.number().int().min(0).max(365).optional(),
  stock: z.coerce.number().int().min(0).max(1_000_000).default(0),
  images: z.array(productImageInputSchema).max(10).optional(),
  variants: z.array(productVariantInputSchema).max(20).optional(),
});

export const productUpdateSchema = productCreateSchema.partial();

export const productCommercialUpdateSchema = z.object({
  basePrice: moneySchema.optional(),
  stock: z.coerce.number().int().min(0).max(1_000_000).optional(),
  variants: z
    .array(
      z.object({
        id: z.string().trim().min(1),
        stock: z.coerce.number().int().min(0).max(1_000_000).optional(),
        price: moneySchema.optional(),
      }),
    )
    .optional(),
});

/** @deprecated Use productCommercialUpdateSchema */
export const productStockUpdateSchema = productCommercialUpdateSchema;

export const productStatusUpdateSchema = z.object({
  status: z.enum(["DRAFT", "PENDING_REVIEW", "PUBLISHED", "REJECTED", "DISABLED"]),
  rejectionReason: z.string().trim().max(2000).optional(),
});

export const productCatalogQuerySchema = z.object({
  search: z.string().trim().max(120).optional(),
  categorySlug: z.string().trim().max(120).optional(),
  vendorSlug: z.string().trim().max(120).optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  available: z.coerce.boolean().optional(),
  limit: z.coerce.number().int().min(1).max(60).optional(),
  offset: z.coerce.number().int().min(0).optional(),
});

export type ProductCreateInput = z.infer<typeof productCreateSchema>;
export type ProductUpdateInput = z.infer<typeof productUpdateSchema>;
export type ProductStockUpdateInput = z.infer<typeof productCommercialUpdateSchema>;
export type ProductCommercialUpdateInput = ProductStockUpdateInput;
export type ProductStatusUpdateInput = z.infer<typeof productStatusUpdateSchema>;
export type ProductCatalogQuery = z.infer<typeof productCatalogQuerySchema>;
