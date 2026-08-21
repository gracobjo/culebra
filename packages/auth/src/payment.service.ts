import { OrderStatus, PaymentStatus, PayoutStatus, VendorPayoutMethod } from "@culebra/domain";
import { prisma } from "@culebra/db";
import type Stripe from "stripe";

import { getOrderByNumber } from "./order.service.js";
import { getVendorByUserId } from "./vendor.service.js";
import {
  appBaseUrl,
  createConnectRecipientAccount,
  eurosToCents,
  getStripe,
  isStripeConfigured,
} from "./stripe.js";
import {
  executeVendorPayout,
  isPayPalConfigured,
  isVendorPayoutReady,
  mapVendorToPayoutVendor,
} from "./vendor-payout.service.js";
import { initVendorOrderSla } from "./sla.service.js";
import { notifyPaymentConfirmed } from "./notifications.service.js";

export { isStripeConfigured };

type OrderAccess = { userId?: string; guestAccess?: boolean; email?: string };

type PaymentMetadata = {
  checkoutSessionId?: string;
  paymentMethod?: string;
};

function paymentMethodFromStripeType(type: string | undefined): string | undefined {
  if (!type) return undefined;
  if (type === "card") return "Tarjeta";
  if (type === "bizum") return "Bizum";
  return type;
}

async function resolveStripePaymentMethodLabel(paymentIntentId: string): Promise<string | undefined> {
  if (!isStripeConfigured()) {
    return undefined;
  }
  try {
    const stripe = getStripe();
    const intent = await stripe.paymentIntents.retrieve(paymentIntentId, {
      expand: ["payment_method"],
    });
    const paymentMethod = intent.payment_method;
    if (typeof paymentMethod === "object" && paymentMethod && "type" in paymentMethod) {
      return paymentMethodFromStripeType(paymentMethod.type);
    }
  } catch {
    return undefined;
  }
  return undefined;
}

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

  // payment_method_types: habilitamos tarjeta, Bizum y wallets (Apple/Google Pay).
  // Bizum requiere activación explícita en el Dashboard de Stripe > Payment Methods.
  // Apple/Google Pay se activan automáticamente si el dominio está verificado en Stripe.
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: order.customerEmail,
    success_url: `${appBaseUrl()}/pedido/${order.orderNumber}?pago=ok`,
    cancel_url: `${appBaseUrl()}/pedido/${order.orderNumber}?pago=cancelado`,
    locale: "es",
    payment_method_types: [
      "card",
      // Bizum: activa en Stripe Dashboard > Payment methods > Bizum
      // Disponible solo para merchants en España con currency EUR
      "bizum",
    ],
    payment_method_options: {
      card: {
        // Solicitar código postal para reducir fraude
        request_three_d_secure: "automatic",
      },
    },
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "eur",
          unit_amount: eurosToCents(order.totalAmount),
          product_data: {
            name: `Pedido ${order.orderNumber}`,
            description: "Sierra de la Culebra Marketplace · Productos artesanales de Zamora",
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

async function transferPayout(
  payoutId: string,
  vendorOrder: {
    id: string;
    vendorNetAmount: unknown;
    vendor: {
      stripeAccountId: string | null;
      stripeChargesEnabled: boolean;
      payoutMethod?: VendorPayoutMethod;
      paypalEmail?: string | null;
    };
  },
  orderNumber: string,
): Promise<"paid" | "failed" | "skipped"> {
  return executeVendorPayout(
    payoutId,
    {
      id: vendorOrder.id,
      vendorNetAmount: vendorOrder.vendorNetAmount,
      vendor: {
        stripeAccountId: vendorOrder.vendor.stripeAccountId,
        stripeChargesEnabled: vendorOrder.vendor.stripeChargesEnabled,
        payoutMethod: vendorOrder.vendor.payoutMethod ?? VendorPayoutMethod.STRIPE_CONNECT,
        paypalEmail: vendorOrder.vendor.paypalEmail ?? null,
      },
    },
    orderNumber,
  );
}

// Días de retención legal por derecho de desistimiento (Ley 3/2014, art. 102)
const WITHDRAWAL_RETENTION_DAYS = 14;

function payoutReleasesAt(from: Date = new Date()): Date {
  const d = new Date(from);
  d.setDate(d.getDate() + WITHDRAWAL_RETENTION_DAYS);
  return d;
}

export function isPayoutReleased(payout: { releasesAt: Date | null; heldForWithdrawal: boolean }): boolean {
  if (!payout.heldForWithdrawal) return true;
  if (!payout.releasesAt) return false;
  return new Date() >= payout.releasesAt;
}

async function createVendorTransfers(orderId: string, paymentId: string, orderNumber: string) {
  const paidAt = new Date();
  const releasesAt = payoutReleasesAt(paidAt);

  const vendorOrders = await prisma.vendorOrder.findMany({
    where: { orderId },
    include: { vendor: true, payout: true },
  });

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

    // El payout se crea en estado PENDING y retenido 14 días.
    // El transfer real a Stripe se ejecuta cuando expira la retención (cron/webhook).
    await prisma.payout.create({
      data: {
        vendorId: vendorOrder.vendorId,
        vendorOrderId: vendorOrder.id,
        paymentId,
        status: PayoutStatus.PENDING,
        amountGross: vendorOrder.subtotalGross,
        commissionMarketplace: vendorOrder.marketplaceCommission,
        otherFees: vendorOrder.otherFees,
        amountNetToVendor: vendorOrder.vendorNetAmount,
        releasesAt,
        heldForWithdrawal: true,
      },
    });
    // Inicializar el SLA del VendorOrder: registra notifiedAt y calcula el deadline.
    // Operación best-effort para no bloquear el flujo de pago.
    initVendorOrderSla(vendorOrder.id).catch(() => { /* SLA init is non-critical */ });
    // No llamamos a transferPayout aquí: el transfer ocurre cuando expira la retención.
  }
}

/**
 * Procesa los payouts cuya retención de 14 días ha expirado y aún no se han
 * transferido. Llamar desde un cron job diario o desde el webhook de Stripe.
 */
export async function releaseMaturedPayouts(): Promise<{ released: number; failed: number }> {
  if (!isStripeConfigured() && !isPayPalConfigured()) {
    return { released: 0, failed: 0 };
  }

  const matured = await prisma.payout.findMany({
    where: {
      heldForWithdrawal: true,
      releasesAt: { lte: new Date() },
      stripeTransferId: null,
      paypalPayoutBatchId: null,
      status: { in: [PayoutStatus.PENDING, PayoutStatus.FAILED] },
    },
    include: {
      vendor: true,
      vendorOrder: { include: { order: true } },
    },
  });

  let released = 0;
  let failed = 0;

  for (const payout of matured as Array<{
    id: string;
    amountNetToVendor: unknown;
    vendor: {
      stripeAccountId: string | null;
      stripeChargesEnabled: boolean;
      payoutMethod: VendorPayoutMethod;
      paypalEmail: string | null;
    };
    vendorOrder: { id: string; order: { orderNumber: string } };
  }>) {
    await prisma.payout.update({
      where: { id: payout.id },
      data: { heldForWithdrawal: false, status: PayoutStatus.PROCESSING },
    });
    const result = await transferPayout(
      payout.id,
      {
        id: payout.vendorOrder.id,
        vendorNetAmount: payout.amountNetToVendor,
        vendor: payout.vendor,
      },
      payout.vendorOrder.order.orderNumber,
    );
    if (result === "paid") released++;
    else if (result === "failed") failed++;
    else {
      // skipped: vendor no listo, deja en PENDING para reintento
      await prisma.payout.update({ where: { id: payout.id }, data: { status: PayoutStatus.PENDING } });
    }
  }

  return { released, failed };
}

export async function retryPendingPayoutsForVendor(userId: string): Promise<{ retried: number }> {
  if (!isStripeConfigured() && !isPayPalConfigured()) {
    throw new Error("PAYOUTS_NOT_CONFIGURED");
  }

  const vendor = await getVendorByUserId(userId);
  if (!vendor) {
    throw new Error("VENDOR_NOT_FOUND");
  }
  if (!isVendorPayoutReady(mapVendorToPayoutVendor(vendor))) {
    throw new Error("VENDOR_PAYOUT_NOT_READY");
  }

  const pending = await prisma.payout.findMany({
    where: {
      vendorId: vendor.id,
      status: { in: [PayoutStatus.PENDING, PayoutStatus.FAILED] },
      stripeTransferId: null,
      paypalPayoutBatchId: null,
    },
    include: {
      vendor: true,
      vendorOrder: { include: { order: true } },
    },
  });

  for (const payout of pending as Array<{
    id: string;
    amountNetToVendor: unknown;
    vendor: {
      stripeAccountId: string | null;
      stripeChargesEnabled: boolean;
      payoutMethod: VendorPayoutMethod;
      paypalEmail: string | null;
    };
    vendorOrder: { id: string; order: { orderNumber: string } };
  }>) {
    await prisma.payout.update({
      where: { id: payout.id },
      data: { status: PayoutStatus.PROCESSING },
    });
    const result = await transferPayout(
      payout.id,
      {
        id: payout.vendorOrder.id,
        vendorNetAmount: payout.amountNetToVendor,
        vendor: payout.vendor,
      },
      payout.vendorOrder.order.orderNumber,
    );
    if (result === "skipped") {
      await prisma.payout.update({
        where: { id: payout.id },
        data: { status: PayoutStatus.PENDING },
      });
    }
  }

  return { retried: pending.length };
}

export async function markOrderPaid(params: {
  orderNumber?: string;
  paymentIntentId?: string;
  chargeId?: string;
}) {
  let payment = params.paymentIntentId
    ? await prisma.payment.findFirst({
        where: { stripePaymentIntentId: params.paymentIntentId },
        include: { order: true },
      })
    : null;

  // Si el PI aún no está guardado (sandbox / race del webhook), localizar por pedido.
  if (!payment && params.orderNumber) {
    payment = await prisma.payment.findFirst({
      where: { order: { orderNumber: params.orderNumber } },
      include: { order: true },
    });
  }

  if (!payment) {
    return null;
  }
  if (payment.status === PaymentStatus.PAYMENT_PAID) {
    return payment;
  }

  const existingMetadata = asMetadata(payment.metadata);
  const paymentMethod =
    existingMetadata.paymentMethod ??
    (params.paymentIntentId
      ? await resolveStripePaymentMethodLabel(params.paymentIntentId)
      : undefined);

  await prisma.payment.update({
    where: { id: payment.id },
    data: {
      status: PaymentStatus.PAYMENT_PAID,
      stripePaymentIntentId: params.paymentIntentId ?? payment.stripePaymentIntentId,
      stripeChargeId: params.chargeId ?? payment.stripeChargeId,
      metadata: {
        ...existingMetadata,
        ...(paymentMethod ? { paymentMethod } : {}),
      },
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

  // Notificación Telegram de pago confirmado (best-effort)
  notifyPaymentConfirmed({
    orderNumber: payment.order.orderNumber,
    customerEmail: payment.order.customerEmail,
    amount: String(payment.order.totalAmount),
  });

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
  const chargesEnabled = Boolean(account.charges_enabled && account.payouts_enabled);
  await prisma.vendor.update({
    where: { id: vendor.id },
    data: { stripeChargesEnabled: chargesEnabled },
  });
  if (chargesEnabled && isStripeConfigured()) {
    try {
      await retryPendingPayoutsForVendor(vendor.userId);
    } catch {
      // Retry is best-effort after Connect onboarding.
    }
  }
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
    const email = vendor.email ?? user?.email;
    if (!email) {
      throw new Error("VENDOR_EMAIL_REQUIRED");
    }
    const entityType =
      vendor.taxId && /^[ABCDEFGHJKLMNPQRSUVW]/i.test(vendor.taxId) ? "company" : "individual";
    const account = await createConnectRecipientAccount({
      email,
      displayName: vendor.tradeName,
      vendorId: vendor.id,
      entityType,
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
