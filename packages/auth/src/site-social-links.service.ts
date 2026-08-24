import { prisma } from "@culebra/db";

import type { SiteSocialLinksUpsertInput } from "./site-social-links.schemas.js";

function emptyToNull(value?: string | null) {
  if (value == null || value === "") return null;
  return value;
}

export type SiteSocialLinksRecord = {
  id: number;
  facebookUrl: string | null;
  instagramUrl: string | null;
  whatsappUrl: string | null;
  updatedAt: Date;
};

function mapRow(row: {
  id: number;
  facebookUrl: string | null;
  instagramUrl: string | null;
  whatsappUrl: string | null;
  updatedAt: Date;
}): SiteSocialLinksRecord {
  return {
    id: row.id,
    facebookUrl: row.facebookUrl,
    instagramUrl: row.instagramUrl,
    whatsappUrl: row.whatsappUrl,
    updatedAt: row.updatedAt,
  };
}

export async function getSiteSocialLinks() {
  const row = await prisma.siteSocialLinks.findUnique({ where: { id: 1 } });
  if (!row) return null;
  return mapRow(row);
}

export async function upsertSiteSocialLinksForAdmin(
  input: SiteSocialLinksUpsertInput,
): Promise<SiteSocialLinksRecord> {
  // Single row (id=1). We upsert to keep UX simple in admin.
  const row = await prisma.siteSocialLinks.upsert({
    where: { id: 1 },
    create: {
      id: 1,
      facebookUrl: emptyToNull(input.facebookUrl),
      instagramUrl: emptyToNull(input.instagramUrl),
      whatsappUrl: emptyToNull(input.whatsappUrl),
    },
    update: {
      facebookUrl: emptyToNull(input.facebookUrl),
      instagramUrl: emptyToNull(input.instagramUrl),
      whatsappUrl: emptyToNull(input.whatsappUrl),
    },
  });
  return mapRow(row);
}

