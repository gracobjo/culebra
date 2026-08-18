import { ProductStatus, VendorStatus } from "@culebra/domain";
import { prisma } from "@culebra/db";

export type SitemapUrlRecord = {
  slug: string;
  updatedAt: Date;
};

export async function listPublicProductUrlsForSitemap(): Promise<SitemapUrlRecord[]> {
  return prisma.product.findMany({
    where: {
      status: ProductStatus.PUBLISHED,
      deletedAt: null,
    },
    select: {
      slug: true,
      updatedAt: true,
    },
    orderBy: { updatedAt: "desc" },
  });
}

export async function listPublicVendorUrlsForSitemap(): Promise<SitemapUrlRecord[]> {
  return prisma.vendor.findMany({
    where: {
      status: VendorStatus.ACTIVE,
      deletedAt: null,
    },
    select: {
      slug: true,
      updatedAt: true,
    },
    orderBy: { updatedAt: "desc" },
  });
}

export async function listCategoryUrlsForSitemap(): Promise<SitemapUrlRecord[]> {
  return prisma.category.findMany({
    where: { isActive: true },
    select: {
      slug: true,
      updatedAt: true,
    },
    orderBy: { sortOrder: "asc" },
  });
}
