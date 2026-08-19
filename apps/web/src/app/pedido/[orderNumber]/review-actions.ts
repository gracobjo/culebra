"use server";

import { auth } from "@/auth";
import { prisma } from "@culebra/db";
import { z } from "zod";

const reviewSchema = z.object({
  orderNumber: z.string(),
  productId: z.string().cuid(),
  vendorId: z.string().cuid(),
  rating: z.coerce.number().int().min(1).max(5),
  title: z.string().max(100).optional(),
  comment: z.string().max(1000).optional(),
});

export type ReviewState = {
  ok: boolean;
  error?: string;
};

export async function submitReview(
  _prev: ReviewState,
  formData: FormData,
): Promise<ReviewState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, error: "Debes estar autenticado para dejar una valoracion." };
  }

  const parsed = reviewSchema.safeParse({
    orderNumber: formData.get("orderNumber"),
    productId: formData.get("productId"),
    vendorId: formData.get("vendorId"),
    rating: formData.get("rating"),
    title: formData.get("title"),
    comment: formData.get("comment"),
  });

  if (!parsed.success) {
    return { ok: false, error: "Datos no validos. Comprueba el formulario." };
  }

  const { orderNumber, productId, vendorId, rating, title, comment } = parsed.data;

  // Verificar que el pedido pertenece al usuario y está entregado o pagado
  const order = await prisma.order.findFirst({
    where: {
      orderNumber,
      userId: session.user.id,
      status: { in: ["PAID", "PARTIALLY_SHIPPED", "SHIPPED", "DELIVERED"] },
    },
    select: { id: true },
  });

  if (!order) {
    return {
      ok: false,
      error: "Solo puedes valorar productos de pedidos confirmados y pagados.",
    };
  }

  // Verificar que el producto forma parte del pedido
  const orderItem = await prisma.orderItem.findFirst({
    where: { orderId: order.id, productId },
  });

  if (!orderItem) {
    return {
      ok: false,
      error: "Este producto no pertenece al pedido indicado.",
    };
  }

  // Evitar duplicados
  const existing = await prisma.review.findFirst({
    where: { userId: session.user.id, productId, orderId: order.id },
  });

  if (existing) {
    return { ok: false, error: "Ya has valorado este producto en este pedido." };
  }

  await prisma.review.create({
    data: {
      userId: session.user.id,
      productId,
      vendorId,
      orderId: order.id,
      rating,
      title: title || null,
      comment: comment || null,
    },
  });

  return { ok: true };
}
