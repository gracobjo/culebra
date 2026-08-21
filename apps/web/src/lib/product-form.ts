import type { ProductCommercialUpdateInput, ProductCreateInput } from "@culebra/auth";

export function parseCommercialForm(
  formData: FormData,
  variants: Array<{ id: string }>,
): ProductCommercialUpdateInput {
  if (variants.length > 0) {
    return {
      variants: variants.map((variant, index) => {
        const priceRaw = String(formData.get(`variantPrice${index + 1}`) ?? "").trim();
        return {
          id: variant.id,
          stock: Number(formData.get(`variantStock${index + 1}`) ?? 0),
          ...(priceRaw ? { price: Number(priceRaw) } : {}),
        };
      }),
    };
  }

  const basePriceRaw = String(formData.get("basePrice") ?? "").trim();
  return {
    stock: Number(formData.get("stock") ?? 0),
    ...(basePriceRaw ? { basePrice: Number(basePriceRaw) } : {}),
  };
}

/** @deprecated Use parseCommercialForm */
export const parseStockForm = parseCommercialForm;

export function parseProductForm(formData: FormData): ProductCreateInput {
  const variants = [1, 2, 3]
    .map((index) => {
      const label = String(formData.get(`variantLabel${index}`) ?? "").trim();
      const price = String(formData.get(`variantPrice${index}`) ?? "").trim();
      if (!label || !price) {
        return null;
      }
      return {
        label,
        price: Number(price),
        stock: Number(formData.get(`variantStock${index}`) ?? 0),
        sku: String(formData.get(`variantSku${index}`) ?? "").trim() || undefined,
        unit: String(formData.get(`variantUnit${index}`) ?? "").trim() || undefined,
      };
    })
    .filter((variant): variant is NonNullable<typeof variant> => Boolean(variant));

  // Guardar rutas relativas (/uploads/...) para que funcionen en cualquier puerto
  // local y no dependan de NEXT_PUBLIC_APP_URL (p. ej. :3000 vs :3001).
  const imageUrl = String(formData.get("imageUrl") ?? "").trim();
  const normalizedImageUrl = imageUrl.startsWith("blob:") ? "" : imageUrl;

  return {
    name: String(formData.get("name") ?? ""),
    categoryId: String(formData.get("categoryId") ?? ""),
    subcategoryId: String(formData.get("subcategoryId") ?? "") || undefined,
    shortDescription: String(formData.get("shortDescription") ?? "") || undefined,
    longDescription: String(formData.get("longDescription") ?? "") || undefined,
    basePrice: Number(formData.get("basePrice")),
    previousPrice: String(formData.get("previousPrice") ?? "")
      ? Number(formData.get("previousPrice"))
      : undefined,
    vatRate: String(formData.get("vatRate") ?? "")
      ? Number(formData.get("vatRate"))
      : 10,
    unit: String(formData.get("unit") ?? "") || undefined,
    weight: String(formData.get("weight") ?? "")
      ? Number(formData.get("weight"))
      : undefined,
    sku: String(formData.get("sku") ?? "") || undefined,
    ingredients: String(formData.get("ingredients") ?? "") || undefined,
    allergens: String(formData.get("allergens") ?? "") || undefined,
    conservation: String(formData.get("conservation") ?? "") || undefined,
    origin: String(formData.get("origin") ?? "") || undefined,
    producerInfo: String(formData.get("producerInfo") ?? "") || undefined,
    shippingConditions: String(formData.get("shippingConditions") ?? "") || undefined,
    prepTimeDays: String(formData.get("prepTimeDays") ?? "")
      ? Number(formData.get("prepTimeDays"))
      : undefined,
    stock: Number(formData.get("stock") ?? 0),
    images: normalizedImageUrl ? [{ url: normalizedImageUrl }] : undefined,
    variants: variants.length ? variants : undefined,
  };
}
