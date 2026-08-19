"use server";

import {
  createProduct,
  disableProduct,
  getVendorProduct,
  productCommercialUpdateSchema,
  productCreateSchema,
  submitProductForReview,
  updateProduct,
  updateProductCommercialData,
} from "@culebra/auth";
import { auth } from "@/auth";
import { parseCommercialForm, parseProductForm } from "@/lib/product-form";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type ProductFormState = {
  error?: string;
  success?: string;
};

async function requireUserId() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/panel/proveedor/productos");
  }
  return session.user.id;
}

export async function createProductAction(
  _prev: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  const userId = await requireUserId();

  const parsed = productCreateSchema.safeParse(parseProductForm(formData));
  if (!parsed.success) {
    return { error: "Revisa los datos del producto. Precio y categoria son obligatorios." };
  }

  try {
    const product = await createProduct(userId, parsed.data);
    revalidatePath("/panel/proveedor/productos");
    redirect(`/panel/proveedor/productos/${product.id}`);
  } catch (error) {
    if (error && typeof error === "object" && "digest" in error) {
      throw error;
    }
    return { error: "No se pudo crear el producto." };
  }
}

export async function updateProductAction(
  productId: string,
  _prev: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  const userId = await requireUserId();
  const parsed = productCreateSchema.partial().safeParse(parseProductForm(formData));
  if (!parsed.success) {
    return { error: "Revisa los datos del producto." };
  }

  try {
    await updateProduct(userId, productId, parsed.data);
    revalidatePath("/panel/proveedor/productos");
    revalidatePath(`/panel/proveedor/productos/${productId}`);
    return { success: "Producto actualizado." };
  } catch (error) {
    if (error instanceof Error && error.message === "PRODUCT_NOT_EDITABLE") {
      return { error: "Este producto ya no se puede editar." };
    }
    return { error: "No se pudo actualizar el producto." };
  }
}

export async function updateCommercialAction(
  productId: string,
  _prev: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  const userId = await requireUserId();

  let product;
  try {
    product = await getVendorProduct(userId, productId);
  } catch {
    return { error: "Producto no encontrado." };
  }

  const parsed = productCommercialUpdateSchema.safeParse(
    parseCommercialForm(formData, product.variants),
  );
  if (!parsed.success) {
    return { error: "Revisa el PVP y el stock indicados." };
  }

  try {
    const updated = await updateProductCommercialData(userId, productId, parsed.data);
    revalidatePath("/panel/proveedor/productos");
    revalidatePath(`/panel/proveedor/productos/${productId}`);
    revalidatePath("/productos");
    revalidatePath(`/productos/${updated.slug}`);
    return { success: "PVP y stock actualizados." };
  } catch {
    return { error: "No se pudo actualizar el PVP o el stock." };
  }
}

/** @deprecated Use updateCommercialAction */
export const updateStockAction = updateCommercialAction;

export async function submitProductAction(productId: string): Promise<void> {
  const userId = await requireUserId();
  await submitProductForReview(userId, productId);
  revalidatePath("/panel/proveedor/productos");
  revalidatePath(`/panel/proveedor/productos/${productId}`);
}

export async function disableProductAction(productId: string): Promise<void> {
  const userId = await requireUserId();
  await disableProduct(userId, productId);
  revalidatePath("/panel/proveedor/productos");
  revalidatePath(`/panel/proveedor/productos/${productId}`);
}
