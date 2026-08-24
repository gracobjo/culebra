"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import {
  deleteHomeHubTileForAdmin,
  homeHubTileUpsertSchema,
  seedHomeHubTilesIfEmpty,
  siteSocialLinksUpsertSchema,
  upsertHomeHubTileForAdmin,
  upsertSiteSocialLinksForAdmin,
  type SiteSocialLinksUpsertInput,
} from "@culebra/auth";
import { auditPublicPages, type WcagPageReport } from "@/lib/wcag-audit";

export type SiteConfigAdminState = {
  error?: string;
  success?: string;
};

export type WcagAuditState = {
  error?: string;
  reports?: WcagPageReport[];
};

export async function upsertSiteSocialLinksAction(
  _prev: SiteConfigAdminState,
  formData: FormData,
): Promise<SiteConfigAdminState> {
  await requireAdmin("/admin/config");

  const parsed = siteSocialLinksUpsertSchema.safeParse({
    facebookUrl: formData.get("facebookUrl")?.toString(),
    instagramUrl: formData.get("instagramUrl")?.toString(),
    whatsappUrl: formData.get("whatsappUrl")?.toString(),
  } satisfies SiteSocialLinksUpsertInput);

  if (!parsed.success) {
    return { error: "Revisa los enlaces. Deben ser URLs válidas (o vacíos)." };
  }

  await upsertSiteSocialLinksForAdmin(parsed.data);

  revalidatePath("/admin/config");
  revalidatePath("/contacto");
  revalidatePath("/");

  return { success: "Redes sociales actualizadas." };
}

export async function upsertHomeHubTileAction(
  _prev: SiteConfigAdminState,
  formData: FormData,
): Promise<SiteConfigAdminState> {
  await requireAdmin("/admin/config");
  const parsed = homeHubTileUpsertSchema.safeParse({
    id: formData.get("id") || undefined,
    slug: formData.get("slug"),
    title: formData.get("title"),
    href: formData.get("href"),
    description: formData.get("description"),
    imageUrl: formData.get("imageUrl"),
    altText: formData.get("altText"),
    hintText: formData.get("hintText"),
    tone: formData.get("tone") || "agro",
    sortOrder: formData.get("sortOrder") || 0,
    isActive: formData.get("isActive") === "on",
  });
  if (!parsed.success) {
    return { error: "Revisa el bloque (título, alt, mensaje al pasar el ratón e imagen)." };
  }
  try {
    await upsertHomeHubTileForAdmin(parsed.data);
    revalidatePath("/admin/config");
    revalidatePath("/");
    revalidatePath("/tienda");
    return { success: "Bloque del dashboard guardado." };
  } catch {
    return { error: "No se pudo guardar. ¿Está aplicada la migración HomeHubTile?" };
  }
}

export async function deleteHomeHubTileAction(formData: FormData) {
  await requireAdmin("/admin/config");
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await deleteHomeHubTileForAdmin(id);
  revalidatePath("/admin/config");
  revalidatePath("/");
}

export async function seedHomeHubTilesAction(
  _prev: SiteConfigAdminState,
): Promise<SiteConfigAdminState> {
  await requireAdmin("/admin/config");
  try {
    const count = await seedHomeHubTilesIfEmpty();
    revalidatePath("/admin/config");
    revalidatePath("/");
    return { success: `Bloques listos (${count}).` };
  } catch {
    return { error: "No se pudieron sembrar. Ejecuta prisma migrate y reinicia Next." };
  }
}

export async function runWcagAuditAction(
  _prev: WcagAuditState,
): Promise<WcagAuditState> {
  await requireAdmin("/admin/config");
  const base =
    process.env.AUTH_URL?.trim() ||
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    "http://127.0.0.1:3000";
  try {
    const reports = await auditPublicPages(base);
    return { reports };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "No se pudo ejecutar la auditoría WAI.",
    };
  }
}


