import { PrismaClient, RoleName, type ProductStatus, type VendorStatus } from "@prisma/client";
// Evitamos depender de `@culebra/auth/dist/*` (que requiere build completo).
// Para el seed local usamos la implementación en el workspace.
import { seedAdminUser } from "../../auth/src/auth.service";

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
    description:
      "Curados de la comarca: pieza, loncheados al vacío de caza y formatos gourmet (tacos). Sin frío; vigilar consumo preferente en formatos abiertos.",
    sortOrder: 1,
    children: [
      { name: "Jamon", slug: "jamon", sortOrder: 1 },
      { name: "Chorizo", slug: "chorizo", sortOrder: 2 },
      { name: "Salchichon", slug: "salchichon", sortOrder: 3 },
      {
        name: "Loncheados y tacos",
        slug: "loncheados-y-tacos",
        description: "Sobres al vacío y porciones listas (ciervo, jabalí, chorizo zamorano).",
        sortOrder: 4,
      },
      { name: "Otros embutidos", slug: "otros-embutidos", sortOrder: 5 },
      { name: "Productos derivados del cerdo", slug: "productos-derivados-del-cerdo", sortOrder: 6 },
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
    name: "Reposteria",
    slug: "reposteria",
    description:
      "Repostería seca de La Raya (soles de Aliste, rosquillas de Ramos, magdalenas de Sanabria). Sin frío; consumo preferente 30–60 días.",
    sortOrder: 6,
    children: [
      {
        name: "Dulces secos de La Raya",
        slug: "dulces-secos-la-raya",
        description: "Soles de Aliste, rosquillas de Ramos y similares.",
        sortOrder: 1,
      },
      { name: "Magdalenas y bizcochos", slug: "magdalenas-y-bizcochos", sortOrder: 2 },
      { name: "Tartas", slug: "tartas", sortOrder: 3 },
      { name: "Postres", slug: "postres", sortOrder: 4 },
      { name: "Dulces", slug: "dulces", sortOrder: 5 },
    ],
  },
  {
    name: "Productos tradicionales",
    slug: "productos-tradicionales",
    description:
      "Despensa de territorio: harina de castaña de Sanabria, mermeladas bajas en azúcar, legumbres y conservas artesanas.",
    sortOrder: 7,
    children: [
      {
        name: "Harinas y castaña",
        slug: "harinas-y-castana",
        description: "Harina de castaña de Sanabria y elaboraciones afines.",
        sortOrder: 1,
      },
      {
        name: "Mermeladas y confituras",
        slug: "mermeladas-y-confituras",
        description: "Mermeladas artesanas de frutos de la sierra, preferente bajas en azúcar.",
        sortOrder: 2,
      },
      { name: "Legumbres y conservas", slug: "legumbres-y-conservas", sortOrder: 3 },
    ],
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

// ---------------------------------------------------------------------------
// Datos de prueba: vendedores, usuarios consumidores y productos
// ---------------------------------------------------------------------------

type VendorData = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  tradeName: string;
  slug: string;
  description: string;
  city: string;
  province: string;
};

const vendorData: VendorData[] = [
  {
    email: "embutidos.serrano@culebra.local",
    password: "Vendor1234!",
    firstName: "Antonio",
    lastName: "Serrano",
    tradeName: "Embutidos Serrano",
    slug: "embutidos-serrano",
    description: "Elaboracion artesanal de embutidos ibéricos desde 1975 en la Sierra de la Culebra.",
    city: "Villardeciervos",
    province: "Zamora",
  },
  {
    email: "queseria.pedraza@culebra.local",
    password: "Vendor1234!",
    firstName: "Maria",
    lastName: "Pedraza",
    tradeName: "Queseria Pedraza",
    slug: "queseria-pedraza",
    description: "Quesos artesanos de oveja y cabra con leche de nuestros propios rebaños zamoranos.",
    city: "Mahide",
    province: "Zamora",
  },
  {
    email: "vinos.ribera.culebra@culebra.local",
    password: "Vendor1234!",
    firstName: "Carlos",
    lastName: "Ribera",
    tradeName: "Vinos Ribera de la Culebra",
    slug: "vinos-ribera-culebra",
    description: "Bodega familiar con viñedos en la comarca de la Sierra de la Culebra.",
    city: "Ferreras de Arriba",
    province: "Zamora",
  },
  {
    email: "mieles.montaraz@culebra.local",
    password: "Vendor1234!",
    firstName: "Isabel",
    lastName: "Montaraz",
    tradeName: "Mieles Montaraz",
    slug: "mieles-montaraz",
    description: "Apicultura ecologica en plena Sierra de la Culebra. Mieles crudas y sin filtrar.",
    city: "Calabor",
    province: "Zamora",
  },
  {
    email: "licores.tradicion@culebra.local",
    password: "Vendor1234!",
    firstName: "Jose",
    lastName: "Trancoso",
    tradeName: "Licores Tradicion Zamorana",
    slug: "licores-tradicion-zamorana",
    description: "Destileria artesanal de orujos y licores tradicionales de la comarca.",
    city: "Palacios de Sanabria",
    province: "Zamora",
  },
];

type ProductSeed = {
  name: string;
  slug: string;
  shortDescription: string;
  basePrice: number;
  vatRate: number;
  unit: string;
  weight: number;
  origin: string;
  categorySlug: string;
  subcategorySlug?: string;
  stock: number;
  ingredients?: string;
  allergens?: string;
  conservation?: string;
  shippingConditions?: string;
};

const productsByVendor: Record<string, ProductSeed[]> = {
  "embutidos-serrano": [
    {
      name: "Jamon iberico curado 24 meses",
      slug: "jamon-iberico-curado-24-meses",
      shortDescription: "Jamon iberico de bellota con 24 meses de curacion en bodega natural.",
      basePrice: 8.9,
      vatRate: 10,
      unit: "100g",
      weight: 0.1,
      origin: "Villardeciervos, Zamora",
      categorySlug: "embutidos-y-productos-carnicos",
      subcategorySlug: "jamon",
      stock: 30,
      ingredients: "Jamon iberico, sal, conservante (E-252), antioxidante (E-301)",
      allergens: "Ninguno",
      conservation: "Conservar en lugar fresco y seco. Temperatura 15-20 °C.",
      shippingConditions: "Envio en bolsa al vacio con proteccion de frio.",
    },
    {
      name: "Chorizo extra artesano",
      slug: "chorizo-extra-artesano",
      shortDescription: "Chorizo curado con pimenton de la Vera y carne de cerdo iberico.",
      basePrice: 4.5,
      vatRate: 10,
      unit: "250g",
      weight: 0.25,
      origin: "Villardeciervos, Zamora",
      categorySlug: "embutidos-y-productos-carnicos",
      subcategorySlug: "chorizo",
      stock: 50,
      ingredients: "Carne de cerdo iberico (70%), tocino (20%), pimenton de la Vera, ajo, sal, orégano",
      allergens: "Puede contener trazas de gluten",
      conservation: "Conservar en lugar fresco y seco.",
      shippingConditions: "Envio en atmosfera protegida.",
    },
    {
      name: "Salchichon iberico",
      slug: "salchichon-iberico",
      shortDescription: "Salchichon elaborado con carne de cerdo iberico y especias naturales.",
      basePrice: 5.2,
      vatRate: 10,
      unit: "250g",
      weight: 0.25,
      origin: "Villardeciervos, Zamora",
      categorySlug: "embutidos-y-productos-carnicos",
      subcategorySlug: "salchichon",
      stock: 45,
      ingredients: "Carne de cerdo iberico, tocino, sal, pimienta negra, nuez moscada",
      allergens: "Ninguno",
      conservation: "Conservar en lugar fresco entre 12-15 °C.",
    },
    {
      name: "Lomo embuchado iberico",
      slug: "lomo-embuchado-iberico",
      shortDescription: "Lomo de cerdo iberico embuchado y curado con pimenton dulce.",
      basePrice: 7.8,
      vatRate: 10,
      unit: "100g",
      weight: 0.1,
      origin: "Villardeciervos, Zamora",
      categorySlug: "embutidos-y-productos-carnicos",
      subcategorySlug: "otros-embutidos",
      stock: 25,
      ingredients: "Lomo de cerdo iberico, pimenton dulce, sal, ajo",
      allergens: "Ninguno",
      conservation: "Una vez abierto conservar en frio (2-4°C) y consumir en 5 dias.",
    },
    {
      name: "Morcilla de Zamora",
      slug: "morcilla-de-zamora",
      shortDescription: "Morcilla tradicional zamorana con arroz y cebolla, receta de tres generaciones.",
      basePrice: 3.8,
      vatRate: 10,
      unit: "300g",
      weight: 0.3,
      origin: "Villardeciervos, Zamora",
      categorySlug: "embutidos-y-productos-carnicos",
      subcategorySlug: "productos-derivados-del-cerdo",
      stock: 40,
      ingredients: "Sangre de cerdo, arroz, cebolla, manteca de cerdo, sal, pimienta, oregano",
      allergens: "Ninguno",
      conservation: "Conservar en frio. Consumir antes de la fecha indicada.",
    },
  ],
  "queseria-pedraza": [
    {
      name: "Queso manchego curado de oveja",
      slug: "queso-manchego-curado-oveja",
      shortDescription: "Queso de leche de oveja con 6 meses de curacion. Pasta firme y sabor intenso.",
      basePrice: 5.5,
      vatRate: 10,
      unit: "200g",
      weight: 0.2,
      origin: "Mahide, Zamora",
      categorySlug: "quesos-y-lacteos",
      subcategorySlug: "queso-de-oveja",
      stock: 35,
      ingredients: "Leche de oveja pasteurizada, cuajo, sal, fermentos lacticos",
      allergens: "Lactosa, leche",
      conservation: "Conservar entre 4-8°C.",
    },
    {
      name: "Queso fresco de cabra",
      slug: "queso-fresco-de-cabra",
      shortDescription: "Queso fresco suave elaborado con leche cruda de cabra de raza murciano-granadina.",
      basePrice: 4.2,
      vatRate: 10,
      unit: "250g",
      weight: 0.25,
      origin: "Mahide, Zamora",
      categorySlug: "quesos-y-lacteos",
      subcategorySlug: "queso-de-cabra",
      stock: 20,
      ingredients: "Leche cruda de cabra, cuajo natural, sal",
      allergens: "Lactosa, leche",
      conservation: "Conservar entre 2-4°C. Consumir en 7 dias.",
    },
    {
      name: "Queso semicurado mezcla",
      slug: "queso-semicurado-mezcla",
      shortDescription: "Mezcla de leche de oveja y vaca, curado 3 meses. Textura cremosa y sabor equilibrado.",
      basePrice: 4.8,
      vatRate: 10,
      unit: "250g",
      weight: 0.25,
      origin: "Mahide, Zamora",
      categorySlug: "quesos-y-lacteos",
      subcategorySlug: "queso-de-vaca",
      stock: 30,
      ingredients: "Leche de oveja y vaca pasteurizada, cuajo, sal, fermentos",
      allergens: "Lactosa, leche",
      conservation: "Conservar entre 4-8°C.",
    },
    {
      name: "Yogur artesano de oveja",
      slug: "yogur-artesano-de-oveja",
      shortDescription: "Yogur natural elaborado con leche entera de oveja. Sin conservantes ni colorantes.",
      basePrice: 1.9,
      vatRate: 4,
      unit: "200g",
      weight: 0.2,
      origin: "Mahide, Zamora",
      categorySlug: "quesos-y-lacteos",
      subcategorySlug: "otros-productos-lacteos",
      stock: 24,
      ingredients: "Leche pasteurizada de oveja, fermentos lacticos vivos",
      allergens: "Lactosa, leche",
      conservation: "Conservar entre 2-4°C. Consumir antes de la fecha indicada.",
    },
    {
      name: "Queso tierno de vaca",
      slug: "queso-tierno-de-vaca",
      shortDescription: "Queso de vaca de pasta blanda, ideal para fundir. Sabor suave y textura elastica.",
      basePrice: 3.9,
      vatRate: 10,
      unit: "300g",
      weight: 0.3,
      origin: "Mahide, Zamora",
      categorySlug: "quesos-y-lacteos",
      subcategorySlug: "queso-de-vaca",
      stock: 28,
      ingredients: "Leche pasteurizada de vaca, cuajo, sal, fermentos",
      allergens: "Lactosa, leche",
      conservation: "Conservar entre 2-4°C.",
    },
  ],
  "vinos-ribera-culebra": [
    {
      name: "Tinto Reserva Sierra de la Culebra 2020",
      slug: "tinto-reserva-sierra-culebra-2020",
      shortDescription: "Vino tinto reserva elaborado con Tempranillo y Garnacha. 14 meses en barrica de roble.",
      basePrice: 12.5,
      vatRate: 21,
      unit: "750ml",
      weight: 1.2,
      origin: "Ferreras de Arriba, Zamora",
      categorySlug: "vinos",
      subcategorySlug: "vinos-tintos",
      stock: 60,
      ingredients: "Uva Tempranillo (80%), Garnacha (20%)",
      allergens: "Sulfitos",
      conservation: "Conservar en posicion horizontal a 14-18°C, alejado de la luz.",
      shippingConditions: "Envio protegido con caja de cartón reforzado.",
    },
    {
      name: "Blanco Verdejo 2023",
      slug: "blanco-verdejo-2023",
      shortDescription: "Vino blanco joven con uva Verdejo de la comarca. Fresco, afrutado y con buena acidez.",
      basePrice: 7.9,
      vatRate: 21,
      unit: "750ml",
      weight: 1.2,
      origin: "Ferreras de Arriba, Zamora",
      categorySlug: "vinos",
      subcategorySlug: "vinos-blancos",
      stock: 80,
      ingredients: "Uva Verdejo (100%)",
      allergens: "Sulfitos",
      conservation: "Conservar entre 8-12°C.",
    },
    {
      name: "Rosado Garnacha 2023",
      slug: "rosado-garnacha-2023",
      shortDescription: "Rosado de sangrado de Garnacha. Color salmon intenso, aromas a frutos rojos.",
      basePrice: 8.5,
      vatRate: 21,
      unit: "750ml",
      weight: 1.2,
      origin: "Ferreras de Arriba, Zamora",
      categorySlug: "vinos",
      subcategorySlug: "vinos-rosados",
      stock: 55,
      ingredients: "Uva Garnacha (100%)",
      allergens: "Sulfitos",
      conservation: "Conservar entre 6-10°C. Consumir fresco.",
    },
    {
      name: "Crianza Tempranillo 2021",
      slug: "crianza-tempranillo-2021",
      shortDescription: "Crianza con 12 meses en barrica y 12 meses en botella. Notas de vainilla y fruta madura.",
      basePrice: 10.5,
      vatRate: 21,
      unit: "750ml",
      weight: 1.2,
      origin: "Ferreras de Arriba, Zamora",
      categorySlug: "vinos",
      subcategorySlug: "vinos-tintos",
      stock: 70,
      ingredients: "Uva Tempranillo (90%), Cabernet Sauvignon (10%)",
      allergens: "Sulfitos",
      conservation: "Conservar en posicion horizontal a 14-18°C.",
      shippingConditions: "Envio protegido con caja de cartón reforzado.",
    },
    {
      name: "Espumoso Brut Nature",
      slug: "espumoso-brut-nature",
      shortDescription: "Elaborado por metodo tradicional. Burbujas finas y persistentes, ideal como aperitivo.",
      basePrice: 11.9,
      vatRate: 21,
      unit: "750ml",
      weight: 1.3,
      origin: "Ferreras de Arriba, Zamora",
      categorySlug: "vinos",
      subcategorySlug: "vinos-otros",
      stock: 40,
      ingredients: "Uva Verdejo y Macabeo",
      allergens: "Sulfitos",
      conservation: "Conservar entre 6-8°C. Servir muy fresco.",
    },
  ],
  "mieles-montaraz": [
    {
      name: "Miel de monte multifloral",
      slug: "miel-de-monte-multifloral",
      shortDescription: "Miel cruda multifloral recogida en primavera en la Sierra de la Culebra. Sin pasteurizar.",
      basePrice: 9.5,
      vatRate: 10,
      unit: "500g",
      weight: 0.5,
      origin: "Calabor, Zamora",
      categorySlug: "miel-y-productos-apicolas",
      subcategorySlug: "miel",
      stock: 50,
      ingredients: "Miel pura de abejas",
      allergens: "Puede contener trazas de polen",
      conservation: "Conservar en lugar fresco y seco, alejado de la luz directa.",
    },
    {
      name: "Miel de brezo",
      slug: "miel-de-brezo",
      shortDescription: "Miel oscura y aromática de flor de brezo. Sabor intenso y ligeramente amargo.",
      basePrice: 11.5,
      vatRate: 10,
      unit: "500g",
      weight: 0.5,
      origin: "Calabor, Zamora",
      categorySlug: "miel-y-productos-apicolas",
      subcategorySlug: "miel",
      stock: 35,
      ingredients: "Miel pura de abejas, florada de brezo",
      allergens: "Puede contener trazas de polen",
      conservation: "Conservar entre 15-20°C. No refrigerar.",
    },
    {
      name: "Polen de abeja fresco",
      slug: "polen-de-abeja-fresco",
      shortDescription: "Polen polifloral recogido en primavera. Alto contenido en proteinas y vitaminas.",
      basePrice: 12.0,
      vatRate: 10,
      unit: "250g",
      weight: 0.25,
      origin: "Calabor, Zamora",
      categorySlug: "miel-y-productos-apicolas",
      subcategorySlug: "polen",
      stock: 20,
      ingredients: "Polen de abejas (100%)",
      allergens: "Polen, puede causar reacciones alergicas",
      conservation: "Conservar en frio (2-4°C) para preservar propiedades.",
    },
    {
      name: "Jalea real fresca",
      slug: "jalea-real-fresca",
      shortDescription: "Jalea real pura extraida manualmente. Sin aditivos ni conservantes.",
      basePrice: 18.0,
      vatRate: 10,
      unit: "30g",
      weight: 0.03,
      origin: "Calabor, Zamora",
      categorySlug: "miel-y-productos-apicolas",
      subcategorySlug: "jalea-real",
      stock: 15,
      ingredients: "Jalea real (100%)",
      allergens: "Puede causar reacciones alergicas en personas sensibles",
      conservation: "Conservar entre 2-4°C. Consumir antes de la fecha indicada.",
    },
    {
      name: "Cera de abeja virgen",
      slug: "cera-de-abeja-virgen",
      shortDescription: "Cera natural de colmena, ideal para uso cosmético y doméstico.",
      basePrice: 7.5,
      vatRate: 21,
      unit: "100g",
      weight: 0.1,
      origin: "Calabor, Zamora",
      categorySlug: "miel-y-productos-apicolas",
      subcategorySlug: "otros-productos-apicolas",
      stock: 30,
      ingredients: "Cera de abejas 100% natural",
      allergens: "Ninguno",
      conservation: "Conservar en lugar fresco y seco.",
    },
  ],
  "licores-tradicion-zamorana": [
    {
      name: "Orujo blanco de la Sierra",
      slug: "orujo-blanco-sierra",
      shortDescription: "Orujo blanco destilado de orujo de uva Mencía. 40% vol. Sabor limpio y suave.",
      basePrice: 14.0,
      vatRate: 21,
      unit: "500ml",
      weight: 0.7,
      origin: "Palacios de Sanabria, Zamora",
      categorySlug: "licores",
      subcategorySlug: "orujo",
      stock: 45,
      ingredients: "Aguardiente de orujo de uva, agua",
      allergens: "Ninguno",
      conservation: "Conservar en lugar fresco y seco. Consumo responsable.",
      shippingConditions: "Envio con proteccion de espuma. Solo mayores de 18 anios.",
    },
    {
      name: "Orujo de hierbas artesano",
      slug: "orujo-de-hierbas-artesano",
      shortDescription: "Orujo macerado con hierbas de la sierra: manzanilla, romero y tila. 35% vol.",
      basePrice: 15.5,
      vatRate: 21,
      unit: "500ml",
      weight: 0.7,
      origin: "Palacios de Sanabria, Zamora",
      categorySlug: "licores",
      subcategorySlug: "orujo",
      stock: 40,
      ingredients: "Aguardiente de orujo, agua, manzanilla, romero, tila, azucar",
      allergens: "Ninguno",
      conservation: "Conservar en lugar fresco y oscuro.",
    },
    {
      name: "Licor de miel y limon",
      slug: "licor-de-miel-y-limon",
      shortDescription: "Licor tradicional elaborado con miel de la comarca y limon natural. Suave y dulce.",
      basePrice: 13.0,
      vatRate: 21,
      unit: "500ml",
      weight: 0.7,
      origin: "Palacios de Sanabria, Zamora",
      categorySlug: "licores",
      subcategorySlug: "licores-tradicionales",
      stock: 38,
      ingredients: "Aguardiente, miel, zumo de limon, agua",
      allergens: "Puede contener trazas de lactosa",
      conservation: "Conservar entre 10-18°C.",
    },
    {
      name: "Patxaran artesano",
      slug: "patxaran-artesano",
      shortDescription: "Licor de endrinas silvestres maceradas en aguardiente. Receta tradicional. 25% vol.",
      basePrice: 12.5,
      vatRate: 21,
      unit: "500ml",
      weight: 0.7,
      origin: "Palacios de Sanabria, Zamora",
      categorySlug: "licores",
      subcategorySlug: "licores-tradicionales",
      stock: 42,
      ingredients: "Aguardiente, endrinas, azucar, agua",
      allergens: "Ninguno",
      conservation: "Conservar en lugar fresco.",
    },
    {
      name: "Licor de castana",
      slug: "licor-de-castana",
      shortDescription: "Licor elaborado con castanas asadas de la sierra. Aroma intenso, sabor caramelizado.",
      basePrice: 14.5,
      vatRate: 21,
      unit: "500ml",
      weight: 0.7,
      origin: "Palacios de Sanabria, Zamora",
      categorySlug: "licores",
      subcategorySlug: "licores-tradicionales",
      stock: 30,
      ingredients: "Aguardiente, castanas asadas, azucar, agua, vainilla",
      allergens: "Frutos de cascara",
      conservation: "Conservar en lugar fresco y oscuro.",
    },
  ],
};

const consumerUsers = [
  { email: "laura.garcia@example.com", firstName: "Laura", lastName: "Garcia", password: "Consumer1234!" },
  { email: "miguel.fernandez@example.com", firstName: "Miguel", lastName: "Fernandez", password: "Consumer1234!" },
  { email: "sofia.martinez@example.com", firstName: "Sofia", lastName: "Martinez", password: "Consumer1234!" },
];

async function hashPasswordSimple(password: string): Promise<string> {
  const { hashPassword } = await import("../../auth/src/password");
  return hashPassword(password);
}

async function seedConsumerUsers() {
  const consumerRole = await prisma.role.findUnique({ where: { name: "CONSUMER" } });
  if (!consumerRole) throw new Error("CONSUMER role not found");

  for (const u of consumerUsers) {
    const existing = await prisma.user.findUnique({ where: { email: u.email } });
    if (existing) continue;
    const passwordHash = await hashPasswordSimple(u.password);
    await prisma.user.create({
      data: {
        email: u.email,
        passwordHash,
        firstName: u.firstName,
        lastName: u.lastName,
        roles: { create: { roleId: consumerRole.id } },
      },
    });
  }
}

async function seedVendorsAndProducts() {
  const vendorRole = await prisma.role.findUnique({ where: { name: "VENDOR" } });
  if (!vendorRole) throw new Error("VENDOR role not found");

  for (const v of vendorData) {
    // Create or find user
    let user = await prisma.user.findUnique({ where: { email: v.email } });
    if (!user) {
      const passwordHash = await hashPasswordSimple(v.password);
      user = await prisma.user.create({
        data: {
          email: v.email,
          passwordHash,
          firstName: v.firstName,
          lastName: v.lastName,
          roles: { create: { roleId: vendorRole.id } },
        },
      });
    }

    // Create or find vendor
    let vendor = await prisma.vendor.findUnique({ where: { slug: v.slug } });
    if (!vendor) {
      vendor = await prisma.vendor.create({
        data: {
          userId: user.id,
          tradeName: v.tradeName,
          slug: v.slug,
          description: v.description,
          city: v.city,
          province: v.province,
          country: "ES",
          status: "ACTIVE" as VendorStatus,
        },
      });
    }

    const existingCommissionRule = await prisma.commissionRule.findFirst({
      where: {
        vendorId: vendor.id,
        ruleType: "PERCENTAGE",
        validTo: null,
      },
    });
    if (!existingCommissionRule) {
      await prisma.commissionRule.create({
        data: {
          vendorId: vendor.id,
          versionNumber: 1,
          ruleType: "PERCENTAGE",
          percentage: 17,
          validFrom: new Date(),
          notes: "Comision por defecto de la plataforma (seed)",
        },
      });
    }

    // Create products for this vendor
    const products = productsByVendor[v.slug] ?? [];
    for (const p of products) {
      const category = await prisma.category.findUnique({ where: { slug: p.categorySlug } });
      if (!category) {
        console.warn(`Category not found: ${p.categorySlug}`);
        continue;
      }
      let subcategory = null;
      if (p.subcategorySlug) {
        subcategory = await prisma.category.findUnique({ where: { slug: p.subcategorySlug } });
      }

      const existingProduct = await prisma.product.findFirst({
        where: { vendorId: vendor.id, slug: p.slug },
      });
      if (existingProduct) continue;

      const product = await prisma.product.create({
        data: {
          vendorId: vendor.id,
          categoryId: category.id,
          subcategoryId: subcategory?.id ?? null,
          name: p.name,
          slug: p.slug,
          shortDescription: p.shortDescription,
          basePrice: p.basePrice,
          vatRate: p.vatRate,
          unit: p.unit,
          weight: p.weight,
          origin: p.origin,
          ingredients: p.ingredients,
          allergens: p.allergens,
          conservation: p.conservation,
          shippingConditions: p.shippingConditions,
          status: "PUBLISHED" as ProductStatus,
        },
      });

      const inv = await prisma.inventory.findFirst({ where: { productId: product.id, variantId: null } });
      if (inv) {
        await prisma.inventory.update({ where: { id: inv.id }, data: { stock: p.stock } });
      } else {
        await prisma.inventory.create({ data: { vendorId: vendor.id, productId: product.id, stock: p.stock } });
      }
    }
  }
}

async function seedTourismModule() {
  const products = await prisma.product.findMany({
    where: { status: "PUBLISHED", deletedAt: null },
    orderBy: { createdAt: "asc" },
    take: 6,
    select: { id: true, slug: true, name: true },
  });

  const casa = await prisma.accommodation.upsert({
    where: { slug: "casa-rural-foz-culebra" },
    update: {
      name: "Casa Rural Foz de la Culebra",
      shortDescription:
        "Casa rural en el entorno de Villardeciervos. Ideal para escapadas a la sierra.",
      kind: "CASA_RURAL",
      city: "Villardeciervos",
      municipality: "Villardeciervos",
      province: "Zamora",
      bookingChannel: "WEBSITE",
      websiteUrl: "https://example.com/casa-foz",
      bookingUrl: "https://example.com/casa-foz/reservar",
      capacity: 6,
      status: "PUBLISHED",
      sortOrder: 1,
    },
    create: {
      name: "Casa Rural Foz de la Culebra",
      slug: "casa-rural-foz-culebra",
      shortDescription:
        "Casa rural en el entorno de Villardeciervos. Ideal para escapadas a la sierra.",
      longDescription:
        "Alojamiento de ejemplo para el directorio territorial. La reserva se gestiona en su web.",
      kind: "CASA_RURAL",
      city: "Villardeciervos",
      municipality: "Villardeciervos",
      province: "Zamora",
      bookingChannel: "WEBSITE",
      websiteUrl: "https://example.com/casa-foz",
      bookingUrl: "https://example.com/casa-foz/reservar",
      capacity: 6,
      status: "PUBLISHED",
      sortOrder: 1,
    },
  });

  const hostal = await prisma.accommodation.upsert({
    where: { slug: "hostal-sierra-culebra" },
    update: {
      name: "Hostal Sierra de la Culebra",
      shortDescription: "Hostal familiar en la sierra. Reserva por WhatsApp o telefono.",
      kind: "HOSTAL",
      city: "Ferreras de Arriba",
      province: "Zamora",
      bookingChannel: "WHATSAPP",
      whatsapp: "34600000000",
      phone: "+34 980 000 000",
      status: "PUBLISHED",
      sortOrder: 2,
    },
    create: {
      name: "Hostal Sierra de la Culebra",
      slug: "hostal-sierra-culebra",
      shortDescription: "Hostal familiar en la sierra. Reserva por WhatsApp o telefono.",
      kind: "HOSTAL",
      city: "Ferreras de Arriba",
      province: "Zamora",
      bookingChannel: "WHATSAPP",
      whatsapp: "34600000000",
      phone: "+34 980 000 000",
      status: "PUBLISHED",
      sortOrder: 2,
    },
  });

  if (products.length > 0) {
    await prisma.accommodationProduct.deleteMany({
      where: { accommodationId: { in: [casa.id, hostal.id] } },
    });
    await prisma.accommodationProduct.createMany({
      data: products.slice(0, 3).map((product, index) => ({
        accommodationId: casa.id,
        productId: product.id,
        sortOrder: index,
      })),
    });
    if (products[3]) {
      await prisma.accommodationProduct.create({
        data: {
          accommodationId: hostal.id,
          productId: products[3].id,
          sortOrder: 0,
        },
      });
    }
  }

  const coupon = await prisma.coupon.upsert({
    where: { code: "SIERRA10" },
    update: {
      name: "Bienvenida sierra 10%",
      discountType: "PERCENTAGE",
      discountValue: 10,
      minOrderAmount: 25,
      isActive: true,
    },
    create: {
      code: "SIERRA10",
      name: "Bienvenida sierra 10%",
      description: "10% en pedidos a partir de 25 EUR (seed).",
      discountType: "PERCENTAGE",
      discountValue: 10,
      minOrderAmount: 25,
      isActive: true,
    },
  });

  await prisma.affiliateCode.upsert({
    where: { code: "CASAFOZ" },
    update: {
      label: "Casa Foz — afiliado",
      accommodationId: casa.id,
      isActive: true,
    },
    create: {
      code: "CASAFOZ",
      label: "Casa Foz — afiliado",
      accommodationId: casa.id,
      isActive: true,
      notes: "Enlace: /productos?ref=CASAFOZ",
    },
  });

  if (products.length >= 2) {
    const pack = await prisma.tourismPack.upsert({
      where: { slug: "noche-lote-gourmet-foz" },
      update: {
        name: "Noche + lote gourmet Foz",
        shortDescription:
          "Reserva la casa en su web y anade el lote gourmet al carrito del marketplace.",
        accommodationId: casa.id,
        nightsHint: "1–2 noches (reserva externa)",
        status: "PUBLISHED",
        sortOrder: 1,
        couponId: coupon.id,
      },
      create: {
        name: "Noche + lote gourmet Foz",
        slug: "noche-lote-gourmet-foz",
        shortDescription:
          "Reserva la casa en su web y anade el lote gourmet al carrito del marketplace.",
        longDescription:
          "Pack de ejemplo fase 3: la noche no se cobra aqui; el lote si.",
        accommodationId: casa.id,
        nightsHint: "1–2 noches (reserva externa)",
        status: "PUBLISHED",
        sortOrder: 1,
        couponId: coupon.id,
      },
    });

    await prisma.tourismPackItem.deleteMany({ where: { packId: pack.id } });
    await prisma.tourismPackItem.createMany({
      data: products.slice(0, 2).map((product, index) => ({
        packId: pack.id,
        productId: product.id,
        quantity: 1,
        sortOrder: index,
      })),
    });
  }
}

async function seedPilotCategories() {
  const pilotCategories: Array<{
    name: string;
    slug: string;
    icon: string;
    sortOrder: number;
  }> = [
    // Agroalimentario (catálogo gourmet de lanzamiento)
    { name: "Miel", slug: "miel", icon: "🍯", sortOrder: 10 },
    { name: "Embutidos de Caza", slug: "embutidos-de-caza", icon: "🦌", sortOrder: 20 },
    { name: "Queso de Autor", slug: "queso-de-autor", icon: "🧀", sortOrder: 30 },
    { name: "Vinos y Licores", slug: "vinos-y-licores", icon: "🍷", sortOrder: 40 },
    { name: "Conservas y Mermeladas", slug: "conservas-y-mermeladas", icon: "🫙", sortOrder: 50 },
    { name: "Repostería artesana", slug: "reposteria-artesana", icon: "🥖", sortOrder: 60 },
    { name: "Aceites y condimentos", slug: "aceites-y-condimentos", icon: "🫒", sortOrder: 70 },
    // Hostelería / turismo rural (efecto llamada territorial)
    { name: "Restaurantes y mesones", slug: "restaurantes-y-mesones", icon: "🍽️", sortOrder: 110 },
    { name: "Casas rurales", slug: "casas-rurales", icon: "🏡", sortOrder: 120 },
    { name: "Hoteles y alojamientos", slug: "hoteles-y-alojamientos", icon: "🏨", sortOrder: 130 },
    { name: "Bares y tapas", slug: "bares-y-tapas", icon: "🍺", sortOrder: 140 },
    { name: "Catering y eventos", slug: "catering-y-eventos", icon: "🎉", sortOrder: 150 },
    { name: "Turismo activo / experiencias", slug: "turismo-activo-experiencias", icon: "🥾", sortOrder: 160 },
  ];

  for (const item of pilotCategories) {
    await prisma.pilotCategory.upsert({
      where: { slug: item.slug },
      create: item,
      update: {
        name: item.name,
        icon: item.icon,
        sortOrder: item.sortOrder,
        isActive: true,
      },
    });
  }
}

async function main() {
  console.log("Seeding roles...");
  await seedRoles();

  console.log("Seeding categories...");
  for (const category of categories) {
    await seedCategoryTree(category);
  }

  console.log("Seeding admin user...");
  await seedAdminUser();

  console.log("Seeding consumer users...");
  await seedConsumerUsers();

  console.log("Seeding vendors and products...");
  await seedVendorsAndProducts();

  console.log("Seeding tourism module (alojamientos, packs, cupones, afiliados)...");
  await seedTourismModule();

  console.log("Seeding pilot categories...");
  await seedPilotCategories();

  const roleCount = await prisma.role.count();
  const categoryCount = await prisma.category.count();
  const vendorCount = await prisma.vendor.count();
  const productCount = await prisma.product.count();
  const userCount = await prisma.user.count();
  const accommodationCount = await prisma.accommodation.count();
  const pilotCategoryCount = await prisma.pilotCategory.count();

  console.log(
    `Seed completed: ${roleCount} roles, ${categoryCount} categories, ` +
    `${vendorCount} vendors, ${productCount} products, ${userCount} users, ` +
    `${accommodationCount} accommodations, ${pilotCategoryCount} pilot categories.`
  );
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
