import { OrderStatus, PaymentStatus, PayoutStatus } from "@culebra/domain";
import { prisma } from "@culebra/db";
import type Stripe from "stripe";

import { getOrderByNumber } from "./order.service.js";
import { getVendorByUserId } from "./vendor.service.js";
import { appBaseUrl, eurosToCents, getStripe, isStripeConfigured } from "./stripe.js";

export { isStripeConfigured };

type OrderAccess = { userId?: string; guestAccess?: boolean; email?: string };

type PaymentMetadata = {
  checkoutSessionId?: string;
};

export type VendorStripeStatus = {
  stripeConfigured: boolean;
  connected: boolean;
  chargesEnabled: boolean;
  accountId: string | null;
};

function asMetadata(value: unknown): PaymentMetadata {
  if (!value || typeof value !== "object") {
    return {};
  }
  return value as PaymentMetadata;
}

async function findOrderForPayment(orderNumber: string, access: OrderAccess) {
  const order = await getOrderByNumber(orderNumber, access);
  if (!order) {
    throw new Error("ORDER_NOT_FOUND");
  }
  if (order.status === OrderStatus.CANCELLED || order.status === OrderStatus.REFUNDED) {
    throw new Error("ORDER_NOT_PAYABLE");
  }
  if (order.paymentStatus === PaymentStatus.PAYMENT_PAID) {
    throw new Error("ORDER_ALREADY_PAID");
  }
  return order;
}

export async function createOrderCheckoutSession(
  orderNumber: string,
  access: OrderAccess,
): Promise<{ url: string }> {
  if (!isStripeConfigured()) {
    throw new Error("STRIPE_NOT_CONFIGURED");
  }

  const order = await findOrderForPayment(orderNumber, access);
  const stripe = getStripe();
  const payment = await prisma.payment.findFirst({
    where: { orderId: order.id },
  });
  if (!payment) {
    throw new Error("PAYMENT_NOT_FOUND");
  }

  const metadata = asMetadata(payment.metadata);
  if (metadata.checkoutSessionId) {
    const existing = await stripe.checkout.sessions.retrieve(metadata.checkoutSessionId);
    if (existing.status === "open" && existing.url) {
      return { url: existing.url };
    }
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: order.customerEmail,
    success_url: `${appBaseUrl()}/pedido/${order.orderNumber}?pago=ok`,
    cancel_url: `${appBaseUrl()}/pedido/${order.orderNumber}?pago=cancelado`,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "eur",
          unit_amount: eurosToCents(order.totalAmount),
          product_data: {
            name: `Pedido ${order.orderNumber}`,
            description: "Sierra de la Culebra Marketplace",
          },
        },
      },
    ],
    payment_intent_data: {
      transfer_group: order.orderNumber,
      metadata: {
        orderId: order.id,
        orderNumber: order.orderNumber,
      },
    },
    metadata: {
      orderId: order.id,
      orderNumber: order.orderNumber,
    },
  });

  if (!session.url) {
    throw new Error("STRIPE_SESSION_FAILED");
  }

  await prisma.payment.update({
    where: { id: payment.id },
    data: {
      stripePaymentIntentId:
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : payment.stripePaymentIntentId,
      metadata: {
        ...metadata,
        checkoutSessionId: session.id,
      },
    },
  });

  return { url: session.url };
}

async function createVendorTransfers(orderId: string, paymentId: string, orderNumber: string) {
  const vendorOrders = await prisma.vendorOrder.findMany({
    where: { orderId },
    include: { vendor: true, payout: true },
  });
  const stripe = getStripe();

  for (const vendorOrder of vendorOrders as Array<{
    id: string;
    vendorId: string;
    subtotalGross: unknown;
    marketplaceCommission: unknown;
    otherFees: unknown;
    vendorNetAmount: unknown;
    payout: { id: string } | null;
    vendor: {
      stripeAccountId: string | null;
      stripeChargesEnabled: boolean;
    };
  }>) {
    if (vendorOrder.payout) {
      continue;
    }

    const payout = await prisma.payout.create({
      data: {
        vendorId: vendorOrder.vendorId,
        vendorOrderId: vendorOrder.id,
        paymentId,
        status: PayoutStatus.PENDING,
        amountGross: vendorOrder.subtotalGross,
        commissionMarketplace: vendorOrder.marketplaceCommission,
        otherFees: vendorOrder.otherFees,
        amountNetToVendor: vendorOrder.vendorNetAmount,
      },
    });

    if (!vendorOrder.vendor.stripeAccountId || !vendorOrder.vendor.stripeChargesEnabled) {
      continue;
    }

    const amount = Math.round(Number(vendorOrder.vendorNetAmount) * 100);
    if (!Number.isFinite(amount) || amount <= 0) {
      continue;
    }

    try {
      const transfer = await stripe.transfers.create({
        amount,
        currency: "eur",
        destination: vendorOrder.vendor.stripeAccountId,
        transfer_group: orderNumber,
        metadata: {
          vendorOrderId: vendorOrder.id,
          orderNumber,
        },
      });
      await prisma.payout.update({
        where: { id: payout.id },
        data: {
          status: PayoutStatus.PAID,
          stripeTransferId: transfer.id,
        },
      });
    } catch {
      await prisma.payout.update({
        where: { id: payout.id },
        data: { status: PayoutStatus.FAILED },
      });
    }
  }
}

export async function markOrderPaid(params: {
  orderNumber?: string;
  paymentIntentId?: string;
  chargeId?: string;
}) {
  const payment = params.paymentIntentId
    ? await prisma.payment.findFirst({
        where: { stripePaymentIntentId: params.paymentIntentId },
        include: { order: true },
      })
    : params.orderNumber
      ? await prisma.payment.findFirst({
          where: { order: { orderNumber: params.orderNumber } },
          include: { order: true },
        })
      : null;

  if (!payment) {
    return null;
  }
  if (payment.status === PaymentStatus.PAYMENT_PAID) {
    return payment;
  }

  await prisma.payment.update({
    where: { id: payment.id },
    data: {
      status: PaymentStatus.PAYMENT_PAID,
      stripePaymentIntentId: params.paymentIntentId ?? payment.stripePaymentIntentId,
      stripeChargeId: params.chargeId ?? payment.stripeChargeId,
    },
  });

  const shippingStatuses = [
    OrderStatus.PARTIALLY_SHIPPED,
    OrderStatus.SHIPPED,
    OrderStatus.DELIVERED,
  ];
  if (!shippingStatuses.includes(payment.order.status)) {
    await prisma.order.update({
      where: { id: payment.orderId },
      data: { status: OrderStatus.PAID },
    });
  }

  await createVendorTransfers(payment.orderId, payment.id, payment.order.orderNumber);
  return payment;
}

async function markOrderPaymentFailed(paymentIntentId: string) {
  const payment = await prisma.payment.findFirst({
    where: { stripePaymentIntentId: paymentIntentId },
  });
  if (!payment || payment.status === PaymentStatus.PAYMENT_PAID) {
    return;
  }
  await prisma.payment.update({
    where: { id: payment.id },
    data: { status: PaymentStatus.PAYMENT_FAILED },
  });
}

async function syncConnectedAccount(account: Stripe.Account) {
  const vendor = await prisma.vendor.findFirst({
    where: { stripeAccountId: account.id },
  });
  if (!vendor) {
    return;
  }
  await prisma.vendor.update({
    where: { id: vendor.id },
    data: {
      stripeChargesEnabled: Boolean(account.charges_enabled && account.payouts_enabled),
    },
  });
}

export async function handleStripeWebhook(rawBody: string, signature: string | null) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret || secret.includes("REEMPLAZAR") || !signature) {
    throw new Error("STRIPE_WEBHOOK_INVALID");
  }

  const stripe = getStripe();
  const event = stripe.webhooks.constructEvent(rawBody, signature, secret);

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderNumber = session.metadata?.orderNumber;
      const paymentIntentId =
        typeof session.payment_intent === "string" ? session.payment_intent : undefined;
      if (paymentIntentId && orderNumber) {
        await prisma.payment.updateMany({
          where: { order: { orderNumber } },
          data: { stripePaymentIntentId: paymentIntentId },
        });
      }
      await markOrderPaid({
        orderNumber,
        paymentIntentId,
      });
      break;
    }
    case "payment_intent.succeeded": {
      const intent = event.data.object as Stripe.PaymentIntent;
      const chargeId =
        typeof intent.latest_charge === "string" ? intent.latest_charge : undefined;
      await markOrderPaid({
        orderNumber: intent.metadata?.orderNumber,
        paymentIntentId: intent.id,
        chargeId,
      });
      break;
    }
    case "payment_intent.payment_failed": {
      const intent = event.data.object as Stripe.PaymentIntent;
      await markOrderPaymentFailed(intent.id);
      break;
    }
    case "account.updated": {
      await syncConnectedAccount(event.data.object as Stripe.Account);
      break;
    }
    default:
      break;
  }

  return { received: true, type: event.type };
}

export async function getVendorStripeStatus(userId: string): Promise<VendorStripeStatus> {
  const vendor = await getVendorByUserId(userId);
  if (!vendor) {
    throw new Error("VENDOR_NOT_FOUND");
  }

  if (isStripeConfigured() && vendor.stripeAccountId) {
    try {
      const account = await getStripe().accounts.retrieve(vendor.stripeAccountId);
      await syncConnectedAccount(account);
      return {
        stripeConfigured: true,
        connected: true,
        chargesEnabled: Boolean(account.charges_enabled && account.payouts_enabled),
        accountId: vendor.stripeAccountId,
      };
    } catch {
      // Keep local flags if Stripe is unreachable.
    }
  }

  return {
    stripeConfigured: isStripeConfigured(),
    connected: Boolean(vendor.stripeAccountId),
    chargesEnabled: vendor.stripeChargesEnabled,
    accountId: vendor.stripeAccountId,
  };
}

export async function createVendorStripeOnboardingLink(
  userId: string,
): Promise<{ url: string }> {
  const vendor = await getVendorByUserId(userId);
  if (!vendor) {
    throw new Error("VENDOR_NOT_FOUND");
  }

  const stripe = getStripe();
  let accountId = vendor.stripeAccountId;

  if (!accountId) {
    const user = await prisma.user.findFirst({
      where: { id: userId },
      select: { email: true },
    });
    const account = await stripe.accounts.create({
      type: "express",
      country: "ES",
      email: vendor.email ?? user?.email ?? undefined,
      capabilities: {
        transfers: { requested: true },
      },
      business_profile: {
        name: vendor.tradeName,
        url: `${appBaseUrl()}/productores/${vendor.slug}`,
      },
      metadata: { vendorId: vendor.id },
    });
    accountId = account.id;
    await prisma.vendor.update({
      where: { id: vendor.id },
      data: { stripeAccountId: accountId },
    });
  }

  const link = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${appBaseUrl()}/panel/proveedor/pagos?estado=refresh`,
    return_url: `${appBaseUrl()}/panel/proveedor/pagos?estado=ok`,
    type: "account_onboarding",
  });

  return { url: link.url };
}
