import { prisma } from "@culebra/db";

export type CategoryRecord = {
  id: string;
  parentId: string | null;
  name: string;
  slug: string;
  description: string | null;
  sortOrder: number;
  children: CategoryRecord[];
};

function mapCategory(category: {
  id: string;
  parentId: string | null;
  name: string;
  slug: string;
  description: string | null;
  sortOrder: number;
  children?: Array<{
    id: string;
    parentId: string | null;
    name: string;
    slug: string;
    description: string | null;
    sortOrder: number;
  }>;
}): CategoryRecord {
  return {
    id: category.id,
    parentId: category.parentId,
    name: category.name,
    slug: category.slug,
    description: category.description,
    sortOrder: category.sortOrder,
    children: (category.children ?? []).map((child) =>
      mapCategory({ ...child, children: [] }),
    ),
  };
}

export async function listCategories(): Promise<CategoryRecord[]> {
  const categories = await prisma.category.findMany({
    where: { isActive: true, parentId: null },
    orderBy: { sortOrder: "asc" },
    include: {
      children: {
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  return categories.map((category: (typeof categories)[number]) =>
    mapCategory(category),
  );
}

export async function getCategoryBySlug(
  slug: string,
): Promise<CategoryRecord | null> {
  const category = await prisma.category.findFirst({
    where: { slug, isActive: true },
    include: {
      children: {
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  return category ? mapCategory(category) : null;
}

export async function getCategoryById(id: string) {
  return prisma.category.findFirst({
    where: { id, isActive: true },
  });
}
