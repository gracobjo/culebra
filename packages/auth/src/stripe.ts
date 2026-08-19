import Stripe from "stripe";

let stripeClient: Stripe | null = null;

function normalizeEnvSecret(value: string | undefined): string {
  const trimmed = value?.trim() ?? "";
  if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
    return trimmed.slice(1, -1).trim();
  }
  return trimmed;
}

export function isStripeConfigured(): boolean {
  const key = normalizeEnvSecret(process.env.STRIPE_SECRET_KEY);
  return key.startsWith("sk_");
}

export function getStripe(): Stripe {
  if (!isStripeConfigured()) {
    throw new Error("STRIPE_NOT_CONFIGURED");
  }
  if (!stripeClient) {
    stripeClient = new Stripe(normalizeEnvSecret(process.env.STRIPE_SECRET_KEY)!);
  }
  return stripeClient;
}

export function appBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.AUTH_URL ??
    "http://localhost:3000"
  ).replace(/\/$/, "");
}

/** Stripe rechaza localhost en business_profile.url al crear cuentas Connect. */
export function vendorPublicProfileUrl(vendorSlug: string): string | undefined {
  try {
    const { hostname } = new URL(appBaseUrl());
    if (hostname === "localhost" || hostname === "127.0.0.1") {
      return undefined;
    }
    return `${appBaseUrl()}/productores/${vendorSlug}`;
  } catch {
    return undefined;
  }
}

export function eurosToCents(value: unknown): number {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("INVALID_PAYMENT_AMOUNT");
  }
  return Math.round(amount * 100);
}
