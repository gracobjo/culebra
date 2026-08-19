import { type NextRequest, NextResponse } from "next/server";
import { releaseMaturedPayouts } from "@culebra/auth";

/**
 * GET /api/cron/release-payouts
 *
 * Libera los payouts cuya retención de 14 días (derecho de desistimiento)
 * ha expirado y transfiere el importe al artesano via Stripe Connect.
 *
 * Invocar diariamente desde un cron externo (Vercel Cron, AWS EventBridge,
 * GitHub Actions schedule, etc.) con la cabecera:
 *   Authorization: Bearer <CRON_SECRET>
 *
 * En desarrollo puede invocarse manualmente desde /api/cron/release-payouts.
 */
export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    const result = await releaseMaturedPayouts();
    return NextResponse.json({
      ok: true,
      released: result.released,
      failed: result.failed,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "UNKNOWN_ERROR";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
