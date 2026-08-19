import {
  getPublicProductBySlug,
  listCategories,
  listPublicProducts,
  type ProductRecord,
} from "@culebra/auth";

import { searchFaq } from "./faq";
import type {
  AssistantCategorySummary,
  AssistantProductSummary,
  FaqMatch,
} from "./types";

function formatPrice(value: string | number): string {
  const amount = typeof value === "number" ? value : Number.parseFloat(value);
  if (!Number.isFinite(amount)) {
    return `${value} €`;
  }
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}

export function toProductSummary(
  product: ProductRecord,
  appBaseUrl: string,
): AssistantProductSummary {
  const base = appBaseUrl.replace(/\/$/, "");
  const imageUrl = product.images[0]?.url ?? null;

  return {
    name: product.name,
    slug: product.slug,
    price: formatPrice(product.basePrice),
    shortDescription: product.shortDescription,
    categoryName: product.category?.name ?? product.subcategory?.name ?? null,
    vendorName: product.vendor?.tradeName ?? null,
    origin: product.origin,
    stock: product.stock,
    url: `${base}/productos/${product.slug}`,
    imageUrl,
  };
}

export async function toolSearchProducts(input: {
  search?: string;
  categorySlug?: string;
  vendorSlug?: string;
  minPrice?: number;
  maxPrice?: number;
  limit?: number;
  appBaseUrl: string;
}): Promise<{ items: AssistantProductSummary[]; total: number }> {
  const result = await listPublicProducts({
    search: input.search,
    categorySlug: input.categorySlug,
    vendorSlug: input.vendorSlug,
    minPrice: input.minPrice,
    maxPrice: input.maxPrice,
    available: true,
    limit: Math.min(input.limit ?? 6, 12),
    offset: 0,
  });

  return {
    items: result.items.map((item) => toProductSummary(item, input.appBaseUrl)),
    total: result.total,
  };
}

export async function toolGetProductBySlug(input: {
  slug: string;
  appBaseUrl: string;
}): Promise<AssistantProductSummary | null> {
  const product = await getPublicProductBySlug(input.slug);
  if (!product) {
    return null;
  }
  return toProductSummary(product, input.appBaseUrl);
}

export async function toolListCategories(): Promise<AssistantCategorySummary[]> {
  const categories = await listCategories();
  return categories.map((category) => ({
    name: category.name,
    slug: category.slug,
    description: category.description,
  }));
}

export function toolSearchFaq(input: { query: string; limit?: number }): FaqMatch[] {
  return searchFaq(input.query, input.limit ?? 3);
}

export type ToolExecutionContext = {
  appBaseUrl: string;
};

export async function executeTool(
  name: string,
  args: Record<string, unknown>,
  context: ToolExecutionContext,
): Promise<unknown> {
  switch (name) {
    case "search_products":
      return toolSearchProducts({
        search: typeof args.search === "string" ? args.search : undefined,
        categorySlug: typeof args.categorySlug === "string" ? args.categorySlug : undefined,
        vendorSlug: typeof args.vendorSlug === "string" ? args.vendorSlug : undefined,
        minPrice: typeof args.minPrice === "number" ? args.minPrice : undefined,
        maxPrice: typeof args.maxPrice === "number" ? args.maxPrice : undefined,
        limit: typeof args.limit === "number" ? args.limit : undefined,
        appBaseUrl: context.appBaseUrl,
      });
    case "get_product":
      return toolGetProductBySlug({
        slug: String(args.slug ?? ""),
        appBaseUrl: context.appBaseUrl,
      });
    case "list_categories":
      return toolListCategories();
    case "search_faq":
      return toolSearchFaq({
        query: String(args.query ?? ""),
        limit: typeof args.limit === "number" ? args.limit : undefined,
      });
    default:
      return { error: `Herramienta desconocida: ${name}` };
  }
}

export const OPENAI_TOOLS = [
  {
    type: "function" as const,
    function: {
      name: "search_products",
      description:
        "Busca productos publicados en el catálogo por texto, categoría, productor o rango de precio.",
      parameters: {
        type: "object",
        properties: {
          search: { type: "string", description: "Texto libre (nombre, origen, productor...)" },
          categorySlug: { type: "string", description: "Slug de categoría o subcategoría" },
          vendorSlug: { type: "string", description: "Slug del productor" },
          minPrice: { type: "number", description: "Precio mínimo en EUR" },
          maxPrice: { type: "number", description: "Precio máximo en EUR" },
          limit: { type: "integer", description: "Máximo de resultados (1-12)" },
        },
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_product",
      description: "Obtiene el detalle de un producto por su slug de URL.",
      parameters: {
        type: "object",
        properties: {
          slug: { type: "string", description: "Slug del producto, p. ej. miel-de-romero" },
        },
        required: ["slug"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "list_categories",
      description: "Lista las categorías disponibles en el marketplace.",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "search_faq",
      description: "Busca respuestas frecuentes sobre envíos, pagos, devoluciones y uso del marketplace.",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "Pregunta o tema del usuario" },
          limit: { type: "integer", description: "Número máximo de entradas FAQ" },
        },
        required: ["query"],
      },
    },
  },
];
