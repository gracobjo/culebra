import type { MetadataRoute } from "next";
import {
  listCategoryUrlsForSitemap,
  listPublicProductUrlsForSitemap,
  listPublicVendorUrlsForSitemap,
} from "@culebra/auth";
import { getSiteUrl } from "@/lib/site";

const staticPaths: Array<{
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
}> = [
  { path: "/", changeFrequency: "daily", priority: 1 },
  { path: "/productos", changeFrequency: "daily", priority: 0.9 },
  { path: "/productores", changeFrequency: "weekly", priority: 0.8 },
  { path: "/categorias", changeFrequency: "weekly", priority: 0.8 },
  { path: "/como-funciona", changeFrequency: "monthly", priority: 0.6 },
  { path: "/quiero-vender", changeFrequency: "monthly", priority: 0.5 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, vendors, categories] = await Promise.all([
    listPublicProductUrlsForSitemap(),
    listPublicVendorUrlsForSitemap(),
    listCategoryUrlsForSitemap(),
  ]);

  return [
    ...staticPaths.map(({ path, changeFrequency, priority }) => ({
      url: getSiteUrl(path),
      changeFrequency,
      priority,
    })),
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
  ];
}
