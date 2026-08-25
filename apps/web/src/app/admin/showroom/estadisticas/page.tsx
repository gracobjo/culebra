import Link from "next/link";
import {
  getShowroomDailyStatsEnrichedForAdmin,
  listShowroomDailyStatsForAdmin,
  summarizeShowroomDailyStats,
} from "@culebra/auth";
import { requireAdmin } from "@/lib/admin";
import { AdminShell } from "@/components/admin/admin-shell";
import { ShowroomDailyStatEda } from "@/components/admin/showroom-daily-stat-eda";
import {
  ShowroomDailyStatDeleteForm,
  ShowroomDailyStatExportLinks,
  ShowroomDailyStatForm,
  ShowroomDailyStatSyncPanel,
} from "@/components/admin/showroom-daily-stat-form";

export const metadata = { title: "Estadísticas showroom | Admin" };

type PageProps = {
  searchParams: Promise<{ from?: string; to?: string }>;
};

export default async function AdminShowroomStatsPage({ searchParams }: PageProps) {
  await requireAdmin("/admin/showroom/estadisticas");
  const sp = await searchParams;

  const records = await listShowroomDailyStatsForAdmin({
    from: sp.from,
    to: sp.to,
  });
  const enriched = await getShowroomDailyStatsEnrichedForAdmin({
    from: sp.from,
    to: sp.to,
  });
  const summary = summarizeShowroomDailyStats(enriched);

  const dates = records.map((r) => r.date);
  const defaultTo = dates.at(-1) ?? new Date().toISOString().slice(0, 10);
  const defaultFrom =
    dates.length > 0
      ? dates[Math.max(0, dates.length - 90)]
      : new Date(Date.now() - 90 * 86_400_000).toISOString().slice(0, 10);

  return (
    <AdminShell title="Showroom — estadísticas y EDA">
      <p className="max-w-3xl text-sm text-stone-600">
        Base de datos operativa para ML: captura diaria/quincenal, sincronización parcial desde
        pedidos y CRM, export CSV (43 columnas) y análisis exploratorio como en los notebooks.
        Mapa:{" "}
        <code className="rounded bg-stone-100 px-1 text-xs">
          docs/Variables_Decision_Datasets_Kaggle.md
        </code>
        {" · "}
        <Link href="/admin/showroom" className="text-emerald-800 underline">
          Volver al showroom
        </Link>
        {" · "}
        <Link href="/admin/turismo" className="text-emerald-800 underline">
          CRM alojamientos
        </Link>
        .
      </p>

      <div className="mt-6">
        <ShowroomDailyStatExportLinks from={sp.from} to={sp.to} />
      </div>

      <div className="mt-8 space-y-8">
        <div className="grid gap-6 lg:grid-cols-2">
          <ShowroomDailyStatForm />
          <div className="space-y-6">
            <ShowroomDailyStatSyncPanel defaultFrom={defaultFrom} defaultTo={defaultTo} />
            <ShowroomDailyStatDeleteForm dates={dates} />
          </div>
        </div>

        <ShowroomDailyStatEda rows={enriched} summary={summary} />
      </div>
    </AdminShell>
  );
}
