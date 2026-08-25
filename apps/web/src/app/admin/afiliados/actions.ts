"use server";

import {
  affiliateUpsertSchema,
  manualShowroomCommissionSchema,
  markAffiliatePayoutSchema,
  cancelAffiliateCommissionForAdmin,
  markAffiliateCommissionsPaidForAdmin,
  registerManualShowroomCommissionForAdmin,
  upsertAffiliateCodeForAdmin,
} from "@culebra/auth";
import { requireAdmin } from "@/lib/admin";
import { revalidatePath } from "next/cache";

export type AffiliateAdminState = {
  error?: string;
  success?: string;
};

export async function createAffiliateProgramAction(
  _prev: AffiliateAdminState,
  formData: FormData,
): Promise<AffiliateAdminState> {
  await requireAdmin("/admin/afiliados");

  const parsed = affiliateUpsertSchema.safeParse({
    code: formData.get("code"),
    label: formData.get("label"),
    affiliateType: formData.get("affiliateType") || "LODGING",
    commissionPct: formData.get("commissionPct") || 10,
    accommodationId: formData.get("accommodationId") || "",
    vendorId: formData.get("vendorId") || "",
    contactEmail: formData.get("contactEmail") || "",
    contactPhone: formData.get("contactPhone") || "",
    cookieDays: formData.get("cookieDays") || 30,
    payoutMinimum: formData.get("payoutMinimum") || 30,
    programStatus: formData.get("programStatus") || "ACTIVE",
    isActive: formData.get("isActive") === "on",
    notes: formData.get("notes") || undefined,
  });

  if (!parsed.success) {
    return { error: "Revisa los datos del afiliado (código, comisión máx. 10 %)." };
  }

  try {
    await upsertAffiliateCodeForAdmin(parsed.data);
    revalidatePath("/admin/afiliados");
    revalidatePath("/admin/turismo");
    return { success: `Afiliado ${parsed.data.code} guardado.` };
  } catch {
    return { error: "No se pudo guardar el afiliado (¿código duplicado?)." };
  }
}

export async function registerShowroomCommissionAction(
  _prev: AffiliateAdminState,
  formData: FormData,
): Promise<AffiliateAdminState> {
  await requireAdmin("/admin/afiliados");

  const parsed = manualShowroomCommissionSchema.safeParse({
    affiliateId: formData.get("affiliateId"),
    baseAmount: formData.get("baseAmount"),
    commissionPct: formData.get("commissionPct") || undefined,
    notes: formData.get("notes") || undefined,
  });

  if (!parsed.success) {
    return { error: "Indica afiliado e importe base de la venta showroom." };
  }

  try {
    await registerManualShowroomCommissionForAdmin(parsed.data);
    revalidatePath("/admin/afiliados");
    return { success: "Comisión showroom registrada." };
  } catch {
    return { error: "No se pudo registrar la comisión." };
  }
}

export async function markPayoutAction(formData: FormData) {
  await requireAdmin("/admin/afiliados");

  const commissionIds = String(formData.get("commissionIds") ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  const parsed = markAffiliatePayoutSchema.safeParse({
    affiliateId: formData.get("affiliateId"),
    commissionIds,
    payoutNote: formData.get("payoutNote") || undefined,
  });

  if (!parsed.success) return;

  await markAffiliateCommissionsPaidForAdmin(parsed.data);
  revalidatePath("/admin/afiliados");
}

export async function cancelCommissionAction(formData: FormData) {
  await requireAdmin("/admin/afiliados");
  const id = String(formData.get("commissionId") ?? "");
  if (!id) return;
  await cancelAffiliateCommissionForAdmin(id);
  revalidatePath("/admin/afiliados");
}
