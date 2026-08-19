function normalizeEnvSecret(value: string | undefined): string {
  const trimmed = value?.trim() ?? "";
  if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
    return trimmed.slice(1, -1).trim();
  }
  return trimmed;
}

export function isPayPalConfigured(): boolean {
  const clientId = normalizeEnvSecret(process.env.PAYPAL_CLIENT_ID);
  const clientSecret = normalizeEnvSecret(process.env.PAYPAL_CLIENT_SECRET);
  return (
    clientId.length > 0 &&
    clientSecret.length > 0 &&
    !clientId.includes("REEMPLAZAR") &&
    !clientSecret.includes("REEMPLAZAR")
  );
}

function paypalApiBase(): string {
  return process.env.PAYPAL_MODE === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";
}

let cachedToken: { value: string; expiresAt: number } | null = null;

async function getPayPalAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) {
    return cachedToken.value;
  }

  const clientId = normalizeEnvSecret(process.env.PAYPAL_CLIENT_ID);
  const clientSecret = normalizeEnvSecret(process.env.PAYPAL_CLIENT_SECRET);
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const response = await fetch(`${paypalApiBase()}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  const data = (await response.json()) as {
    access_token?: string;
    expires_in?: number;
    error?: string;
  };

  if (!response.ok || !data.access_token) {
    throw new Error(data.error ?? "PAYPAL_AUTH_FAILED");
  }

  cachedToken = {
    value: data.access_token,
    expiresAt: Date.now() + (data.expires_in ?? 3600) * 1000,
  };
  return data.access_token;
}

export async function createPayPalPayout(params: {
  recipientEmail: string;
  amountEur: number;
  payoutId: string;
  orderNumber: string;
}): Promise<{ batchId: string }> {
  if (!isPayPalConfigured()) {
    throw new Error("PAYPAL_NOT_CONFIGURED");
  }

  const amount = params.amountEur.toFixed(2);
  const token = await getPayPalAccessToken();

  const response = await fetch(`${paypalApiBase()}/v1/payments/payouts`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      sender_batch_header: {
        sender_batch_id: `payout_${params.payoutId}`,
        email_subject: "Liquidacion Sabores de la Culebra",
        email_message: `Has recibido una liquidacion del pedido ${params.orderNumber}.`,
      },
      items: [
        {
          recipient_type: "EMAIL",
          amount: { value: amount, currency: "EUR" },
          receiver: params.recipientEmail,
          sender_item_id: params.payoutId,
          note: `Pedido ${params.orderNumber}`,
        },
      ],
    }),
  });

  const data = (await response.json()) as {
    batch_header?: { payout_batch_id?: string };
    name?: string;
    message?: string;
    details?: Array<{ issue?: string }>;
  };

  const batchId = data.batch_header?.payout_batch_id;
  if (!response.ok || !batchId) {
    const detail = data.details?.[0]?.issue ?? data.message ?? data.name ?? "PAYPAL_PAYOUT_FAILED";
    throw new Error(detail);
  }

  return { batchId };
}
