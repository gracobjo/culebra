import Link from "next/link";
import {
  getShowroomDailyStatsEnrichedForAdmin,
  getShowroomFootfallOriginSummaryForAdmin,
  listShowroomDailyStatsForAdmin,
  listShowroomFootfallEntriesForAdmin,
  summarizeShowroomDailyStats,
} from "@culebra/auth";
import { requireAdmin } from "@/lib/admin";
import { AdminShell } from "@/components/admin/admin-shell";
import { ShowroomDailyStatEda } from "@/components/admin/showroom-daily-stat-eda";
import { ShowroomFootfallInsights } from "@/components/admin/showroom-footfall-insights";
import {
  ShowroomFootfallQuickCapture,
  ShowroomFootfallRecentList,
} from "@/components/admin/showroom-footfall-panel";
import { ShowroomStatsKpiReport } from "@/components/admin/showroom-stats-kpi-report";
import {
  ShowroomDailyStatDeleteForm,
  ShowroomDailyStatDemoPanel,
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

  const footfallFrom = sp.from ?? defaultFrom;
  const footfallTo = sp.to ?? defaultTo;
  const footfallPeriodLabel =
    sp.from && sp.to ? `${sp.from} a ${sp.to}` : `últimos 90 días (${footfallFrom} a ${footfallTo})`;

  const [footfallEntries, footfallSummary] = await Promise.all([
    listShowroomFootfallEntriesForAdmin({
      from: footfallFrom,
      to: footfallTo,
      limit: 50,
    }),
    getShowroomFootfallOriginSummaryForAdmin({
      from: footfallFrom,
      to: footfallTo,
    }),
  ]);

  const periodLabel =
    sp.from && sp.to
      ? `${sp.from} a ${sp.to}`
      : dates.length > 0
        ? `${dates[0]} a ${dates.at(-1)} (${records.length} días)`
        : "Sin filtro (vacío)";

  return (
    <AdminShell title="Showroom — estadísticas y EDA">
      <p className="max-w-3xl text-sm text-stone-600">
        Base de datos operativa para ML: captura diaria/quincenal, **procedencia de visitantes**,
        sincronización parcial desde pedidos y CRM, export CSV y EDA. Guía:{" "}
        <code className="rounded bg-stone-100 px-1 text-xs">
          docs/Showroom_Procedencia_Visitantes.md
        </code>
        {" · "}
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
        <ShowroomFootfallQuickCapture />

        <ShowroomFootfallInsights
          summary={footfallSummary}
          periodLabel={footfallPeriodLabel}
          exportFrom={footfallFrom}
          exportTo={footfallTo}
        />

        <section className="rounded-2xl border border-stone-200 bg-white p-5">
          <h3 className="font-semibold text-stone-900">Registros recientes de procedencia</h3>
          <p className="mt-1 text-sm text-stone-500">
            Hoja digital equivalente al formulario de 3 campos. Ritual quincenal: revisar KPIs de
            arriba y exportar CSV.
          </p>
          <div className="mt-4">
            <ShowroomFootfallRecentList entries={footfallEntries} />
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-2">
          <ShowroomDailyStatForm />
          <div className="space-y-6">
            <ShowroomDailyStatDemoPanel hasData={records.length > 0} />
            <ShowroomDailyStatSyncPanel defaultFrom={defaultFrom} defaultTo={defaultTo} />
            <ShowroomDailyStatDeleteForm dates={dates} />
          </div>
        </div>

        <ShowroomDailyStatEda rows={enriched} summary={summary} />
      </div>

      <div className="mt-8">
        <ShowroomStatsKpiReport summary={summary} periodLabel={periodLabel} />
      </div>
    </AdminShell>
  );
}
