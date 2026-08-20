import { cookies } from "next/headers";
import { auth } from "@/auth";
import { createCartSessionId } from "@culebra/auth";

export const CART_COOKIE = "culebra_cart";
export const LAST_ORDER_COOKIE = "culebra_last_order";
export const AFFILIATE_COOKIE = "culebra_ref";

export async function getCartOwner(createIfMissing = false) {
  const session = await auth();
  const jar = await cookies();
  let sessionId = jar.get(CART_COOKIE)?.value;

  if (!session?.user?.id && !sessionId && createIfMissing) {
    sessionId = createCartSessionId();
    jar.set(CART_COOKIE, sessionId, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
  }

  return {
    userId: session?.user?.id,
    sessionId,
  };
}

export async function getAffiliateCode(): Promise<string | null> {
  const jar = await cookies();
  return jar.get(AFFILIATE_COOKIE)?.value ?? null;
}

export async function rememberGuestOrder(orderNumber: string) {
  const jar = await cookies();
  jar.set(LAST_ORDER_COOKIE, orderNumber, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function guestCanAccessOrder(orderNumber: string) {
  const jar = await cookies();
  return jar.get(LAST_ORDER_COOKIE)?.value === orderNumber;
}
