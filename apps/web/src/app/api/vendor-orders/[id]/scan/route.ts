import { type NextRequest, NextResponse } from "next/server";
import { recordVendorOrderReceived } from "@culebra/auth";
import { auth } from "@/auth";
import { getActiveUserById } from "@culebra/auth";

/**
 * POST /api/vendor-orders/[id]/scan
 *
 * Registra la recepción física de un paquete en la trastienda de Villardeciervos
 * mediante el escaneo del código de barras de la etiqueta de envío exterior.
 *
 * Uso desde la app del Socio Comercial (o desde un lector de código de barras USB):
 *   fetch(`/api/vendor-orders/${vendorOrderId}/scan`, { method: "POST" })
 *
 * Requiere rol ADMIN o VENDOR (del mismo vendor).
 *
 * Respuesta:
 *   { ok: true, slaStatus: "FULFILLED" | "BREACHED", onTime: boolean, minutesLate: number }
 */
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const user = await getActiveUserById(session.user.id);
  if (!user) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const isAdmin = user.roles.includes("ADMIN");
  const isVendor = user.roles.includes("VENDOR");

  if (!isAdmin && !isVendor) {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }

  const { id: vendorOrderId } = await params;

  try {
    const result = await recordVendorOrderReceived(vendorOrderId);
    return NextResponse.json({
      ok: true,
      slaStatus: result.status,
      onTime: result.onTime,
      minutesLate: result.minutesLate,
      scannedAt: new Date().toISOString(),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "UNKNOWN_ERROR";
    if (message === "VENDOR_ORDER_NOT_FOUND") {
      return NextResponse.json({ error: message }, { status: 404 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
