import { TourismPackStatus } from "@culebra/domain";
import { prisma } from "@culebra/db";

import type { TourismPackUpsertInput } from "./tourism-pack.schemas.js";
import { createUniqueSlug } from "./slug.js";

export type TourismPackRecord = {
  id: string;
  slug: string;
  name: string;
  shortDescription: string | null;
  longDescription: string | null;
  accommodationId: string | null;
  nightsHint: string | null;
  imageUrl: string | null;
  status: TourismPackStatus;
  sortOrder: number;
  couponId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type PublicTourismPackRecord = TourismPackRecord & {
  accommodation: {
    id: string;
    name: string;
    slug: string;
    bookingUrl: string | null;
    bookingChannel: string;
    city: string | null;
  } | null;
  couponCode: string | null;
  items: Array<{
    productId: string;
    quantity: number;
    name: string;
    slug: string;
    basePrice: string;
    imageUrl: string | null;
    vendorName: string;
  }>;
  packSubtotal: string;
};

function emptyToNull(value?: string | null) {
  if (value == null || value === "") return null;
  return value;
}

function mapPack(row: {
  id: string;
  slug: string;
  name: string;
  shortDescription: string | null;
  longDescription: string | null;
  accommodationId: string | null;
  nightsHint: string | null;
  imageUrl: string | null;
  status: string;
  sortOrder: number;
  couponId: string | null;
  createdAt: Date;
  updatedAt: Date;
}): TourismPackRecord {
  return {
    ...row,
    status: row.status as TourismPackStatus,
  };
}

const publicPackInclude = {
  accommodation: {
    select: {
      id: true,
      name: true,
      slug: true,
      bookingUrl: true,
      bookingChannel: true,
      city: true,
      status: true,
    },
  },
  coupon: { select: { code: true, isActive: true } },
  items: {
    orderBy: { sortOrder: "asc" as const },
    include: {
      product: {
        include: {
          images: { orderBy: { sortOrder: "asc" as const }, take: 1 },
          vendor: { select: { tradeName: true } },
        },
      },
    },
  },
};

function toPublicPack(row: {
  id: string;
  slug: string;
  name: string;
  shortDescription: string | null;
  longDescription: string | null;
  accommodationId: string | null;
  nightsHint: string | null;
  imageUrl: string | null;
  status: string;
  sortOrder: number;
  couponId: string | null;
  createdAt: Date;
  updatedAt: Date;
  accommodation: {
    id: string;
    name: string;
    slug: string;
    bookingUrl: string | null;
    bookingChannel: string;
    city: string | null;
    status: string;
  } | null;
  coupon: { code: string; isActive: boolean } | null;
  items: Array<{
    quantity: number;
    product: {
      id: string;
      name: string;
      slug: string;
      basePrice: unknown;
      status: string;
      deletedAt: Date | null;
      images: Array<{ url: string }>;
      vendor: { tradeName: string };
    };
  }>;
}): PublicTourismPackRecord {
  const items = row.items
    .filter((item) => item.product.status === "PUBLISHED" && !item.product.deletedAt)
    .map((item) => ({
      productId: item.product.id,
      quantity: item.quantity,
      name: item.product.name,
      slug: item.product.slug,
      basePrice: String(item.product.basePrice),
      imageUrl: item.product.images[0]?.url ?? null,
      vendorName: item.product.vendor.tradeName,
    }));

  const packSubtotal = items
    .reduce((sum, item) => sum + Number(item.basePrice) * item.quantity, 0)
    .toFixed(2);

  return {
    ...mapPack(row),
    accommodation:
      row.accommodation && row.accommodation.status === "PUBLISHED"
        ? {
            id: row.accommodation.id,
            name: row.accommodation.name,
            slug: row.accommodation.slug,
            bookingUrl: row.accommodation.bookingUrl,
            bookingChannel: row.accommodation.bookingChannel,
            city: row.accommodation.city,
          }
        : null,
    couponCode: row.coupon?.isActive ? row.coupon.code : null,
    items,
    packSubtotal,
  };
}

export async function listPublicTourismPacks(limit = 50) {
  const rows = await prisma.tourismPack.findMany({
    where: { status: TourismPackStatus.PUBLISHED },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    take: limit,
    include: publicPackInclude,
  });
  return { items: rows.map(toPublicPack) };
}

export async function getPublicTourismPackBySlug(slug: string) {
  const row = await prisma.tourismPack.findFirst({
    where: { slug, status: TourismPackStatus.PUBLISHED },
    include: publicPackInclude,
  });
  if (!row) return null;
  return toPublicPack(row);
}

export async function listTourismPacksForAdmin() {
  const rows = await prisma.tourismPack.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: {
      accommodation: { select: { name: true } },
      _count: { select: { items: true } },
    },
  });
  return rows.map((row) => ({
    ...mapPack(row),
    accommodationName: row.accommodation?.name ?? null,
    itemCount: row._count.items,
  }));
}

export async function getTourismPackById(id: string) {
  const row = await prisma.tourismPack.findUnique({
    where: { id },
    include: { items: { orderBy: { sortOrder: "asc" } } },
  });
  if (!row) return null;
  return {
    ...mapPack(row),
    items: row.items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
    })),
  };
}

export async function upsertTourismPackForAdmin(
  input: TourismPackUpsertInput,
  id?: string,
): Promise<TourismPackRecord> {
  const data = {
    name: input.name,
    shortDescription: emptyToNull(input.shortDescription),
    longDescription: emptyToNull(input.longDescription),
    accommodationId: emptyToNull(input.accommodationId),
    nightsHint: emptyToNull(input.nightsHint),
    imageUrl: emptyToNull(input.imageUrl),
    status: input.status,
    sortOrder: input.sortOrder,
    couponId: emptyToNull(input.couponId),
  };

  let row;
  if (id) {
    row = await prisma.tourismPack.update({ where: { id }, data });
    await prisma.tourismPackItem.deleteMany({ where: { packId: id } });
  } else {
    const slug = await createUniqueSlug(
      input.name,
      async (candidate) =>
        Boolean(await prisma.tourismPack.findUnique({ where: { slug: candidate } })),
      "pack",
    );
    row = await prisma.tourismPack.create({
      data: { ...data, slug },
    });
  }

  await prisma.tourismPackItem.createMany({
    data: input.items.map((item, index) => ({
      packId: row.id,
      productId: item.productId,
      quantity: item.quantity,
      sortOrder: index,
    })),
  });

  return mapPack(row);
}
