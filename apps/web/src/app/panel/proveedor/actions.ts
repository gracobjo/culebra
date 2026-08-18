"use server";

import {
  getVendorByUserId,
  submitVendorForReview,
  updateVendorProfile,
  vendorUpdateSchema,
} from "@culebra/auth";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export type VendorPanelState = {
  error?: string;
  success?: string;
};

export async function updateVendorAction(
  _prevState: VendorPanelState,
  formData: FormData,
): Promise<VendorPanelState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Debes iniciar sesion." };
  }

  const parsed = vendorUpdateSchema.safeParse({
    tradeName: formData.get("tradeName") || undefined,
    legalName: formData.get("legalName") || undefined,
    taxId: formData.get("taxId") || undefined,
    description: formData.get("description") || undefined,
    history: formData.get("history") || undefined,
    street: formData.get("street") || undefined,
    city: formData.get("city") || undefined,
    province: formData.get("province") || undefined,
    postalCode: formData.get("postalCode") || undefined,
    phone: formData.get("phone") || undefined,
    email: formData.get("email") || undefined,
    website: formData.get("website") || undefined,
    logoUrl: formData.get("logoUrl") || undefined,
  });

  if (!parsed.success) {
    return { error: "Revisa los datos del perfil." };
  }

  try {
    await updateVendorProfile(session.user.id, parsed.data);
    revalidatePath("/panel/proveedor");
    return { success: "Perfil actualizado." };
  } catch (error) {
    if (error instanceof Error && error.message === "VENDOR_NOT_EDITABLE") {
      return { error: "El perfil ya no puede editarse en este estado." };
    }
    return { error: "No se pudo actualizar el perfil." };
  }
}

export async function submitVendorAction(): Promise<VendorPanelState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Debes iniciar sesion." };
  }

  try {
    await submitVendorForReview(session.user.id);
    revalidatePath("/panel/proveedor");
    return { success: "Solicitud enviada para revision." };
  } catch (error) {
    if (error instanceof Error && error.message === "VENDOR_PROFILE_INCOMPLETE") {
      return {
        error: "Completa al menos nombre comercial, municipio y provincia.",
      };
    }
    return { error: "No se pudo enviar la solicitud." };
  }
}

export async function submitVendorFormAction() {
  await submitVendorAction();
  revalidatePath("/panel/proveedor");
}

export async function getVendorForPanel() {
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }
  return getVendorByUserId(session.user.id);
}
