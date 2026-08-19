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

/** Versión de API requerida para Connect Accounts v2 (cuentas nuevas desde 2025). */
export const STRIPE_V2_API_VERSION = "2026-07-29.dahlia";

export type CreateConnectAccountParams = {
  email: string;
  displayName: string;
  vendorId: string;
  entityType?: "individual" | "company";
};

/** Crea cuenta Connect Express como recipient (transfers) vía Accounts v2. */
export async function createConnectRecipientAccount(
  params: CreateConnectAccountParams,
): Promise<{ id: string }> {
  const key = normalizeEnvSecret(process.env.STRIPE_SECRET_KEY);
  if (!key.startsWith("sk_")) {
    throw new Error("STRIPE_NOT_CONFIGURED");
  }

  const response = await fetch("https://api.stripe.com/v2/core/accounts", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      "Stripe-Version": STRIPE_V2_API_VERSION,
    },
    body: JSON.stringify({
      contact_email: params.email,
      display_name: params.displayName,
      dashboard: "express",
      identity: {
        country: "es",
        entity_type: params.entityType ?? "individual",
      },
      configuration: {
        recipient: {
          capabilities: {
            stripe_balance: {
              stripe_transfers: { requested: true },
            },
          },
        },
      },
      defaults: {
        responsibilities: {
          fees_collector: "application",
          losses_collector: "application",
        },
      },
      metadata: { vendorId: params.vendorId },
      include: ["identity", "configuration.recipient", "requirements"],
    }),
  });

  const data = (await response.json()) as { id?: string; error?: { message?: string } };
  if (!response.ok || !data.id) {
    throw new Error(data.error?.message ?? "STRIPE_ACCOUNT_CREATE_FAILED");
  }
  return { id: data.id };
}
