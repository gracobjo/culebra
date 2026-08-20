"use server";

import {
  accommodationUpsertSchema,
  affiliateUpsertSchema,
  couponUpsertSchema,
  tourismPackUpsertSchema,
  upsertAccommodationForAdmin,
  upsertAffiliateCodeForAdmin,
  upsertCouponForAdmin,
  upsertTourismPackForAdmin,
  updateAccommodationStatusForAdmin,
} from "@culebra/auth";
import { AccommodationStatus } from "@culebra/domain";
import { requireAdmin } from "@/lib/admin";
import { revalidatePath } from "next/cache";

export type TourismAdminState = {
  error?: string;
  success?: string;
};

export async function createAccommodationAction(
  _prev: TourismAdminState,
  formData: FormData,
): Promise<TourismAdminState> {
  await requireAdmin("/admin/turismo");
  const productIds = String(formData.get("productIds") ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  const parsed = accommodationUpsertSchema.safeParse({
    name: formData.get("name"),
    shortDescription: formData.get("shortDescription") || undefined,
    kind: formData.get("kind") || "CASA_RURAL",
    city: formData.get("city") || undefined,
    municipality: formData.get("municipality") || undefined,
    province: formData.get("province") || "Zamora",
    bookingUrl: formData.get("bookingUrl") || undefined,
    websiteUrl: formData.get("websiteUrl") || undefined,
    whatsapp: formData.get("whatsapp") || undefined,
    phone: formData.get("phone") || undefined,
    bookingChannel: formData.get("bookingChannel") || "WEBSITE",
    status: formData.get("status") || "DRAFT",
    sortOrder: formData.get("sortOrder") || 0,
    productIds,
  });

  if (!parsed.success) {
    return { error: "Revisa los datos del alojamiento." };
  }

  try {
    await upsertAccommodationForAdmin(parsed.data);
    revalidatePath("/admin/turismo");
    revalidatePath("/alojamientos");
    return { success: "Alojamiento creado." };
  } catch {
    return { error: "No se pudo crear el alojamiento." };
  }
}

export async function publishAccommodationAction(formData: FormData) {
  await requireAdmin("/admin/turismo");
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "") as keyof typeof AccommodationStatus;
  if (!id || !AccommodationStatus[status]) return;
  await updateAccommodationStatusForAdmin(id, AccommodationStatus[status]);
  revalidatePath("/admin/turismo");
  revalidatePath("/alojamientos");
}

export async function createCouponAction(
  _prev: TourismAdminState,
  formData: FormData,
): Promise<TourismAdminState> {
  await requireAdmin("/admin/turismo");
  const parsed = couponUpsertSchema.safeParse({
    code: formData.get("code"),
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    discountType: formData.get("discountType"),
    discountValue: formData.get("discountValue"),
    minOrderAmount: formData.get("minOrderAmount") || undefined,
    maxRedemptions: formData.get("maxRedemptions") || undefined,
    isActive: formData.get("isActive") === "on",
  });
  if (!parsed.success) {
    return { error: "Revisa el cupon (codigo, tipo y valor)." };
  }
  try {
    await upsertCouponForAdmin(parsed.data);
    revalidatePath("/admin/turismo");
    return { success: "Cupon creado." };
  } catch {
    return { error: "No se pudo crear el cupon (codigo duplicado?)." };
  }
}

export async function createPackAction(
  _prev: TourismAdminState,
  formData: FormData,
): Promise<TourismAdminState> {
  await requireAdmin("/admin/turismo");
  const productId = String(formData.get("productId") ?? "").trim();
  const quantity = Number(formData.get("quantity") ?? 1);
  const parsed = tourismPackUpsertSchema.safeParse({
    name: formData.get("name"),
    shortDescription: formData.get("shortDescription") || undefined,
    accommodationId: formData.get("accommodationId") || undefined,
    nightsHint: formData.get("nightsHint") || undefined,
    status: formData.get("status") || "DRAFT",
    sortOrder: formData.get("sortOrder") || 0,
    couponId: formData.get("couponId") || undefined,
    items: productId ? [{ productId, quantity: quantity || 1 }] : [],
  });
  if (!parsed.success) {
    return { error: "Revisa el pack (nombre + al menos un producto)." };
  }
  try {
    await upsertTourismPackForAdmin(parsed.data);
    revalidatePath("/admin/turismo");
    revalidatePath("/packs");
    return { success: "Pack creado." };
  } catch {
    return { error: "No se pudo crear el pack." };
  }
}

export async function createAffiliateAction(
  _prev: TourismAdminState,
  formData: FormData,
): Promise<TourismAdminState> {
  await requireAdmin("/admin/turismo");
  const parsed = affiliateUpsertSchema.safeParse({
    code: formData.get("code"),
    label: formData.get("label"),
    accommodationId: formData.get("accommodationId") || undefined,
    notes: formData.get("notes") || undefined,
    isActive: formData.get("isActive") === "on",
  });
  if (!parsed.success) {
    return { error: "Revisa el codigo de afiliado." };
  }
  try {
    await upsertAffiliateCodeForAdmin(parsed.data);
    revalidatePath("/admin/turismo");
    return { success: "Codigo de afiliado creado." };
  } catch {
    return { error: "No se pudo crear el afiliado (codigo duplicado?)." };
  }
}
