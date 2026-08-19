import { type NextRequest, NextResponse } from "next/server";
import { checkSlaCompliance } from "@culebra/auth";

/**
 * GET /api/cron/check-sla
 *
 * Revisa el cumplimiento SLA de todos los VendorOrders pendientes:
 *  - Marca AT_RISK los pedidos con < 4h para el deadline sin recepción
 *  - Marca BREACHED los que superaron el deadline sin escaneo en tienda
 *  - Dispara las notificaciones preventivas al productor
 *
 * Invocar cada hora desde un cron externo (Vercel Cron, AWS EventBridge,
 * GitHub Actions schedule, etc.) con la cabecera:
 *   Authorization: Bearer <CRON_SECRET>
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
    const result = await checkSlaCompliance();
    return NextResponse.json({
      ok: true,
      atRisk: result.atRisk,
      breached: result.breached,
      alertsDispatched: result.alerts.length,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "UNKNOWN_ERROR";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
