import { AccommodationBookingChannel, AccommodationStatus } from "@culebra/domain";
import { prisma } from "@culebra/db";

import type { AccommodationUpsertInput } from "./accommodation.schemas.js";
import { createUniqueSlug } from "./slug.js";

export type AccommodationRecord = {
  id: string;
  name: string;
  slug: string;
  shortDescription: string | null;
  longDescription: string | null;
  kind: string;
  city: string | null;
  municipality: string | null;
  province: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  whatsapp: string | null;
  websiteUrl: string | null;
  bookingUrl: string | null;
  bookingChannel: AccommodationBookingChannel;
  imageUrl: string | null;
  capacity: number | null;
  status: AccommodationStatus;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
};

export type PublicAccommodationRecord = AccommodationRecord & {
  linkedProducts: Array<{
    id: string;
    name: string;
    slug: string;
    basePrice: string;
    imageUrl: string | null;
    vendorName: string;
  }>;
};

function emptyToNull(value?: string | null) {
  if (value == null || value === "") return null;
  return value;
}

function mapAccommodation(row: {
  id: string;
  name: string;
  slug: string;
  shortDescription: string | null;
  longDescription: string | null;
  kind: string;
  city: string | null;
  municipality: string | null;
  province: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  whatsapp: string | null;
  websiteUrl: string | null;
  bookingUrl: string | null;
  bookingChannel: string;
  imageUrl: string | null;
  capacity: number | null;
  status: string;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}): AccommodationRecord {
  return {
    ...row,
    bookingChannel: row.bookingChannel as AccommodationBookingChannel,
    status: row.status as AccommodationStatus,
  };
}

export async function listPublicAccommodations(limit = 50) {
  const items = await prisma.accommodation.findMany({
    where: { status: AccommodationStatus.PUBLISHED },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    take: limit,
  });
  return { items: items.map(mapAccommodation) };
}

export async function getPublicAccommodationBySlug(
  slug: string,
): Promise<PublicAccommodationRecord | null> {
  const row = await prisma.accommodation.findFirst({
    where: { slug, status: AccommodationStatus.PUBLISHED },
    include: {
      products: {
        orderBy: { sortOrder: "asc" },
        include: {
          product: {
            include: {
              images: { orderBy: { sortOrder: "asc" }, take: 1 },
              vendor: { select: { tradeName: true } },
            },
          },
        },
      },
    },
  });
  if (!row) return null;

  return {
    ...mapAccommodation(row),
    linkedProducts: row.products
      .filter((link) => link.product.status === "PUBLISHED" && !link.product.deletedAt)
      .map((link) => ({
        id: link.product.id,
        name: link.product.name,
        slug: link.product.slug,
        basePrice: String(link.product.basePrice),
        imageUrl: link.product.images[0]?.url ?? null,
        vendorName: link.product.vendor.tradeName,
      })),
  };
}

/** Alojamientos publicados que recomiendan un producto (cross-sell). */
export async function listAccommodationsForProduct(productId: string, limit = 6) {
  const links = await prisma.accommodationProduct.findMany({
    where: {
      productId,
      accommodation: { status: AccommodationStatus.PUBLISHED },
    },
    orderBy: { sortOrder: "asc" },
    take: limit,
    include: { accommodation: true },
  });
  return links.map((link) => mapAccommodation(link.accommodation));
}

export async function listAccommodationsForAdmin() {
  const items = await prisma.accommodation.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
  return items.map(mapAccommodation);
}

export async function getAccommodationById(id: string) {
  const row = await prisma.accommodation.findUnique({
    where: { id },
    include: { products: true },
  });
  if (!row) return null;
  return {
    ...mapAccommodation(row),
    productIds: row.products.map((p) => p.productId),
  };
}

export async function upsertAccommodationForAdmin(
  input: AccommodationUpsertInput,
  id?: string,
): Promise<AccommodationRecord> {
  const productIds = input.productIds ?? [];
  const data = {
    name: input.name,
    shortDescription: emptyToNull(input.shortDescription),
    longDescription: emptyToNull(input.longDescription),
    kind: input.kind,
    city: emptyToNull(input.city),
    municipality: emptyToNull(input.municipality),
    province: input.province,
    address: emptyToNull(input.address),
    phone: emptyToNull(input.phone),
    email: emptyToNull(input.email),
    whatsapp: emptyToNull(input.whatsapp),
    websiteUrl: emptyToNull(input.websiteUrl),
    bookingUrl: emptyToNull(input.bookingUrl),
    bookingChannel: input.bookingChannel,
    imageUrl: emptyToNull(input.imageUrl),
    capacity: input.capacity ?? null,
    status: input.status,
    sortOrder: input.sortOrder,
  };

  let row;
  if (id) {
    row = await prisma.accommodation.update({
      where: { id },
      data,
    });
    await prisma.accommodationProduct.deleteMany({ where: { accommodationId: id } });
  } else {
    const slug = await createUniqueSlug(
      input.name,
      async (candidate) =>
        Boolean(await prisma.accommodation.findUnique({ where: { slug: candidate } })),
      "alojamiento",
    );
    row = await prisma.accommodation.create({
      data: { ...data, slug },
    });
  }

  if (productIds.length > 0) {
    await prisma.accommodationProduct.createMany({
      data: productIds.map((productId, index) => ({
        accommodationId: row.id,
        productId,
        sortOrder: index,
      })),
      skipDuplicates: true,
    });
  }

  return mapAccommodation(row);
}

export async function updateAccommodationStatusForAdmin(
  id: string,
  status: AccommodationStatus,
) {
  const row = await prisma.accommodation.update({
    where: { id },
    data: { status },
  });
  return mapAccommodation(row);
}
