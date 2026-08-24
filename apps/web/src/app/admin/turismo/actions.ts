"use server";

import {
  accommodationUpsertSchema,
  affiliateUpsertSchema,
  couponUpsertSchema,
  lodgingOfferContactsSchema,
  lodgingRelationEventSchema,
  lodgingRelationUpsertSchema,
  tourismPackUpsertSchema,
  addLodgingRelationEventForAdmin,
  upsertAccommodationForAdmin,
  upsertAffiliateCodeForAdmin,
  upsertCouponForAdmin,
  upsertLodgingOfferContacts,
  upsertLodgingRelationForAdmin,
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

function parseModalities(formData: FormData) {
  return formData
    .getAll("modalities")
    .map((v) => String(v))
    .filter(Boolean);
}

export async function createLodgingRelationAction(
  _prev: TourismAdminState,
  formData: FormData,
): Promise<TourismAdminState> {
  await requireAdmin("/admin/turismo");
  const parsed = lodgingRelationUpsertSchema.safeParse({
    name: formData.get("name"),
    contactPerson: formData.get("contactPerson") || undefined,
    phone: formData.get("phone") || undefined,
    whatsapp: formData.get("whatsapp") || undefined,
    email: formData.get("email") || undefined,
    city: formData.get("city") || undefined,
    distanceMinutes: formData.get("distanceMinutes") || undefined,
    accommodationId: formData.get("accommodationId") || undefined,
    status: formData.get("status") || "PROSPECT",
    collabLevel: formData.get("collabLevel") || 1,
    modalities: parseModalities(formData),
    notes: formData.get("notes") || undefined,
    materialPlaced: formData.get("materialPlaced") === "on",
    referralThreshold: formData.get("referralThreshold") || 8,
  });
  if (!parsed.success) {
    return { error: "Revisa los datos de la relación (nombre obligatorio)." };
  }
  try {
    await upsertLodgingRelationForAdmin(parsed.data);
    revalidatePath("/admin/turismo");
    return { success: "Relación creada." };
  } catch {
    return { error: "No se pudo crear la relación (¿alojamiento ya vinculado?)." };
  }
}

export async function updateLodgingRelationAction(
  _prev: TourismAdminState,
  formData: FormData,
): Promise<TourismAdminState> {
  await requireAdmin("/admin/turismo");
  const id = String(formData.get("id") ?? "");
  const parsed = lodgingRelationUpsertSchema.safeParse({
    id,
    name: formData.get("name"),
    contactPerson: formData.get("contactPerson") || undefined,
    phone: formData.get("phone") || undefined,
    whatsapp: formData.get("whatsapp") || undefined,
    email: formData.get("email") || undefined,
    city: formData.get("city") || undefined,
    distanceMinutes: formData.get("distanceMinutes") || undefined,
    accommodationId: formData.get("accommodationId") || undefined,
    status: formData.get("status") || "PROSPECT",
    collabLevel: formData.get("collabLevel") || 1,
    modalities: parseModalities(formData),
    welcomeMode: formData.get("welcomeMode") || undefined,
    welcomeSpecialPrice: formData.get("welcomeSpecialPrice") || undefined,
    referralThreshold: formData.get("referralThreshold") || 8,
    notes: formData.get("notes") || undefined,
    materialPlaced: formData.get("materialPlaced") === "on",
    agreementAccepted: formData.get("agreementAccepted") === "on",
    agreementNotes: formData.get("agreementNotes") || undefined,
  });
  if (!parsed.success || !id) {
    return { error: "Revisa los datos de la relación." };
  }
  try {
    await upsertLodgingRelationForAdmin(parsed.data);
    revalidatePath("/admin/turismo");
    revalidatePath(`/admin/turismo/relaciones/${id}`);
    return { success: "Relación actualizada." };
  } catch {
    return { error: "No se pudo actualizar la relación." };
  }
}

export async function addLodgingEventAction(
  _prev: TourismAdminState,
  formData: FormData,
): Promise<TourismAdminState> {
  await requireAdmin("/admin/turismo");
  const relationId = String(formData.get("relationId") ?? "");
  const parsed = lodgingRelationEventSchema.safeParse({
    relationId,
    type: formData.get("type"),
    quantity: formData.get("quantity") || 1,
    amount: formData.get("amount") || undefined,
    note: formData.get("note") || undefined,
  });
  if (!parsed.success || !relationId) {
    return { error: "Revisa el evento (tipo y cantidad)." };
  }
  try {
    await addLodgingRelationEventForAdmin(parsed.data);
    revalidatePath("/admin/turismo");
    revalidatePath(`/admin/turismo/relaciones/${relationId}`);
    return { success: "Evento registrado." };
  } catch {
    return { error: "No se pudo registrar el evento." };
  }
}

export async function saveLodgingOfferContactsAction(
  _prev: TourismAdminState,
  formData: FormData,
): Promise<TourismAdminState> {
  await requireAdmin("/admin/turismo");
  const parsed = lodgingOfferContactsSchema.safeParse({
    whatsapp: formData.get("whatsapp") || undefined,
    phone: formData.get("phone") || undefined,
    email: formData.get("email") || undefined,
    websiteUrl: formData.get("websiteUrl") || undefined,
    contactPerson: formData.get("contactPerson") || undefined,
    showroomAddress: formData.get("showroomAddress") || undefined,
  });
  if (!parsed.success) {
    return { error: "Revisa los datos de contacto." };
  }
  try {
    await upsertLodgingOfferContacts(parsed.data);
    revalidatePath("/admin/turismo");
    return { success: "Contacto de fichas guardado." };
  } catch {
    return { error: "No se pudo guardar el contacto." };
  }
}
