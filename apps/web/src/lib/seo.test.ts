import { afterEach, describe, expect, it } from "vitest";

import { buildBreadcrumbJsonLd, buildProductJsonLd } from "@/lib/seo";

describe("seo json-ld", () => {
  const previousUrl = process.env.NEXT_PUBLIC_APP_URL;

  afterEach(() => {
    process.env.NEXT_PUBLIC_APP_URL = previousUrl;
  });

  it("buildProductJsonLd incluye oferta y url", () => {
    process.env.NEXT_PUBLIC_APP_URL = "https://example.com";
    const data = buildProductJsonLd({
      name: "Queso curado",
      slug: "queso-curado",
      shortDescription: "Queso artesanal",
      longDescription: null,
      basePrice: "12.50",
      stock: 3,
      images: [{ url: "https://cdn.example.com/queso.jpg" }],
      vendor: { tradeName: "Granja Norte" },
    });
    expect(data["@type"]).toBe("Product");
    expect(data.url).toBe("https://example.com/productos/queso-curado");
    expect(data.offers).toMatchObject({
      price: "12.50",
      priceCurrency: "EUR",
    });
  });

  it("buildBreadcrumbJsonLd genera posiciones", () => {
    process.env.NEXT_PUBLIC_APP_URL = "https://example.com";
    const data = buildBreadcrumbJsonLd([
      { label: "Inicio", href: "/" },
      { label: "Productos", href: "/productos" },
      { label: "Queso" },
    ]);
    expect(data.itemListElement).toHaveLength(3);
    expect(data.itemListElement[0]).toMatchObject({ position: 1, name: "Inicio" });
  });
});
