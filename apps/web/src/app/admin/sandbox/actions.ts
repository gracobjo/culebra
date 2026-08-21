"use server";

import { requireAdmin } from "@/lib/admin";
import { prisma } from "@culebra/db";
import {
  addCartItem,
  checkoutCart,
  markOrderPaid,
  updateVendorOrderStatus,
} from "@culebra/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function toStringOrEmpty(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value : "";
}

export async function createSandboxOrder(_formData: FormData) {
  await requireAdmin();

  // Consumidor de referencia para tests.
  const consumerEmail =
    toStringOrEmpty(_formData.get("consumerEmail")) || "laura.garcia@example.com";
  const consumer = await prisma.user.findUnique({
    where: { email: consumerEmail },
    select: { id: true, email: true, firstName: true, lastName: true },
  });

  if (!consumer) {
    redirect("/admin/sandbox?error=CONSUMER_NOT_FOUND");
  }

  // Elegimos un producto PUBLISHED con stock.
  // Preferimos productos SIN variantes; si no hay ninguno, usamos un producto con variante.
  let productId: string | null = null;
  let variantId: string | undefined = undefined;

  const productNoVariants = await prisma.product.findFirst({
    where: {
      status: "PUBLISHED",
      deletedAt: null,
      variants: { none: {} },
      vendor: { status: "ACTIVE", deletedAt: null },
      inventory: {
        some: {
          variantId: null,
          stock: { gt: 0 },
        },
      },
    },
    select: { id: true },
  });

  if (productNoVariants) {
    productId = productNoVariants.id;
  } else {
    const invWithVariant = await prisma.inventory.findFirst({
      where: {
        vendor: { status: "ACTIVE", deletedAt: null },
        product: { status: "PUBLISHED", deletedAt: null },
        variantId: { not: null },
        stock: { gt: 0 },
        variant: { isActive: true },
      },
      select: { productId: true, variantId: true },
    });

    if (!invWithVariant || !invWithVariant.productId || !invWithVariant.variantId) {
      redirect("/admin/sandbox?error=PRODUCT_NOT_FOUND_FOR_SANDBOX");
    }
    productId = invWithVariant.productId;
    variantId = invWithVariant.variantId;
  }

  await addCartItem(
    { userId: consumer.id },
    {
      productId,
      quantity: 1,
      ...(variantId ? { variantId } : {}),
    },
  );

  // Checkout desde el mismo flujo real del marketplace.
  const now = new Date();
  let orderNumber: string;
  try {
    const order = await checkoutCart(
      { userId: consumer.id },
      {
        customerEmail: consumer.email,
        customerPhone: "600000000",
        customerFirstName: consumer.firstName ?? "Laura",
        customerLastName: consumer.lastName ?? "Garcia",
        shipping: {
          firstName: consumer.firstName ?? "Laura",
          lastName: consumer.lastName ?? "Garcia",
          street: "Calle Piloto 1",
          city: "Madrid",
          province: "Madrid",
          postalCode: "28001",
          country: "ES",
          phone: "600000000",
        },
        billingSameAsShipping: true,
        notes: `SANDBOX (creado ${now.toLocaleDateString("es-ES")})`,
      },
    );
    orderNumber = order.orderNumber;
  } catch (err) {
    const code = err instanceof Error ? err.message : "CHECKOUT_FAILED";
    redirect(`/admin/sandbox?error=${encodeURIComponent(code)}`);
  }

  revalidatePath("/admin/sandbox");
  redirect(`/admin/sandbox?created=${encodeURIComponent(orderNumber)}`);
}

export async function simulatePaymentOk(formData: FormData) {
  await requireAdmin();
  const orderNumber = toStringOrEmpty(formData.get("orderNumber"));
  if (!orderNumber) {
    redirect("/admin/sandbox?error=ORDER_NUMBER_REQUIRED");
  }

  const paymentIntentId = `sandbox_pi_${Date.now()}`;

  // Asociar el PI sandbox al payment antes de marcar pagado (mismo patrón que el webhook).
  const updated = await prisma.payment.updateMany({
    where: { order: { orderNumber } },
    data: { stripePaymentIntentId: paymentIntentId },
  });
  if (updated.count === 0) {
    redirect(
      `/admin/sandbox?error=${encodeURIComponent(`PAYMENT_NOT_FOUND:${orderNumber}`)}`,
    );
  }

  const paid = await markOrderPaid({
    orderNumber,
    paymentIntentId,
  });

  if (!paid) {
    redirect(
      `/admin/sandbox?error=${encodeURIComponent(`MARK_PAID_FAILED:${orderNumber}`)}`,
    );
  }

  revalidatePath("/admin/sandbox");
  redirect(`/admin/sandbox?paid=${encodeURIComponent(orderNumber)}`);
}

export async function simulateConfirmAndShip(formData: FormData) {
  await requireAdmin();
  const orderNumber = toStringOrEmpty(formData.get("orderNumber"));
  if (!orderNumber) {
    redirect("/admin/sandbox?error=ORDER_NUMBER_REQUIRED");
  }

  const vendorOrders = await prisma.vendorOrder.findMany({
    where: { order: { orderNumber } },
    include: { vendor: { select: { userId: true } } },
  });

  if (vendorOrders.length === 0) {
    redirect(
      `/admin/sandbox?error=${encodeURIComponent(`VENDOR_ORDERS_NOT_FOUND:${orderNumber}`)}`,
    );
  }

  for (const vo of vendorOrders) {
    if (!vo.vendor.userId) continue;

    // Si está en PENDING, primero pasa a CONFIRMED (transición permitida).
    if (vo.status === "PENDING") {
      await updateVendorOrderStatus(vo.vendor.userId, vo.id, { status: "CONFIRMED" });
    }

    // Si ya está SHIPPED, no repetimos.
    if (vo.status !== "SHIPPED" && vo.status !== "DELIVERED") {
      await updateVendorOrderStatus(vo.vendor.userId, vo.id, {
        status: "SHIPPED",
        carrier: "SANDBOX",
        trackingNumber: `SANDBOX-${orderNumber}-${vo.id.slice(0, 6)}`,
      });
    }
  }

  revalidatePath("/admin/sandbox");
  redirect(`/admin/sandbox?shipped=${encodeURIComponent(orderNumber)}`);
}

export async function simulateFastForwardRetention(formData: FormData) {
  await requireAdmin();
  const orderNumber = toStringOrEmpty(formData.get("orderNumber"));
  if (!orderNumber) {
    redirect("/admin/sandbox?error=ORDER_NUMBER_REQUIRED");
  }

  // En producción el payout queda retenido 14 días (desistimiento).
  // Aquí adelantamos releasesAt a ayer para poder liberar ya en sandbox.
  const past = new Date(Date.now() - 1000 * 60 * 60 * 24);

  const result = await prisma.payout.updateMany({
    where: {
      heldForWithdrawal: true,
      vendorOrder: { order: { orderNumber } },
    },
    data: {
      releasesAt: past,
    },
  });

  if (result.count === 0) {
    redirect(
      `/admin/sandbox?error=${encodeURIComponent(`NO_HELD_PAYOUTS:${orderNumber}`)}`,
    );
  }

  revalidatePath("/admin/sandbox");
  redirect(`/admin/sandbox?retention=${encodeURIComponent(orderNumber)}`);
}

export async function simulateReleasePayouts(formData: FormData) {
  await requireAdmin();
  const orderNumber = toStringOrEmpty(formData.get("orderNumber"));
  if (!orderNumber) {
    redirect("/admin/sandbox?error=ORDER_NUMBER_REQUIRED");
  }

  // En sandbox no llamamos Stripe. Marcamos payouts como pagados.
  const result = await prisma.payout.updateMany({
    where: {
      vendorOrder: { order: { orderNumber } },
      heldForWithdrawal: true,
    },
    data: {
      heldForWithdrawal: false,
      status: "PAID",
      stripeTransferId: `SANDBOX_TRANSFER_${Date.now()}`,
    },
  });

  if (result.count === 0) {
    redirect(
      `/admin/sandbox?error=${encodeURIComponent(`NO_HELD_PAYOUTS:${orderNumber}`)}`,
    );
  }

  revalidatePath("/admin/sandbox");
  redirect(`/admin/sandbox?released=${encodeURIComponent(orderNumber)}`);
}

export async function simulateDeliver(formData: FormData) {
  await requireAdmin();
  const orderNumber = toStringOrEmpty(formData.get("orderNumber"));
  if (!orderNumber) {
    redirect("/admin/sandbox?error=ORDER_NUMBER_REQUIRED");
  }

  const vendorOrders = await prisma.vendorOrder.findMany({
    where: { order: { orderNumber } },
    include: { vendor: { select: { userId: true } } },
  });

  let delivered = 0;
  for (const vo of vendorOrders) {
    if (!vo.vendor.userId) continue;
    if (vo.status !== "SHIPPED") continue;

    await updateVendorOrderStatus(vo.vendor.userId, vo.id, { status: "DELIVERED" });
    delivered += 1;
  }

  if (delivered === 0) {
    redirect(
      `/admin/sandbox?error=${encodeURIComponent(`NOTHING_TO_DELIVER:${orderNumber}`)}`,
    );
  }

  revalidatePath("/admin/sandbox");
  redirect(`/admin/sandbox?delivered=${encodeURIComponent(orderNumber)}`);
}

