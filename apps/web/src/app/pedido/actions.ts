"use server";

import { createOrderCheckoutSession, isStripeConfigured } from "@culebra/auth";
import { auth } from "@/auth";
import { guestCanAccessOrder, rememberGuestOrder } from "@/lib/cart";
import { redirect } from "next/navigation";

export type PaymentActionState = {
  error?: string;
};

export async function startOrderPaymentAction(
  orderNumber: string,
  _prev: PaymentActionState,
  _formData: FormData,
): Promise<PaymentActionState> {
  if (!isStripeConfigured()) {
    return { error: "El pago online no esta configurado todavia." };
  }

  const session = await auth();
  const guestAccess = await guestCanAccessOrder(orderNumber);

  try {
    const checkout = await createOrderCheckoutSession(orderNumber, {
      userId: session?.user?.id,
      guestAccess,
    });
    await rememberGuestOrder(orderNumber);
    redirect(checkout.url);
  } catch (error) {
    if (error && typeof error === "object" && "digest" in error) {
      throw error;
    }
    if (error instanceof Error && error.message === "ORDER_ALREADY_PAID") {
      return { error: "Este pedido ya esta pagado." };
    }
    if (error instanceof Error && error.message === "ORDER_NOT_FOUND") {
      return { error: "No se encontro el pedido." };
    }
    return { error: "No se pudo iniciar el pago." };
  }
}
