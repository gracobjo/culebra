import { prisma } from "@culebra/db";
import {
  DEFAULT_HOME_HUB_TILES,
  type HomeHubTileUpsertInput,
} from "./home-hub.schemas.js";

export type HomeHubTileRecord = {
  id: string;
  slug: string;
  title: string;
  href: string;
  description: string;
  imageUrl: string;
  altText: string;
  hintText: string;
  tone: "agro" | "territory";
  sortOrder: number;
  isActive: boolean;
};

function mapRow(row: {
  id: string;
  slug: string;
  title: string;
  href: string;
  description: string;
  imageUrl: string;
  altText: string;
  hintText: string;
  tone: string;
  sortOrder: number;
  isActive: boolean;
}): HomeHubTileRecord {
  return {
    ...row,
    tone: row.tone === "territory" ? "territory" : "agro",
  };
}

function defaultsAsRecords(): HomeHubTileRecord[] {
  return DEFAULT_HOME_HUB_TILES.map((tile, index) => ({
    id: `default-${tile.slug}`,
    ...tile,
    sortOrder: tile.sortOrder ?? (index + 1) * 10,
  }));
}

function delegate() {
  return (
    prisma as
      | {
          homeHubTile?: {
            findMany: typeof prisma.homeHubTile.findMany;
            upsert: typeof prisma.homeHubTile.upsert;
            delete: typeof prisma.homeHubTile.delete;
            count: typeof prisma.homeHubTile.count;
          };
        }
      | undefined
  )?.homeHubTile;
}

export async function listHomeHubTilesForPublic(): Promise<HomeHubTileRecord[]> {
  try {
    const d = delegate();
    if (!d) return defaultsAsRecords();
    const rows = await d.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
    });
    if (rows.length === 0) return defaultsAsRecords();
    return rows.map(mapRow);
  } catch {
    return defaultsAsRecords();
  }
}

export async function listHomeHubTilesForAdmin(): Promise<HomeHubTileRecord[]> {
  try {
    const d = delegate();
    if (!d) return defaultsAsRecords();
    const rows = await d.findMany({
      orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
    });
    if (rows.length === 0) return defaultsAsRecords();
    return rows.map(mapRow);
  } catch {
    return defaultsAsRecords();
  }
}

export async function upsertHomeHubTileForAdmin(
  input: HomeHubTileUpsertInput,
): Promise<HomeHubTileRecord> {
  const d = delegate();
  if (!d) {
    throw new Error("Prisma no tiene HomeHubTile. Ejecuta la migración y reinicia Next.");
  }
  const data = {
    slug: input.slug,
    title: input.title,
    href: input.href,
    description: input.description,
    imageUrl: input.imageUrl,
    altText: input.altText,
    hintText: input.hintText,
    tone: input.tone,
    sortOrder: input.sortOrder,
    isActive: input.isActive,
  };
  const row = input.id?.startsWith("default-")
    ? await d.upsert({
        where: { slug: input.slug },
        create: data,
        update: data,
      })
    : input.id
      ? await d.upsert({
          where: { id: input.id },
          create: { ...data, id: input.id },
          update: data,
        })
      : await d.upsert({
          where: { slug: input.slug },
          create: data,
          update: data,
        });
  return mapRow(row);
}

export async function deleteHomeHubTileForAdmin(id: string): Promise<void> {
  const d = delegate();
  if (!d || id.startsWith("default-")) return;
  await d.delete({ where: { id } });
}

export async function seedHomeHubTilesIfEmpty(): Promise<number> {
  const d = delegate();
  if (!d) return 0;
  const count = await d.count();
  if (count > 0) return count;
  for (const tile of DEFAULT_HOME_HUB_TILES) {
    await d.upsert({
      where: { slug: tile.slug },
      create: tile,
      update: {},
    });
  }
  return DEFAULT_HOME_HUB_TILES.length;
}
