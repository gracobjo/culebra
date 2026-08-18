import { PrismaClient, RoleName } from "@prisma/client";

const prisma = new PrismaClient();

type CategorySeed = {
  name: string;
  slug: string;
  description?: string;
  sortOrder: number;
  children?: CategorySeed[];
};

const categories: CategorySeed[] = [
  {
    name: "Embutidos y productos carnicos",
    slug: "embutidos-y-productos-carnicos",
    sortOrder: 1,
    children: [
      { name: "Jamon", slug: "jamon", sortOrder: 1 },
      { name: "Chorizo", slug: "chorizo", sortOrder: 2 },
      { name: "Salchichon", slug: "salchichon", sortOrder: 3 },
      { name: "Otros embutidos", slug: "otros-embutidos", sortOrder: 4 },
      {
        name: "Productos derivados del cerdo",
        slug: "productos-derivados-del-cerdo",
        sortOrder: 5,
      },
    ],
  },
  {
    name: "Quesos y lacteos",
    slug: "quesos-y-lacteos",
    sortOrder: 2,
    children: [
      { name: "Queso de oveja", slug: "queso-de-oveja", sortOrder: 1 },
      { name: "Queso de cabra", slug: "queso-de-cabra", sortOrder: 2 },
      { name: "Queso de vaca", slug: "queso-de-vaca", sortOrder: 3 },
      { name: "Otros productos lacteos", slug: "otros-productos-lacteos", sortOrder: 4 },
    ],
  },
  {
    name: "Vinos",
    slug: "vinos",
    sortOrder: 3,
    children: [
      { name: "Tintos", slug: "vinos-tintos", sortOrder: 1 },
      { name: "Blancos", slug: "vinos-blancos", sortOrder: 2 },
      { name: "Rosados", slug: "vinos-rosados", sortOrder: 3 },
      { name: "Otros", slug: "vinos-otros", sortOrder: 4 },
    ],
  },
  {
    name: "Licores",
    slug: "licores",
    sortOrder: 4,
    children: [
      { name: "Orujo", slug: "orujo", sortOrder: 1 },
      { name: "Licores tradicionales", slug: "licores-tradicionales", sortOrder: 2 },
    ],
  },
  {
    name: "Miel y productos apicolas",
    slug: "miel-y-productos-apicolas",
    sortOrder: 5,
    children: [
      { name: "Miel", slug: "miel", sortOrder: 1 },
      { name: "Polen", slug: "polen", sortOrder: 2 },
      { name: "Jalea real", slug: "jalea-real", sortOrder: 3 },
      { name: "Otros productos apicolas", slug: "otros-productos-apicolas", sortOrder: 4 },
    ],
  },
  {
    name: "Productos tradicionales",
    slug: "productos-tradicionales",
    description: "Categoria preparada para futuras incorporaciones.",
    sortOrder: 6,
  },
];

async function seedRoles() {
  for (const role of Object.values(RoleName)) {
    await prisma.role.upsert({
      where: { name: role },
      update: {},
      create: { name: role },
    });
  }
}

async function seedCategoryTree(category: CategorySeed, parentId?: string) {
  const created = await prisma.category.upsert({
    where: { slug: category.slug },
    update: {
      name: category.name,
      description: category.description,
      sortOrder: category.sortOrder,
      parentId: parentId ?? null,
      isActive: true,
    },
    create: {
      name: category.name,
      slug: category.slug,
      description: category.description,
      sortOrder: category.sortOrder,
      parentId: parentId ?? null,
    },
  });

  if (category.children) {
    for (const child of category.children) {
      await seedCategoryTree(child, created.id);
    }
  }
}

async function main() {
  console.log("Seeding roles...");
  await seedRoles();

  console.log("Seeding categories...");
  for (const category of categories) {
    await seedCategoryTree(category);
  }

  const roleCount = await prisma.role.count();
  const categoryCount = await prisma.category.count();

  console.log(`Seed completed: ${roleCount} roles, ${categoryCount} categories.`);
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
