import type { MetadataRoute } from "next";
import {
  listCategoryUrlsForSitemap,
  listPublicAccommodationUrlsForSitemap,
  listPublicPackUrlsForSitemap,
  listPublicProductUrlsForSitemap,
  listPublicVendorUrlsForSitemap,
} from "@culebra/auth";
import { getSiteUrl } from "@/lib/site";

/** Evita prerender en build sin DATABASE_URL (Vercel). */
export const dynamic = "force-dynamic";

const staticPaths: Array<{
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
}> = [
  { path: "/", changeFrequency: "daily", priority: 1 },
  { path: "/tienda", changeFrequency: "daily", priority: 0.95 },
  { path: "/productos", changeFrequency: "daily", priority: 0.9 },
  { path: "/productores", changeFrequency: "weekly", priority: 0.8 },
  { path: "/alojamientos", changeFrequency: "weekly", priority: 0.7 },
  { path: "/packs", changeFrequency: "weekly", priority: 0.7 },
  { path: "/como-funciona", changeFrequency: "monthly", priority: 0.6 },
  { path: "/quiero-vender", changeFrequency: "monthly", priority: 0.5 },
];

function staticSitemap(): MetadataRoute.Sitemap {
  return staticPaths.map(({ path, changeFrequency, priority }) => ({
    url: getSiteUrl(path),
    changeFrequency,
    priority,
  }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const [products, vendors, categories, accommodations, packs] = await Promise.all([
      listPublicProductUrlsForSitemap(),
      listPublicVendorUrlsForSitemap(),
      listCategoryUrlsForSitemap(),
      listPublicAccommodationUrlsForSitemap(),
      listPublicPackUrlsForSitemap(),
    ]);

    return [
      ...staticSitemap(),
      ...products.map((product) => ({
        url: getSiteUrl(`/productos/${product.slug}`),
        lastModified: product.updatedAt,
        changeFrequency: "weekly" as const,
        priority: 0.7,
      })),
      ...vendors.map((vendor) => ({
        url: getSiteUrl(`/productores/${vendor.slug}`),
        lastModified: vendor.updatedAt,
        changeFrequency: "weekly" as const,
        priority: 0.6,
      })),
      ...categories.map((category) => ({
        url: getSiteUrl(`/categorias/${category.slug}`),
        lastModified: category.updatedAt,
        changeFrequency: "weekly" as const,
        priority: 0.6,
      })),
      ...accommodations.map((item) => ({
        url: getSiteUrl(`/alojamientos/${item.slug}`),
        lastModified: item.updatedAt,
        changeFrequency: "weekly" as const,
        priority: 0.6,
      })),
      ...packs.map((item) => ({
        url: getSiteUrl(`/packs/${item.slug}`),
        lastModified: item.updatedAt,
        changeFrequency: "weekly" as const,
        priority: 0.6,
      })),
    ];
  } catch {
    // Build o runtime sin BD: sitemap mínimo estático.
    return staticSitemap();
  }
}
