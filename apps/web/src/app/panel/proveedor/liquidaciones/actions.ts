"use server";

import { retryPendingPayoutsForVendor } from "@culebra/auth";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export type RetryPayoutsState = {
  error?: string;
  success?: string;
};

export async function retryPayoutsAction(
  _prevState: RetryPayoutsState,
): Promise<RetryPayoutsState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Debes iniciar sesion." };
  }

  try {
    const result = await retryPendingPayoutsForVendor(session.user.id);
    revalidatePath("/panel/proveedor/liquidaciones");
    if (result.retried === 0) {
      return { success: "No hay liquidaciones pendientes de reintento." };
    }
    return { success: `Reintentadas ${result.retried} liquidaciones.` };
  } catch (error) {
    if (!(error instanceof Error)) {
      return { error: "No se pudieron reintentar las liquidaciones." };
    }
    const messages: Record<string, string> = {
      STRIPE_NOT_CONFIGURED: "Stripe no esta configurado en la plataforma.",
      VENDOR_STRIPE_NOT_READY: "Completa el alta de Stripe para recibir transferencias.",
      VENDOR_NOT_FOUND: "Perfil de productor no encontrado.",
    };
    return {
      error: messages[error.message] ?? "No se pudieron reintentar las liquidaciones.",
    };
  }
}
