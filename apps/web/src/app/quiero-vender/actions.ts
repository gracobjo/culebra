"use server";

import { applyAsVendor, vendorApplySchema } from "@culebra/auth";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export type VendorApplyState = {
  error?: string;
};

export async function applyVendorAction(
  _prevState: VendorApplyState,
  formData: FormData,
): Promise<VendorApplyState> {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/quiero-vender");
  }

  const parsed = vendorApplySchema.safeParse({
    tradeName: formData.get("tradeName"),
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
  });

  if (!parsed.success) {
    return { error: "Revisa los datos del formulario de alta." };
  }

  try {
    await applyAsVendor(session.user.id, parsed.data);
  } catch (error) {
    if (error instanceof Error && error.message === "VENDOR_ALREADY_EXISTS") {
      redirect("/panel/proveedor");
    }
    return { error: "No se pudo crear la solicitud de productor." };
  }

  redirect("/panel/proveedor");
}
