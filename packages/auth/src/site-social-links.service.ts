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

function socialLinksFromEnv(): SiteSocialLinksRecord | null {
  const facebookUrl = emptyToNull(process.env.MARKETPLACE_FACEBOOK_URL);
  const instagramUrl = emptyToNull(process.env.MARKETPLACE_INSTAGRAM_URL);
  const whatsappUrl = emptyToNull(process.env.MARKETPLACE_WHATSAPP_URL);
  if (!facebookUrl && !instagramUrl && !whatsappUrl) return null;
  return {
    id: 0,
    facebookUrl,
    instagramUrl,
    whatsappUrl,
    updatedAt: new Date(0),
  };
}

function socialLinksDelegate() {
  return (
    prisma as
      | {
          siteSocialLinks?: {
            findUnique: typeof prisma.siteSocialLinks.findUnique;
            upsert: typeof prisma.siteSocialLinks.upsert;
          };
        }
      | undefined
  )?.siteSocialLinks;
}

export async function getSiteSocialLinks() {
  try {
    const delegate = socialLinksDelegate();
    if (!delegate) return socialLinksFromEnv();
    const row = await delegate.findUnique({ where: { id: 1 } });
    if (!row) return socialLinksFromEnv();
    return mapRow(row);
  } catch {
    // Tabla no migrada, cliente Prisma antiguo o BD caída: contacto no debe romper.
    return socialLinksFromEnv();
  }
}

export async function upsertSiteSocialLinksForAdmin(
  input: SiteSocialLinksUpsertInput,
): Promise<SiteSocialLinksRecord> {
  const delegate = socialLinksDelegate();
  if (!delegate) {
    throw new Error(
      "Prisma no tiene SiteSocialLinks. Reinicia el servidor de desarrollo y ejecuta la migración.",
    );
  }

  const row = await delegate.upsert({
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
