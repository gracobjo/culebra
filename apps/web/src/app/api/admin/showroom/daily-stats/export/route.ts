import { exportShowroomDailyStatsCsvForAdmin } from "@culebra/auth";
import { requireAdmin } from "@/lib/admin";

export async function GET(request: Request) {
  await requireAdmin("/admin/showroom/estadisticas");

  const url = new URL(request.url);
  const from = url.searchParams.get("from") ?? undefined;
  const to = url.searchParams.get("to") ?? undefined;

  try {
    const csv = await exportShowroomDailyStatsCsvForAdmin({ from, to });
    const stamp = new Date().toISOString().slice(0, 10);
    const filename = `culebra_showroom_daily_${stamp}.csv`;

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
