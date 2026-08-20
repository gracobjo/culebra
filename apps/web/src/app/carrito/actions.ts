"use server";

import {
  addCartItem,
  addCartItemSchema,
  applyCartCoupon,
  applyCartCouponSchema,
  checkoutCart,
  checkoutSchema,
  clearCartCoupon,
  createOrderCheckoutSession,
  FREE_SHIPPING_THRESHOLD_EUR,
  getOrCreateCart,
  isStripeConfigured,
  removeCartItem,
  updateCartItem,
} from "@culebra/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAffiliateCode, getCartOwner, rememberGuestOrder } from "@/lib/cart";

export type CartActionState = {
  error?: string;
  success?: string;
};

export async function addToCartAction(
  _prev: CartActionState,
  formData: FormData,
): Promise<CartActionState> {
  const parsed = addCartItemSchema.safeParse({
    productId: formData.get("productId"),
    variantId: formData.get("variantId") || undefined,
    quantity: formData.get("quantity") || 1,
  });
  if (!parsed.success) {
    return { error: "No se pudo anadir el producto." };
  }

  try {
    const owner = await getCartOwner(true);
    await addCartItem(owner, parsed.data);
    revalidatePath("/", "layout");
    revalidatePath("/carrito");
    return { success: "Producto anadido al carrito." };
  } catch (error) {
    if (error instanceof Error && error.message === "INSUFFICIENT_STOCK") {
      return { error: "No hay stock suficiente." };
    }
    if (error instanceof Error && error.message === "VARIANT_REQUIRED") {
      return { error: "Selecciona un formato." };
    }
    return { error: "No se pudo anadir al carrito." };
  }
}

export async function updateCartItemAction(formData: FormData) {
  const itemId = String(formData.get("itemId") ?? "");
  const quantity = Number(formData.get("quantity") ?? 0);
  const owner = await getCartOwner();
  if (!owner.userId && !owner.sessionId) {
    return;
  }
  await updateCartItem(owner, itemId, quantity);
  revalidatePath("/carrito");
  revalidatePath("/checkout");
}

export async function removeCartItemAction(formData: FormData) {
  const itemId = String(formData.get("itemId") ?? "");
  const owner = await getCartOwner();
  if (!owner.userId && !owner.sessionId) {
    return;
  }
  await removeCartItem(owner, itemId);
  revalidatePath("/carrito");
}

export async function applyCouponAction(
  _prev: CartActionState,
  formData: FormData,
): Promise<CartActionState> {
  const parsed = applyCartCouponSchema.safeParse({
    code: formData.get("code"),
  });
  if (!parsed.success) {
    return { error: "Introduce un codigo de cupon valido." };
  }
  try {
    const owner = await getCartOwner(true);
    await applyCartCoupon(owner, parsed.data);
    revalidatePath("/carrito");
    revalidatePath("/checkout");
    return { success: "Cupon aplicado." };
  } catch (error) {
    if (error instanceof Error && error.message === "COUPON_INVALID") {
      return { error: "Cupon no valido o caducado." };
    }
    if (error instanceof Error && error.message === "COUPON_MIN_ORDER") {
      return { error: "El pedido no alcanza el minimo del cupon." };
    }
    return { error: "No se pudo aplicar el cupon." };
  }
}

export async function clearCouponAction() {
  const owner = await getCartOwner();
  if (!owner.userId && !owner.sessionId) return;
  await clearCartCoupon(owner);
  revalidatePath("/carrito");
  revalidatePath("/checkout");
}

export async function checkoutAction(
  _prev: CartActionState,
  formData: FormData,
): Promise<CartActionState> {
  const billingSame = formData.get("billingSameAsShipping") === "on";
  const affiliateFromForm = String(formData.get("affiliateCode") ?? "").trim();
  const affiliateFromCookie = await getAffiliateCode();
  const parsed = checkoutSchema.safeParse({
    customerEmail: formData.get("customerEmail"),
    customerPhone: formData.get("customerPhone"),
    customerFirstName: formData.get("customerFirstName"),
    customerLastName: formData.get("customerLastName"),
    notes: formData.get("notes") || undefined,
    billingSameAsShipping: billingSame,
    couponCode: formData.get("couponCode") || undefined,
    affiliateCode: affiliateFromForm || affiliateFromCookie || undefined,
    shipping: {
      firstName: formData.get("shippingFirstName"),
      lastName: formData.get("shippingLastName"),
      street: formData.get("shippingStreet"),
      city: formData.get("shippingCity"),
      province: formData.get("shippingProvince"),
      postalCode: formData.get("shippingPostalCode"),
      country: "ES",
      phone: formData.get("customerPhone") || undefined,
      taxId: formData.get("shippingTaxId") || undefined,
      company: formData.get("shippingCompany") || undefined,
    },
    billing: billingSame
      ? undefined
      : {
          firstName: formData.get("billingFirstName"),
          lastName: formData.get("billingLastName"),
          street: formData.get("billingStreet"),
          city: formData.get("billingCity"),
          province: formData.get("billingProvince"),
          postalCode: formData.get("billingPostalCode"),
          country: "ES",
          taxId: formData.get("billingTaxId") || undefined,
          company: formData.get("billingCompany") || undefined,
        },
  });

  if (!parsed.success) {
    return { error: "Revisa los datos de envio y facturacion." };
  }

  try {
    const owner = await getCartOwner();
    const order = await checkoutCart(owner, parsed.data);
    await rememberGuestOrder(order.orderNumber);
    revalidatePath("/carrito");
    if (isStripeConfigured()) {
      try {
        const checkout = await createOrderCheckoutSession(order.orderNumber, {
          userId: owner.userId,
          guestAccess: true,
        });
        redirect(checkout.url);
      } catch (paymentError) {
        if (paymentError && typeof paymentError === "object" && "digest" in paymentError) {
          throw paymentError;
        }
      }
    }
    redirect(`/pedido/${order.orderNumber}`);
  } catch (error) {
    if (error && typeof error === "object" && "digest" in error) {
      throw error;
    }
    if (error instanceof Error && error.message === "CART_EMPTY") {
      return { error: "El carrito esta vacio." };
    }
    if (error instanceof Error && error.message === "INSUFFICIENT_STOCK") {
      return { error: "Algun producto ya no tiene stock suficiente." };
    }
    if (error instanceof Error && error.message === "COUPON_INVALID") {
      return { error: "El cupon ya no es valido." };
    }
    if (error instanceof Error && error.message === "COUPON_MIN_ORDER") {
      return { error: "El pedido no alcanza el minimo del cupon." };
    }
    return { error: "No se pudo completar el pedido." };
  }
}

export async function loadCart() {
  const owner = await getCartOwner();
  if (!owner.userId && !owner.sessionId) {
    return {
      id: null,
      sessionId: null,
      itemCount: 0,
      subtotal: "0.00",
      couponCode: null,
      discountAmount: "0.00",
      total: "0.00",
      shippingAmount: "0.00",
      shippingFree: false,
      amountToFreeShipping: FREE_SHIPPING_THRESHOLD_EUR.toFixed(2),
      freeShippingThreshold: FREE_SHIPPING_THRESHOLD_EUR.toFixed(2),
      grandTotal: "0.00",
      items: [],
    };
  }
  return getOrCreateCart(owner);
}
