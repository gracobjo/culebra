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

function toStringOrEmpty(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value : "";
}

export async function createSandboxOrder(formData: FormData) {
  await requireAdmin();

  // Consumidor de referencia para tests.
  const consumerEmail = toStringOrEmpty(formData.get("consumerEmail")) || "laura.garcia@example.com";
  const consumer = await prisma.user.findUnique({
    where: { email: consumerEmail },
    select: { id: true, email: true, firstName: true, lastName: true },
  });

  if (!consumer) throw new Error("CONSUMER_NOT_FOUND");

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
      throw new Error("PRODUCT_NOT_FOUND_FOR_SANDBOX");
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
  await checkoutCart(
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

  revalidatePath("/admin/sandbox");
}

export async function simulatePaymentOk(formData: FormData) {
  await requireAdmin();
  const orderNumber = toStringOrEmpty(formData.get("orderNumber"));
  if (!orderNumber) return;

  // Simula que Stripe notifica pago correcto.
  await markOrderPaid({
    orderNumber,
    paymentIntentId: `sandbox_pi_${Date.now()}`,
  });

  revalidatePath("/admin/sandbox");
}

export async function simulateConfirmAndShip(formData: FormData) {
  await requireAdmin();
  const orderNumber = toStringOrEmpty(formData.get("orderNumber"));
  if (!orderNumber) return;

  const vendorOrders = await prisma.vendorOrder.findMany({
    where: { order: { orderNumber } },
    include: { vendor: { select: { userId: true } } },
  });

  if (vendorOrders.length === 0) return;

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
}

export async function simulateFastForwardRetention(formData: FormData) {
  await requireAdmin();
  const orderNumber = toStringOrEmpty(formData.get("orderNumber"));
  if (!orderNumber) return;

  // Forzamos releasesAt a estar vencido, pero mantenemos heldForWithdrawal=true.
  const past = new Date(Date.now() - 1000 * 60 * 60 * 24);

  await prisma.payout.updateMany({
    where: {
      heldForWithdrawal: true,
      vendorOrder: { order: { orderNumber } },
    },
    data: {
      releasesAt: past,
    },
  });

  revalidatePath("/admin/sandbox");
}

export async function simulateReleasePayouts(formData: FormData) {
  await requireAdmin();
  const orderNumber = toStringOrEmpty(formData.get("orderNumber"));
  if (!orderNumber) return;

  // En sandbox no llamamos Stripe. Marcamos payouts como pagados.
  await prisma.payout.updateMany({
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

  revalidatePath("/admin/sandbox");
}

export async function simulateDeliver(formData: FormData) {
  await requireAdmin();
  const orderNumber = toStringOrEmpty(formData.get("orderNumber"));
  if (!orderNumber) return;

  const vendorOrders = await prisma.vendorOrder.findMany({
    where: { order: { orderNumber } },
    include: { vendor: { select: { userId: true } } },
  });

  for (const vo of vendorOrders) {
    if (!vo.vendor.userId) continue;
    if (vo.status !== "SHIPPED") continue;

    await updateVendorOrderStatus(vo.vendor.userId, vo.id, { status: "DELIVERED" });
  }

  revalidatePath("/admin/sandbox");
}

