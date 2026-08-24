"use server";

import { addPackToCart } from "@culebra/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCartOwner } from "@/lib/cart";
import { auth } from "@/auth";

export type PackActionState = {
  error?: string;
  success?: string;
};

export async function addPackToCartAction(
  _prev: PackActionState,
  formData: FormData,
): Promise<PackActionState> {
  const slug = String(formData.get("packSlug") ?? "").trim();
  if (!slug) {
    return { error: "Pack no valido." };
  }

  const session = await auth();
  if (session?.user?.roles?.includes("ADMIN")) {
    return { error: "La cuenta de administración no compra. Gestiona pedidos en el panel." };
  }

  try {
    const owner = await getCartOwner(true);
    await addPackToCart(owner, slug);
    revalidatePath("/", "layout");
    revalidatePath("/carrito");
    redirect("/carrito");
  } catch (error) {
    if (error && typeof error === "object" && "digest" in error) {
      throw error;
    }
    if (error instanceof Error && error.message === "PACK_NOT_AVAILABLE") {
      return { error: "Este pack no esta disponible." };
    }
    if (error instanceof Error && error.message === "INSUFFICIENT_STOCK") {
      return { error: "No hay stock suficiente para algun producto del pack." };
    }
    if (error instanceof Error && error.message === "VARIANT_REQUIRED") {
      return { error: "Un producto del pack requiere elegir formato." };
    }
    return { error: "No se pudo anadir el pack al carrito." };
  }
}
