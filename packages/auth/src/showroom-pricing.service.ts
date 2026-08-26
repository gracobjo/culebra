import { prisma } from "@culebra/db";
import type { Prisma } from "@prisma/client";

import type {
  ShowroomPriceBulkUpdateInput,
  ShowroomPriceItemUpdateInput,
} from "./showroom-pricing.schemas.js";

export type ShowroomPriceKindKey =
  | "BASKET"
  | "PACKAGING_UNIT"
  | "MERCH"
  | "EXPERIENCE";

export type ShowroomPriceCatalogRecord = {
  id: string;
  kind: ShowroomPriceKindKey;
  key: string;
  label: string;
  sortOrder: number;
  costEur: number | null;
  pvpEur: number | null;
  notes: string | null;
  isActive: boolean;
  updatedAt: Date;
};

export const SHOWROOM_PRICE_KIND_LABELS: Record<ShowroomPriceKindKey, string> = {
  BASKET: "Cestas (PVP + packaging)",
  PACKAGING_UNIT: "Piezas de packaging",
  MERCH: "Merchandising propio",
  EXPERIENCE: "Experiencias / catas",
};

/** Semilla alineada al playbook (showroom-cestas / packaging / impulso). */
const DEFAULT_CATALOG: Array<{
  kind: ShowroomPriceKindKey;
  key: string;
  label: string;
  sortOrder: number;
  costEur: number | null;
  pvpEur: number | null;
  notes: string;
}> = [
  {
    kind: "BASKET",
    key: "cesta-escapada",
    label: "Cesta Escapada",
    sortOrder: 10,
    costEur: 1.8,
    pvpEur: 29,
    notes: "Coste = packaging S.L.; PVP = ticket objetivo",
  },
  {
    kind: "BASKET",
    key: "cesta-comarca",
    label: "Cesta Comarca",
    sortOrder: 20,
    costEur: 2.4,
    pvpEur: 45,
    notes: "Estrella del showroom",
  },
  {
    kind: "BASKET",
    key: "cesta-sierra",
    label: "Cesta Sierra",
    sortOrder: 30,
    costEur: 3.2,
    pvpEur: 65,
    notes: "Regalo bueno",
  },
  {
    kind: "BASKET",
    key: "cesta-reserva",
    label: "Cesta Reserva",
    sortOrder: 40,
    costEur: 4.5,
    pvpEur: 89,
    notes: "Premium / Navidad",
  },
  {
    kind: "PACKAGING_UNIT",
    key: "caja-kraft-sm",
    label: "Caja kraft pequeña/mediana",
    sortOrder: 10,
    costEur: 0.95,
    pvpEur: null,
    notes: "Rango playbook 0,70–1,20 €",
  },
  {
    kind: "PACKAGING_UNIT",
    key: "caja-kraft-premium",
    label: "Caja kraft premium",
    sortOrder: 20,
    costEur: 2.3,
    pvpEur: null,
    notes: "Rango 1,80–2,80 €",
  },
  {
    kind: "PACKAGING_UNIT",
    key: "tag-madera",
    label: "Tag madera/cartón",
    sortOrder: 30,
    costEur: 0.35,
    pvpEur: null,
    notes: "Rango 0,25–0,45 €",
  },
  {
    kind: "PACKAGING_UNIT",
    key: "relleno-cordel",
    label: "Relleno + cordel",
    sortOrder: 40,
    costEur: 0.4,
    pvpEur: null,
    notes: "Rango 0,30–0,50 €",
  },
  {
    kind: "PACKAGING_UNIT",
    key: "tarjeta-origen",
    label: "Tarjeta de origen",
    sortOrder: 50,
    costEur: 0.2,
    pvpEur: null,
    notes: "Rango 0,15–0,25 €",
  },
  {
    kind: "MERCH",
    key: "tote",
    label: "Bolsa tote marca",
    sortOrder: 10,
    costEur: 3.5,
    pvpEur: 9,
    notes: "Compra propia; PVP orientativo 6–10 €",
  },
  {
    kind: "EXPERIENCE",
    key: "minicata",
    label: "Mini-cata (3 productos)",
    sortOrder: 10,
    costEur: 1.5,
    pvpEur: 7,
    notes: "Ticket por persona; PVP orientativo 6–8 €",
  },
  {
    kind: "EXPERIENCE",
    key: "cata-taller",
    label: "Cata / taller (sesión)",
    sortOrder: 20,
    costEur: 20,
    pvpEur: 45,
    notes: "Ingreso propio S.L. o con productor",
  },
  {
    kind: "EXPERIENCE",
    key: "catas-annual-plan",
    label: "Catas / talleres (ingreso anual plan)",
    sortOrder: 30,
    costEur: null,
    pvpEur: 800,
    notes: "Usado como catasY1 en /admin/plan (PyG)",
  },
];

function toNumber(value: Prisma.Decimal | number | string | null | undefined): number | null {
  if (value == null) return null;
  return Number(value);
}

function mapRow(row: {
  id: string;
  kind: string;
  key: string;
  label: string;
  sortOrder: number;
  costEur: Prisma.Decimal | null;
  pvpEur: Prisma.Decimal | null;
  notes: string | null;
  isActive: boolean;
  updatedAt: Date;
}): ShowroomPriceCatalogRecord {
  return {
    id: row.id,
    kind: row.kind as ShowroomPriceKindKey,
    key: row.key,
    label: row.label,
    sortOrder: row.sortOrder,
    costEur: toNumber(row.costEur),
    pvpEur: toNumber(row.pvpEur),
    notes: row.notes,
    isActive: row.isActive,
    updatedAt: row.updatedAt,
  };
}

async function ensureDefaults(): Promise<void> {
  const count = await prisma.showroomPriceCatalogItem.count();
  if (count > 0) return;

  await prisma.showroomPriceCatalogItem.createMany({
    data: DEFAULT_CATALOG.map((row) => ({
      kind: row.kind,
      key: row.key,
      label: row.label,
      sortOrder: row.sortOrder,
      costEur: row.costEur,
      pvpEur: row.pvpEur,
      notes: row.notes,
      isActive: true,
    })),
  });
}

export async function listShowroomPriceCatalog(): Promise<ShowroomPriceCatalogRecord[]> {
  await ensureDefaults();
  const rows = await prisma.showroomPriceCatalogItem.findMany({
    orderBy: [{ kind: "asc" }, { sortOrder: "asc" }, { label: "asc" }],
  });
  return rows.map(mapRow);
}

export async function getShowroomPriceMap(): Promise<Map<string, ShowroomPriceCatalogRecord>> {
  const rows = await listShowroomPriceCatalog();
  return new Map(rows.filter((r) => r.isActive).map((r) => [r.key, r]));
}

export async function updateShowroomPriceItem(
  input: ShowroomPriceItemUpdateInput,
): Promise<ShowroomPriceCatalogRecord> {
  const data: Prisma.ShowroomPriceCatalogItemUpdateInput = {};
  if (input.label !== undefined) data.label = input.label;
  if (input.costEur !== undefined) data.costEur = input.costEur;
  if (input.pvpEur !== undefined) data.pvpEur = input.pvpEur;
  if (input.notes !== undefined) data.notes = input.notes;
  if (input.isActive !== undefined) data.isActive = input.isActive;
  if (input.sortOrder !== undefined) data.sortOrder = input.sortOrder;

  const row = await prisma.showroomPriceCatalogItem.update({
    where: { id: input.id },
    data,
  });
  return mapRow(row);
}

export async function updateShowroomPriceCatalogBulk(
  input: ShowroomPriceBulkUpdateInput,
): Promise<ShowroomPriceCatalogRecord[]> {
  const updated: ShowroomPriceCatalogRecord[] = [];
  for (const item of input.items) {
    updated.push(await updateShowroomPriceItem(item));
  }
  return updated;
}

export async function resetShowroomPriceCatalogToDefaults(): Promise<ShowroomPriceCatalogRecord[]> {
  await prisma.showroomPriceCatalogItem.deleteMany({});
  await ensureDefaults();
  return listShowroomPriceCatalog();
}

/** Valores útiles para simuladores (plan / impulso / packaging). */
export type ShowroomPricingSnapshot = {
  baskets: Record<string, { pvp: number; packagingCost: number }>;
  tote: { unitCost: number; pvp: number };
  minicata: { unitCost: number; pvp: number };
  cataTaller: { unitCost: number; pvp: number };
  catasAnnualPlan: number;
  packagingPerBasketDefault: number;
  packagingUnits: Array<{ key: string; label: string; costEur: number }>;
};

export async function getShowroomPricingSnapshot(): Promise<ShowroomPricingSnapshot> {
  const map = await getShowroomPriceMap();
  const basketKeys = ["cesta-escapada", "cesta-comarca", "cesta-sierra", "cesta-reserva"] as const;
  const baskets: ShowroomPricingSnapshot["baskets"] = {};
  for (const key of basketKeys) {
    const row = map.get(key);
    baskets[key] = {
      pvp: row?.pvpEur ?? DEFAULT_CATALOG.find((d) => d.key === key)?.pvpEur ?? 0,
      packagingCost: row?.costEur ?? DEFAULT_CATALOG.find((d) => d.key === key)?.costEur ?? 0,
    };
  }

  const toteDef = DEFAULT_CATALOG.find((d) => d.key === "tote")!;
  const miniDef = DEFAULT_CATALOG.find((d) => d.key === "minicata")!;
  const cataDef = DEFAULT_CATALOG.find((d) => d.key === "cata-taller")!;
  const annualDef = DEFAULT_CATALOG.find((d) => d.key === "catas-annual-plan")!;

  const tote = map.get("tote");
  const minicata = map.get("minicata");
  const cataTaller = map.get("cata-taller");
  const annual = map.get("catas-annual-plan");

  const packagingUnits = [...map.values()]
    .filter((r) => r.kind === "PACKAGING_UNIT" && r.costEur != null)
    .map((r) => ({ key: r.key, label: r.label, costEur: r.costEur! }));

  return {
    baskets,
    tote: {
      unitCost: tote?.costEur ?? toteDef.costEur!,
      pvp: tote?.pvpEur ?? toteDef.pvpEur!,
    },
    minicata: {
      unitCost: minicata?.costEur ?? miniDef.costEur!,
      pvp: minicata?.pvpEur ?? miniDef.pvpEur!,
    },
    cataTaller: {
      unitCost: cataTaller?.costEur ?? cataDef.costEur!,
      pvp: cataTaller?.pvpEur ?? cataDef.pvpEur!,
    },
    catasAnnualPlan: annual?.pvpEur ?? annualDef.pvpEur!,
    packagingPerBasketDefault: baskets["cesta-comarca"]?.packagingCost ?? 2.4,
    packagingUnits,
  };
}
