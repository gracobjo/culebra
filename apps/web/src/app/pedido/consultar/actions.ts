"use server";

import { guestOrderLookupSchema, lookupGuestOrder } from "@culebra/auth";
import { redirect } from "next/navigation";
import { rememberGuestOrder } from "@/lib/cart";

export type GuestOrderLookupState = {
  error?: string;
};

export async function lookupGuestOrderAction(
  _prev: GuestOrderLookupState,
  formData: FormData,
): Promise<GuestOrderLookupState> {
  const parsed = guestOrderLookupSchema.safeParse({
    orderNumber: formData.get("orderNumber"),
    email: formData.get("email"),
  });
  if (!parsed.success) {
    return { error: "Revisa el numero de pedido y el email." };
  }

  const order = await lookupGuestOrder(parsed.data.orderNumber, parsed.data.email);
  if (!order) {
    return { error: "No encontramos un pedido con esos datos." };
  }

  await rememberGuestOrder(order.orderNumber);
  redirect(`/pedido/${order.orderNumber}`);
}
