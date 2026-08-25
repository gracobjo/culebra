import { exportAffiliateCommissionsCsvForAdmin } from "@culebra/auth";
import { requireAdmin } from "@/lib/admin";

export async function GET(request: Request) {
  await requireAdmin("/admin/afiliados");

  const url = new URL(request.url);
  const affiliateId = url.searchParams.get("affiliateId") ?? undefined;
  const from = url.searchParams.get("from") ?? undefined;
  const to = url.searchParams.get("to") ?? undefined;

  try {
    const csv = await exportAffiliateCommissionsCsvForAdmin({ affiliateId, from, to });
    const stamp = new Date().toISOString().slice(0, 10);
    const filename = `culebra_afiliados_comisiones_${stamp}.csv`;

    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return new Response("No se pudo exportar.", { status: 500 });
  }
}
