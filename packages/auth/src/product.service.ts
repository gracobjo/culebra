import { AuditAction, ProductStatus, VendorStatus } from "@culebra/domain";
import { prisma } from "@culebra/db";

import { getCategoryById } from "./category.service.js";
import { vendorHasActiveContract } from "./contract.service.js";
import { createUniqueSlug } from "./slug.js";
import type {
  ProductCatalogQuery,
  ProductCreateInput,
  ProductStatusUpdateInput,
  ProductUpdateInput,
} from "./product.schemas.js";
import { getVendorByUserId } from "./vendor.service.js";

export type ProductVariantRecord = {
  id: string;
  label: string;
  sku: string | null;
  unit: string | null;
  weight: string | null;
  price: string;
  previousPrice: string | null;
  isActive: boolean;
  stock: number;
};

export type ProductImageRecord = {
  id: string;
  url: string;
  altText: string | null;
  sortOrder: number;
};

export type ProductVendorSummary = {
  id: string;
  tradeName: string;
  slug: string;
  city: string | null;
  province: string | null;
};

export type ProductCategorySummary = {
  id: string;
  name: string;
  slug: string;
};

export type ProductRecord = {
  id: string;
  vendorId: string;
  categoryId: string;
  subcategoryId: string | null;
  name: string;
  slug: string;
  shortDescription: string | null;
  longDescription: string | null;
  basePrice: string;
  previousPrice: string | null;
  vatRate: string;
  unit: string | null;
  weight: string | null;
  sku: string | null;
  ingredients: string | null;
  allergens: string | null;
  conservation: string | null;
  origin: string | null;
  producerInfo: string | null;
  shippingConditions: string | null;
  prepTimeDays: number | null;
  status: ProductStatus;
  rejectionReason: string | null;
  stock: number;
  vendor?: ProductVendorSummary;
  category?: ProductCategorySummary;
  subcategory?: ProductCategorySummary | null;
  images: ProductImageRecord[];
  variants: ProductVariantRecord[];
  createdAt: Date;
  updatedAt: Date;
};

function decimalToString(value: unknown): string {
  if (value == null) {
    return "0";
  }
  return String(value);
}

function optionalDecimal(value: unknown): string | null {
  if (value == null) {
    return null;
  }
  return String(value);
}

async function writeAuditLog(params: {
  actorUserId?: string;
  actorIp?: string;
  entityType: string;
  entityId: string;
  action: AuditAction;
  fieldName?: string;
  oldValue?: string;
  newValue?: string;
  metadata?: Record<string, unknown>;
}) {
  await prisma.auditLog.create({
    data: {
      actorUserId: params.actorUserId,
      actorIp: params.actorIp,
      entityType: params.entityType,
      entityId: params.entityId,
      action: params.action,
      fieldName: params.fieldName,
      oldValue: params.oldValue,
      newValue: params.newValue,
      metadata: params.metadata,
    },
  });
}

type ProductRow = {
  id: string;
  vendorId: string;
  categoryId: string;
  subcategoryId: string | null;
  name: string;
  slug: string;
  shortDescription: string | null;
  longDescription: string | null;
  basePrice: unknown;
  previousPrice: unknown;
  vatRate: unknown;
  unit: string | null;
  weight: unknown;
  sku: string | null;
  ingredients: string | null;
  allergens: string | null;
  conservation: string | null;
  origin: string | null;
  producerInfo: string | null;
  shippingConditions: string | null;
  prepTimeDays: number | null;
  status: string;
  rejectionReason: string | null;
  createdAt: Date;
  updatedAt: Date;
  vendor?: ProductVendorSummary;
  category?: ProductCategorySummary;
  subcategory?: ProductCategorySummary | null;
  images?: ProductImageRecord[];
  variants?: Array<{
    id: string;
    label: string;
    sku: string | null;
    unit: string | null;
    weight: unknown;
    price: unknown;
    previousPrice: unknown;
    isActive: boolean;
    inventory?: Array<{ stock: number }>;
  }>;
  inventory?: Array<{ stock: number; variantId: string | null }>;
};

function mapProduct(row: ProductRow): ProductRecord {
  const variants = (row.variants ?? []).map((variant) => ({
    id: variant.id,
    label: variant.label,
    sku: variant.sku,
    unit: variant.unit,
    weight: optionalDecimal(variant.weight),
    price: decimalToString(variant.price),
    previousPrice: optionalDecimal(variant.previousPrice),
    isActive: variant.isActive,
    stock: (variant.inventory ?? []).reduce((sum, item) => sum + item.stock, 0),
  }));

  const productStock = (row.inventory ?? [])
    .filter((item) => !item.variantId)
    .reduce((sum, item) => sum + item.stock, 0);

  const variantStock = variants.reduce((sum, variant) => sum + variant.stock, 0);

  return {
    id: row.id,
    vendorId: row.vendorId,
    categoryId: row.categoryId,
    subcategoryId: row.subcategoryId,
    name: row.name,
    slug: row.slug,
    shortDescription: row.shortDescription,
    longDescription: row.longDescription,
    basePrice: decimalToString(row.basePrice),
    previousPrice: optionalDecimal(row.previousPrice),
    vatRate: decimalToString(row.vatRate),
    unit: row.unit,
    weight: optionalDecimal(row.weight),
    sku: row.sku,
    ingredients: row.ingredients,
    allergens: row.allergens,
    conservation: row.conservation,
    origin: row.origin,
    producerInfo: row.producerInfo,
    shippingConditions: row.shippingConditions,
    prepTimeDays: row.prepTimeDays,
    status: row.status as ProductStatus,
    rejectionReason: row.rejectionReason,
    stock: variants.length > 0 ? variantStock : productStock,
    vendor: row.vendor,
    category: row.category,
    subcategory: row.subcategory ?? null,
    images: row.images ?? [],
    variants,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

const productInclude = {
  vendor: {
    select: {
      id: true,
      tradeName: true,
      slug: true,
      city: true,
      province: true,
    },
  },
  category: { select: { id: true, name: true, slug: true } },
  subcategory: { select: { id: true, name: true, slug: true } },
  images: { orderBy: { sortOrder: "asc" as const } },
  variants: {
    orderBy: { sortOrder: "asc" as const },
    include: { inventory: true },
  },
  inventory: true,
};

async function loadProduct(id: string): Promise<ProductRecord> {
  const product = await prisma.product.findUnique({
    where: { id },
    include: productInclude,
  });
  if (!product) {
    throw new Error("PRODUCT_NOT_FOUND");
  }
  return mapProduct(product as ProductRow);
}

async function requireOwnedVendor(userId: string) {
  const vendor = await getVendorByUserId(userId);
  if (!vendor) {
    throw new Error("PRODUCT_VENDOR_NOT_FOUND");
  }
  return vendor;
}

async function getOwnedProduct(userId: string, productId: string) {
  const vendor = await requireOwnedVendor(userId);
  const product = await prisma.product.findFirst({
    where: { id: productId, vendorId: vendor.id, deletedAt: null },
    include: productInclude,
  });
  if (!product) {
    throw new Error("PRODUCT_NOT_FOUND");
  }
  return { vendor, product: mapProduct(product as ProductRow) };
}

async function assertCategory(categoryId: string, subcategoryId?: string | null) {
  const category = await getCategoryById(categoryId);
  if (!category) {
    throw new Error("CATEGORY_NOT_FOUND");
  }
  if (subcategoryId) {
    const subcategory = await getCategoryById(subcategoryId);
    if (!subcategory || subcategory.parentId !== categoryId) {
      throw new Error("CATEGORY_NOT_FOUND");
    }
  }
}

async function syncVariants(
  vendorId: string,
  productId: string,
  variants: NonNullable<ProductCreateInput["variants"]>,
) {
  await prisma.inventory.deleteMany({
    where: { productId, variantId: { not: null } },
  });
  await prisma.productVariant.deleteMany({ where: { productId } });

  for (const [index, variant] of variants.entries()) {
    const created = await prisma.productVariant.create({
      data: {
        productId,
        label: variant.label,
        sku: variant.sku,
        unit: variant.unit,
        weight: variant.weight,
        price: variant.price,
        previousPrice: variant.previousPrice,
        sortOrder: index,
        isActive: variant.isActive ?? true,
      },
    });
    await prisma.inventory.create({
      data: {
        vendorId,
        productId,
        variantId: created.id,
        stock: variant.stock,
      },
    });
  }
}

async function syncImages(
  productId: string,
  images: NonNullable<ProductCreateInput["images"]>,
) {
  await prisma.productImage.deleteMany({ where: { productId } });
  if (!images.length) {
    return;
  }
  await prisma.productImage.createMany({
    data: images.map((image, index) => ({
      productId,
      url: image.url,
      altText: image.altText,
      sortOrder: index,
    })),
  });
}

export async function createProduct(
  userId: string,
  input: ProductCreateInput,
  context?: { ipAddress?: string },
): Promise<ProductRecord> {
  const vendor = await requireOwnedVendor(userId);
  await assertCategory(input.categoryId, input.subcategoryId);

  const slug = await createUniqueSlug(input.name, async (candidate) => {
    const found = await prisma.product.findFirst({
      where: { slug: candidate, deletedAt: null },
    });
    return Boolean(found);
  }, "producto");

  const product = await prisma.product.create({
    data: {
      vendorId: vendor.id,
      categoryId: input.categoryId,
      subcategoryId: input.subcategoryId,
      name: input.name,
      slug,
      shortDescription: input.shortDescription,
      longDescription: input.longDescription,
      basePrice: input.basePrice,
      previousPrice: input.previousPrice,
      vatRate: input.vatRate ?? 10,
      unit: input.unit,
      weight: input.weight,
      sku: input.sku,
      ingredients: input.ingredients,
      allergens: input.allergens,
      conservation: input.conservation,
      origin: input.origin,
      producerInfo: input.producerInfo,
      shippingConditions: input.shippingConditions,
      prepTimeDays: input.prepTimeDays,
      status: ProductStatus.DRAFT,
    },
  });

  await prisma.inventory.create({
    data: {
      vendorId: vendor.id,
      productId: product.id,
      stock: input.variants?.length ? 0 : input.stock,
    },
  });

  if (input.images?.length) {
    await syncImages(product.id, input.images);
  }
  if (input.variants?.length) {
    await syncVariants(vendor.id, product.id, input.variants);
  }

  await writeAuditLog({
    actorUserId: userId,
    actorIp: context?.ipAddress,
    entityType: "Product",
    entityId: product.id,
    action: AuditAction.CREATE,
    metadata: { name: input.name, slug },
  });

  return loadProduct(product.id);
}

export async function updateProduct(
  userId: string,
  productId: string,
  input: ProductUpdateInput,
  context?: { ipAddress?: string },
): Promise<ProductRecord> {
  const { vendor, product } = await getOwnedProduct(userId, productId);
  const editableStatuses = [ProductStatus.DRAFT, ProductStatus.REJECTED] as const;
  if (!editableStatuses.includes(product.status as (typeof editableStatuses)[number])) {
    throw new Error("PRODUCT_NOT_EDITABLE");
  }

  if (input.categoryId) {
    await assertCategory(input.categoryId, input.subcategoryId);
  }

  const oldPrice = product.basePrice;

  await prisma.product.update({
    where: { id: productId },
    data: {
      name: input.name,
      categoryId: input.categoryId,
      subcategoryId: input.subcategoryId,
      shortDescription: input.shortDescription,
      longDescription: input.longDescription,
      basePrice: input.basePrice,
      previousPrice: input.previousPrice,
      vatRate: input.vatRate,
      unit: input.unit,
      weight: input.weight,
      sku: input.sku,
      ingredients: input.ingredients,
      allergens: input.allergens,
      conservation: input.conservation,
      origin: input.origin,
      producerInfo: input.producerInfo,
      shippingConditions: input.shippingConditions,
      prepTimeDays: input.prepTimeDays,
    },
  });

  if (input.stock !== undefined && !input.variants?.length && !product.variants.length) {
    await prisma.inventory.updateMany({
      where: { productId, variantId: null },
      data: { stock: input.stock },
    });
  }

  if (input.images) {
    await syncImages(productId, input.images);
  }
  if (input.variants) {
    await syncVariants(vendor.id, productId, input.variants);
  }

  await writeAuditLog({
    actorUserId: userId,
    actorIp: context?.ipAddress,
    entityType: "Product",
    entityId: productId,
    action: AuditAction.UPDATE,
    fieldName: input.basePrice !== undefined ? "basePrice" : undefined,
    oldValue: input.basePrice !== undefined ? oldPrice : undefined,
    newValue: input.basePrice !== undefined ? String(input.basePrice) : undefined,
  });

  return loadProduct(productId);
}

export async function submitProductForReview(
  userId: string,
  productId: string,
  context?: { ipAddress?: string },
): Promise<ProductRecord> {
  const { vendor, product } = await getOwnedProduct(userId, productId);
  if (vendor.status !== VendorStatus.ACTIVE) {
    throw new Error("PRODUCT_VENDOR_NOT_ACTIVE");
  }

  if (!(await vendorHasActiveContract(vendor.id))) {
    throw new Error("VENDOR_CONTRACT_REQUIRED");
  }

  const submittable = [ProductStatus.DRAFT, ProductStatus.REJECTED] as const;
  if (!submittable.includes(product.status as (typeof submittable)[number])) {
    throw new Error("PRODUCT_INVALID_STATUS");
  }

  if (!product.name || !product.categoryId || Number(product.basePrice) <= 0) {
    throw new Error("PRODUCT_INCOMPLETE");
  }

  await prisma.product.update({
    where: { id: productId },
    data: { status: ProductStatus.PENDING_REVIEW, rejectionReason: null },
  });

  await writeAuditLog({
    actorUserId: userId,
    actorIp: context?.ipAddress,
    entityType: "Product",
    entityId: productId,
    action: AuditAction.STATUS_CHANGE,
    oldValue: product.status,
    newValue: ProductStatus.PENDING_REVIEW,
  });

  return loadProduct(productId);
}

export async function disableProduct(
  userId: string,
  productId: string,
  context?: { ipAddress?: string },
): Promise<ProductRecord> {
  const { product } = await getOwnedProduct(userId, productId);
  await prisma.product.update({
    where: { id: productId },
    data: { status: ProductStatus.DISABLED },
  });

  await writeAuditLog({
    actorUserId: userId,
    actorIp: context?.ipAddress,
    entityType: "Product",
    entityId: productId,
    action: AuditAction.STATUS_CHANGE,
    oldValue: product.status,
    newValue: ProductStatus.DISABLED,
  });

  return loadProduct(productId);
}

export async function listVendorProducts(userId: string): Promise<ProductRecord[]> {
  const vendor = await requireOwnedVendor(userId);
  const products = await prisma.product.findMany({
    where: { vendorId: vendor.id, deletedAt: null },
    orderBy: { updatedAt: "desc" },
    include: productInclude,
  });
  return products.map((product: (typeof products)[number]) =>
    mapProduct(product as ProductRow),
  );
}

export async function getVendorProduct(
  userId: string,
  productId: string,
): Promise<ProductRecord> {
  const { product } = await getOwnedProduct(userId, productId);
  return product;
}

function publishedWhere(extra: Record<string, unknown> = {}) {
  return {
    status: ProductStatus.PUBLISHED,
    deletedAt: null,
    vendor: { status: VendorStatus.ACTIVE, deletedAt: null },
    ...extra,
  };
}

export async function listPublicProducts(query: ProductCatalogQuery = {}): Promise<{
  items: ProductRecord[];
  total: number;
}> {
  const limit = query.limit ?? 24;
  const offset = query.offset ?? 0;

  const filters: Record<string, unknown>[] = [];

  if (query.search) {
    filters.push({
      OR: [
        { name: { contains: query.search, mode: "insensitive" } },
        { shortDescription: { contains: query.search, mode: "insensitive" } },
        { origin: { contains: query.search, mode: "insensitive" } },
        { vendor: { tradeName: { contains: query.search, mode: "insensitive" } } },
        { vendor: { city: { contains: query.search, mode: "insensitive" } } },
      ],
    });
  }

  if (query.categorySlug) {
    filters.push({
      OR: [
        { category: { slug: query.categorySlug } },
        { subcategory: { slug: query.categorySlug } },
      ],
    });
  }

  if (query.vendorSlug) {
    filters.push({ vendor: { slug: query.vendorSlug } });
  }

  if (query.minPrice !== undefined) {
    filters.push({ basePrice: { gte: query.minPrice } });
  }
  if (query.maxPrice !== undefined) {
    filters.push({ basePrice: { lte: query.maxPrice } });
  }

  const where = {
    ...publishedWhere(),
    ...(filters.length ? { AND: filters } : {}),
  };

  const [rows, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      take: limit,
      skip: offset,
      include: productInclude,
    }),
    prisma.product.count({ where }),
  ]);

  let items: ProductRecord[] = rows.map((row: (typeof rows)[number]) =>
    mapProduct(row as ProductRow),
  );
  if (query.available) {
    items = items.filter((item: ProductRecord) => item.stock > 0);
  }

  return { items, total };
}

export async function getPublicProductBySlug(
  slug: string,
): Promise<ProductRecord | null> {
  const product = await prisma.product.findFirst({
    where: publishedWhere({ slug }),
    include: productInclude,
  });
  return product ? mapProduct(product as ProductRow) : null;
}

export async function listProductsForAdmin(params?: {
  status?: ProductStatus;
  limit?: number;
  offset?: number;
}) {
  const limit = params?.limit ?? 50;
  const offset = params?.offset ?? 0;
  const where = {
    deletedAt: null,
    ...(params?.status ? { status: params.status } : {}),
  };

  const [rows, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      take: limit,
      skip: offset,
      include: productInclude,
    }),
    prisma.product.count({ where }),
  ]);

  return {
    items: rows.map((row: (typeof rows)[number]) => mapProduct(row as ProductRow)),
    total,
  };
}

export async function updateProductStatusByAdmin(
  productId: string,
  adminUserId: string,
  input: ProductStatusUpdateInput,
  context?: { ipAddress?: string },
): Promise<ProductRecord> {
  const existing = await prisma.product.findFirst({
    where: { id: productId, deletedAt: null },
  });
  if (!existing) {
    throw new Error("PRODUCT_NOT_FOUND");
  }

  await prisma.product.update({
    where: { id: productId },
    data: {
      status: input.status,
      rejectionReason:
        input.status === ProductStatus.REJECTED ? input.rejectionReason : null,
    },
  });

  await writeAuditLog({
    actorUserId: adminUserId,
    actorIp: context?.ipAddress,
    entityType: "Product",
    entityId: productId,
    action:
      input.status === ProductStatus.PUBLISHED
        ? AuditAction.APPROVE
        : input.status === ProductStatus.REJECTED
          ? AuditAction.REJECT
          : AuditAction.STATUS_CHANGE,
    oldValue: existing.status,
    newValue: input.status,
    metadata: { rejectionReason: input.rejectionReason },
  });

  return loadProduct(productId);
}
