import Link from "next/link";
import type { ShowroomFootfallOriginSummary } from "@culebra/auth";

export function ShowroomFootfallInsights({
  summary,
  periodLabel,
  exportFrom,
  exportTo,
}: {
  summary: ShowroomFootfallOriginSummary;
  periodLabel: string;
  exportFrom?: string;
  exportTo?: string;
}) {
  const qs = new URLSearchParams();
  if (exportFrom) qs.set("from", exportFrom);
  if (exportTo) qs.set("to", exportTo);
  const exportHref = `/api/admin/showroom/footfall/export${qs.toString() ? `?${qs}` : ""}`;

  if (summary.total === 0) {
    return (
      <section className="rounded-2xl border border-dashed border-stone-300 bg-stone-50 p-6">
        <h3 className="font-semibold text-stone-800">KPIs de procedencia</h3>
        <p className="mt-2 text-sm text-stone-600">
          Aún no hay registros en {periodLabel}. Usa el formulario de arriba en cada visita o
          compra.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-stone-900">KPIs de procedencia</h3>
          <p className="mt-1 text-sm text-stone-600">
            {summary.total} registros · {periodLabel}. Revisar cada 15 días para campañas y
            horarios.
          </p>
        </div>
        <Link
          href={exportHref}
          className="a11y-hint rounded-full border border-stone-300 px-4 py-2 text-sm font-medium hover:border-emerald-800"
          data-hint="Descarga CSV para Excel o Google Sheets"
          title="Exportar CSV"
        >
          Exportar CSV
        </Link>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Locales", value: `${summary.localPct} %`, meta: `${summary.localCount} reg.` },
          { label: "De fuera", value: `${summary.outsidePct} %`, meta: "sin contar no indicado" },
          {
            label: "Vía alojamiento",
            value: `${summary.fromLodgingPct} %`,
            meta: `${summary.purchasesFromLodgingPct} % compras`,
          },
          {
            label: "Contacto captado",
            value: `${summary.contactCapturePct} %`,
            meta: `${summary.contactsCaptured} personas`,
          },
        ].map((kpi) => (
          <div key={kpi.label} className="rounded-xl border border-stone-100 bg-stone-50 p-3">
            <p className="text-xs text-stone-500">{kpi.label}</p>
            <p className="mt-1 text-xl font-semibold tabular-nums text-emerald-950">{kpi.value}</p>
            <p className="text-xs text-stone-500">{kpi.meta}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div>
          <h4 className="text-sm font-semibold text-stone-800">Por grupo de procedencia</h4>
          <ul className="mt-2 space-y-2">
            {summary.byOriginGroup.slice(0, 7).map((row) => (
              <li key={row.group} className="flex items-center justify-between text-sm">
                <span className="text-stone-700">{row.label}</span>
                <span className="tabular-nums font-medium text-stone-900">
                  {row.count} ({row.pct} %)
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-stone-800">Top localidades detalladas</h4>
          {summary.topLocalities.length > 0 ? (
            <ul className="mt-2 space-y-2">
              {summary.topLocalities.map((row) => (
                <li key={row.locality} className="flex justify-between text-sm">
                  <span>{row.locality}</span>
                  <span className="tabular-nums font-medium">{row.count}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-stone-500">
              Añade localidad opcional al registrar para más detalle.
            </p>
          )}
          {summary.contactsByOrigin.length > 0 ? (
            <>
              <h4 className="mt-4 text-sm font-semibold text-stone-800">Contactos por procedencia</h4>
              <ul className="mt-2 space-y-1 text-sm text-stone-600">
                {summary.contactsByOrigin.map((row) => (
                  <li key={row.group}>
                    {row.label}: {row.count}
                  </li>
                ))}
              </ul>
            </>
          ) : null}
        </div>
      </div>

      <p className="mt-4 text-xs text-stone-500">
        Visitas: {summary.visits} · Compras: {summary.purchases} · No indicado:{" "}
        {summary.unknownOriginPct} %
      </p>
    </section>
  );
}
