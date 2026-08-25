"use client";

import type { ShowroomDailyStatsSummary } from "@culebra/auth";
import {
  SHOWROOM_CHART_REPORT,
  SHOWROOM_KPI_REPORT,
  SHOWROOM_STATS_GLOSSARY,
  buildShowroomStatsTextReport,
} from "@/lib/showroom-stats-a11y";

export function ShowroomStatsKpiReport({
  summary,
  periodLabel,
}: {
  summary: ShowroomDailyStatsSummary;
  periodLabel: string;
}) {
  function downloadReport() {
    const text = buildShowroomStatsTextReport(summary, periodLabel);
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `informe-showroom-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section
      className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm"
      aria-labelledby="showroom-kpi-report-heading"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="showroom-kpi-report-heading" className="text-lg font-semibold text-stone-900">
            Informe de resultados y KPI
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-stone-600">
            Qué significa cada indicador, cómo se calcula y el valor actual del periodo (
            {periodLabel}). Pasa el ratón sobre las etiquetas con cursor de ayuda para ver la
            definición breve.
          </p>
        </div>
        <button
          type="button"
          onClick={downloadReport}
          className="a11y-hint rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-800 hover:border-emerald-800"
          data-hint="Descarga un informe en texto plano con KPI, gráficos y glosario."
          title="Descarga informe TXT"
          aria-label="Descargar informe de KPI en texto plano"
        >
          Descargar informe (.txt)
        </button>
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <caption className="sr-only">
            Tabla de KPI del showroom con valor actual, definición y fórmula
          </caption>
          <thead>
            <tr className="border-b border-stone-200 text-xs uppercase text-stone-500">
              <th scope="col" className="py-2 pr-3">
                KPI
              </th>
              <th scope="col" className="py-2 pr-3">
                Valor actual
              </th>
              <th scope="col" className="py-2 pr-3">
                Qué muestra
              </th>
              <th scope="col" className="py-2">
                Cálculo / meta
              </th>
            </tr>
          </thead>
          <tbody>
            {SHOWROOM_KPI_REPORT.map((kpi) => (
              <tr key={kpi.id} className="border-b border-stone-100 align-top">
                <th scope="row" className="py-3 pr-3 font-medium text-stone-800">
                  <span
                    className="a11y-hint inline cursor-help"
                    data-hint={kpi.hint}
                    title={kpi.hint}
                  >
                    {kpi.title}
                  </span>
                </th>
                <td className="py-3 pr-3 tabular-nums font-semibold text-emerald-900">
                  {kpi.valueFromSummary(summary)}
                </td>
                <td className="py-3 pr-3 text-stone-600">{kpi.definition}</td>
                <td className="py-3 text-stone-600">
                  {kpi.formula}
                  {kpi.meta ? (
                    <>
                      <br />
                      <span className="text-xs text-stone-500">Meta: {kpi.meta}</span>
                    </>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3 className="mt-8 text-base font-semibold text-stone-900">Gráficos del EDA</h3>
      <ul className="mt-3 space-y-3">
        {SHOWROOM_CHART_REPORT.map((chart) => (
          <li
            key={chart.id}
            className="rounded-lg border border-stone-100 bg-stone-50 px-3 py-2 text-sm"
          >
            <p className="font-medium text-stone-800">{chart.title}</p>
            <p className="mt-1 text-stone-600">{chart.shows}</p>
            <p className="mt-1 text-xs text-stone-500">{chart.axes}</p>
          </li>
        ))}
      </ul>

      <h3 className="mt-8 text-base font-semibold text-stone-900" id="showroom-glossary-heading">
        Glosario
      </h3>
      <dl
        className="mt-3 grid gap-3 sm:grid-cols-2"
        aria-labelledby="showroom-glossary-heading"
      >
        {SHOWROOM_STATS_GLOSSARY.map(({ term, definition }) => (
          <div key={term} className="rounded-lg border border-stone-100 px-3 py-2">
            <dt className="font-medium text-stone-800">{term}</dt>
            <dd className="mt-1 text-sm text-stone-600">{definition}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
