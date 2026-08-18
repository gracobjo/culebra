import type { ProductCreateInput } from "@culebra/auth";

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

  const imageUrl = String(formData.get("imageUrl") ?? "").trim();

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
    images: imageUrl ? [{ url: imageUrl }] : undefined,
    variants: variants.length ? variants : undefined,
  };
}
