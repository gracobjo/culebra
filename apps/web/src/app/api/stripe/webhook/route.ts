import { handleStripeWebhook } from "@culebra/auth";

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  const rawBody = await request.text();

  try {
    const result = await handleStripeWebhook(rawBody, signature);
    return Response.json(result);
  } catch {
    return Response.json({ error: "STRIPE_WEBHOOK_INVALID" }, { status: 400 });
  }
}
