"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import {
  upsertSiteSocialLinksForAdmin,
  siteSocialLinksUpsertSchema,
  type SiteSocialLinksUpsertInput,
} from "@culebra/auth";

export type SiteConfigAdminState = {
  error?: string;
  success?: string;
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

