"use server";

import {
  updateVendorOrderStatus,
  vendorOrderStatusSchema,
} from "@culebra/auth";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type VendorOrderActionState = {
  error?: string;
  success?: string;
};

export async function updateVendorOrderStatusAction(
  vendorOrderId: string,
  _prev: VendorOrderActionState,
  formData: FormData,
): Promise<VendorOrderActionState> {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/panel/proveedor/pedidos");
  }

  const parsed = vendorOrderStatusSchema.safeParse({
    status: formData.get("status"),
    carrier: formData.get("carrier") || undefined,
    trackingNumber: formData.get("trackingNumber") || undefined,
  });
  if (!parsed.success) {
    return { error: "No se pudo actualizar el pedido." };
  }

  try {
    await updateVendorOrderStatus(session.user.id, vendorOrderId, parsed.data);
    revalidatePath("/panel/proveedor/pedidos");
    revalidatePath(`/panel/proveedor/pedidos/${vendorOrderId}`);
    return { success: "Pedido actualizado." };
  } catch (error) {
    if (error instanceof Error && error.message === "VENDOR_ORDER_INVALID_STATUS") {
      return { error: "Ese cambio de estado no esta permitido." };
    }
    return { error: "No se pudo actualizar el pedido." };
  }
}
