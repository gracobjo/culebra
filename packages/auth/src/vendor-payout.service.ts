import { PayoutStatus, VendorPayoutMethod } from "@culebra/domain";
import { prisma } from "@culebra/db";
import { z } from "zod";

import { getVendorByUserId, type VendorRecord } from "./vendor.service.js";
import { getStripe, isStripeConfigured } from "./stripe.js";
import { createPayPalPayout, isPayPalConfigured } from "./paypal.js";

export type VendorStripeStatus = {
  stripeConfigured: boolean;
  connected: boolean;
  chargesEnabled: boolean;
  accountId: string | null;
};

export type VendorPayoutStatus = {
  method: VendorPayoutMethod;
  payoutsReady: boolean;
  stripe: VendorStripeStatus;
  paypalEmail: string | null;
  paypalConfigured: boolean;
};

type PayoutVendor = {
  stripeAccountId: string | null;
  stripeChargesEnabled: boolean;
  payoutMethod: VendorPayoutMethod;
  paypalEmail: string | null;
};

export function isVendorPayoutReady(vendor: PayoutVendor): boolean {
  if (vendor.payoutMethod === VendorPayoutMethod.PAYPAL) {
    return isPayPalConfigured() && Boolean(vendor.paypalEmail);
  }
  return Boolean(vendor.stripeAccountId && vendor.stripeChargesEnabled);
}

export async function getVendorPayoutStatus(userId: string): Promise<VendorPayoutStatus> {
  const vendor = await getVendorByUserId(userId);
  if (!vendor) {
    throw new Error("VENDOR_NOT_FOUND");
  }

  const stripe = await fetchVendorStripeStatus(vendor);
  const method = vendor.payoutMethod ?? VendorPayoutMethod.STRIPE_CONNECT;

  return {
    method,
    payoutsReady: isVendorPayoutReady({
      stripeAccountId: vendor.stripeAccountId,
      stripeChargesEnabled: vendor.stripeChargesEnabled,
      payoutMethod: method,
      paypalEmail: vendor.paypalEmail,
    }),
    stripe,
    paypalEmail: vendor.paypalEmail,
    paypalConfigured: isPayPalConfigured(),
  };
}

async function fetchVendorStripeStatus(vendor: VendorRecord): Promise<VendorStripeStatus> {
  if (isStripeConfigured() && vendor.stripeAccountId) {
    try {
      const account = await getStripe().accounts.retrieve(vendor.stripeAccountId);
      const chargesEnabled = Boolean(account.charges_enabled && account.payouts_enabled);
      if (chargesEnabled !== vendor.stripeChargesEnabled) {
        await prisma.vendor.update({
          where: { id: vendor.id },
          data: { stripeChargesEnabled: chargesEnabled },
        });
      }
      return {
        stripeConfigured: true,
        connected: true,
        chargesEnabled,
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

const payoutMethodSchema = z.enum([
  VendorPayoutMethod.STRIPE_CONNECT,
  VendorPayoutMethod.PAYPAL,
]);

export async function updateVendorPayoutMethod(
  userId: string,
  method: VendorPayoutMethod,
): Promise<{ method: VendorPayoutMethod }> {
  const parsed = payoutMethodSchema.parse(method);
  const vendor = await getVendorByUserId(userId);
  if (!vendor) {
    throw new Error("VENDOR_NOT_FOUND");
  }

  if (parsed === VendorPayoutMethod.STRIPE_CONNECT && !isStripeConfigured()) {
    throw new Error("STRIPE_NOT_CONFIGURED");
  }
  if (parsed === VendorPayoutMethod.PAYPAL && !isPayPalConfigured()) {
    throw new Error("PAYPAL_NOT_CONFIGURED");
  }

  await prisma.vendor.update({
    where: { id: vendor.id },
    data: { payoutMethod: parsed },
  });

  return { method: parsed };
}

const paypalEmailSchema = z.string().trim().email().max(254);

export async function setVendorPayPalEmail(
  userId: string,
  email: string,
): Promise<{ paypalEmail: string }> {
  if (!isPayPalConfigured()) {
    throw new Error("PAYPAL_NOT_CONFIGURED");
  }

  const parsed = paypalEmailSchema.parse(email);
  const vendor = await getVendorByUserId(userId);
  if (!vendor) {
    throw new Error("VENDOR_NOT_FOUND");
  }

  await prisma.vendor.update({
    where: { id: vendor.id },
    data: {
      paypalEmail: parsed,
      payoutMethod: VendorPayoutMethod.PAYPAL,
    },
  });

  return { paypalEmail: parsed };
}

async function transferStripePayout(
  payoutId: string,
  vendorOrder: {
    id: string;
    vendorNetAmount: unknown;
    vendor: PayoutVendor;
  },
  orderNumber: string,
): Promise<"paid" | "failed" | "skipped"> {
  if (!vendorOrder.vendor.stripeAccountId || !vendorOrder.vendor.stripeChargesEnabled) {
    return "skipped";
  }

  const amount = Math.round(Number(vendorOrder.vendorNetAmount) * 100);
  if (!Number.isFinite(amount) || amount <= 0) {
    return "skipped";
  }

  try {
    const transfer = await getStripe().transfers.create({
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
      where: { id: payoutId },
      data: {
        status: PayoutStatus.PAID,
        stripeTransferId: transfer.id,
      },
    });
    return "paid";
  } catch {
    await prisma.payout.update({
      where: { id: payoutId },
      data: { status: PayoutStatus.FAILED },
    });
    return "failed";
  }
}

async function transferPayPalPayout(
  payoutId: string,
  vendorOrder: {
    id: string;
    vendorNetAmount: unknown;
    vendor: PayoutVendor;
  },
  orderNumber: string,
): Promise<"paid" | "failed" | "skipped"> {
  if (!vendorOrder.vendor.paypalEmail) {
    return "skipped";
  }

  const amountEur = Number(vendorOrder.vendorNetAmount);
  if (!Number.isFinite(amountEur) || amountEur <= 0) {
    return "skipped";
  }

  try {
    const payout = await createPayPalPayout({
      recipientEmail: vendorOrder.vendor.paypalEmail,
      amountEur,
      payoutId,
      orderNumber,
    });
    await prisma.payout.update({
      where: { id: payoutId },
      data: {
        status: PayoutStatus.PAID,
        paypalPayoutBatchId: payout.batchId,
      },
    });
    return "paid";
  } catch {
    await prisma.payout.update({
      where: { id: payoutId },
      data: { status: PayoutStatus.FAILED },
    });
    return "failed";
  }
}

export async function executeVendorPayout(
  payoutId: string,
  vendorOrder: {
    id: string;
    vendorNetAmount: unknown;
    vendor: PayoutVendor;
  },
  orderNumber: string,
): Promise<"paid" | "failed" | "skipped"> {
  if (vendorOrder.vendor.payoutMethod === VendorPayoutMethod.PAYPAL) {
    if (!isPayPalConfigured()) {
      return "skipped";
    }
    return transferPayPalPayout(payoutId, vendorOrder, orderNumber);
  }

  if (!isStripeConfigured()) {
    return "skipped";
  }
  return transferStripePayout(payoutId, vendorOrder, orderNumber);
}

export function mapVendorToPayoutVendor(vendor: VendorRecord): PayoutVendor {
  return {
    stripeAccountId: vendor.stripeAccountId,
    stripeChargesEnabled: vendor.stripeChargesEnabled,
    payoutMethod: vendor.payoutMethod ?? VendorPayoutMethod.STRIPE_CONNECT,
    paypalEmail: vendor.paypalEmail,
  };
}

export { isPayPalConfigured };
