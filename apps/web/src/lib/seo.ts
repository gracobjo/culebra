import { getSiteUrl } from "@/lib/site";

type BreadcrumbItem = {
  label: string;
  href?: string;
};

export function buildBreadcrumbJsonLd(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      ...(item.href ? { item: getSiteUrl(item.href) } : {}),
    })),
  };
}

export function buildOrganizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Sierra de la Culebra Marketplace",
    url: getSiteUrl("/"),
    description:
      "Marketplace de productos tradicionales y agroalimentarios de la Sierra de la Culebra.",
    areaServed: {
      "@type": "Place",
      name: "Sierra de la Culebra, Zamora, Castilla y Leon",
    },
  };
}

export function buildWebSiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Sierra de la Culebra Marketplace",
    url: getSiteUrl("/"),
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${getSiteUrl("/productos")}?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function buildProductJsonLd(product: {
  name: string;
  slug: string;
  shortDescription: string | null;
  longDescription: string | null;
  basePrice: string;
  stock: number;
  images: Array<{ url: string }>;
  vendor?: { tradeName: string } | null;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.shortDescription ?? product.longDescription,
    image: product.images.map((img) => img.url),
    url: getSiteUrl(`/productos/${product.slug}`),
    offers: {
      "@type": "Offer",
      price: product.basePrice,
      priceCurrency: "EUR",
      availability:
        product.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      url: getSiteUrl(`/productos/${product.slug}`),
    },
    brand: product.vendor
      ? { "@type": "Brand", name: product.vendor.tradeName }
      : undefined,
  };
}

export function buildVendorJsonLd(vendor: {
  tradeName: string;
  slug: string;
  description: string | null;
  city: string | null;
  province: string | null;
  logoUrl: string | null;
  website: string | null;
}) {
  const address = [vendor.city, vendor.province].filter(Boolean).join(", ");
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: vendor.tradeName,
    description: vendor.description,
    url: getSiteUrl(`/productores/${vendor.slug}`),
    image: vendor.logoUrl ?? undefined,
    address: address
      ? {
          "@type": "PostalAddress",
          addressLocality: vendor.city ?? undefined,
          addressRegion: vendor.province ?? undefined,
          addressCountry: "ES",
        }
      : undefined,
    sameAs: vendor.website ? [vendor.website] : undefined,
  };
}

export function buildCategoryJsonLd(category: {
  name: string;
  slug: string;
  description: string | null;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: category.name,
    description: category.description,
    url: getSiteUrl(`/categorias/${category.slug}`),
  };
}
