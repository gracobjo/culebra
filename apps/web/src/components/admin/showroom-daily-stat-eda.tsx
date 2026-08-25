"use client";

import { useId, useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type {
  ShowroomDailyStatExportRow,
  ShowroomDailyStatsSummary,
} from "@culebra/auth";
import { formatPrice } from "@/lib/format";
import { SHOWROOM_CHART_REPORT, SHOWROOM_KPI_REPORT } from "@/lib/showroom-stats-a11y";

const SKU_KEYS = [
  { key: "miel_u", label: "Miel" },
  { key: "loncheado_u", label: "Loncheado" },
  { key: "mermelada_u", label: "Mermelada" },
  { key: "queso_u", label: "Queso" },
  { key: "tote_u", label: "Tote" },
  { key: "picos_u", label: "Picos" },
  { key: "vino_u", label: "Vino" },
  { key: "minicata_u", label: "Mini-cata" },
] as const;

function kpiMeta(id: string) {
  return SHOWROOM_KPI_REPORT.find((k) => k.id === id);
}

function KpiCard({
  kpiId,
  label,
  value,
  meta,
  ok,
}: {
  kpiId: string;
  label: string;
  value: string;
  meta?: string;
  ok?: boolean;
}) {
  const hint = kpiMeta(kpiId)?.hint ?? label;
  const cardId = useId();

  return (
    <article
      id={cardId}
      className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm"
      aria-labelledby={`${cardId}-title`}
      aria-describedby={`${cardId}-desc`}
    >
      <h3
        id={`${cardId}-title`}
        className="a11y-hint cursor-help text-xs font-medium uppercase tracking-wide text-stone-500"
        data-hint={hint}
        title={hint}
      >
        {label}
      </h3>
      <p className="mt-1 text-2xl font-semibold tabular-nums text-stone-900" aria-live="polite">
        {value}
      </p>
      <p id={`${cardId}-desc`} className="mt-1 text-xs leading-snug text-stone-500">
        {kpiMeta(kpiId)?.definition ?? hint}
      </p>
      {meta ? (
        <p
          className={`mt-1 text-xs ${ok === true ? "text-emerald-700" : ok === false ? "text-amber-700" : "text-stone-500"}`}
        >
          {meta}
        </p>
      ) : null}
    </article>
  );
}

function ChartBlock({
  chartId,
  title,
  children,
  dataSummary,
}: {
  chartId: string;
  title: string;
  children: React.ReactNode;
  dataSummary?: string;
}) {
  const chartMeta = SHOWROOM_CHART_REPORT.find((c) => c.id === chartId);
  const captionId = useId();

  return (
    <figure className="rounded-2xl border border-stone-200 bg-white p-5" aria-labelledby={captionId}>
      <figcaption id={captionId} className="font-semibold text-stone-900">
        <span
          className="a11y-hint cursor-help"
          data-hint={chartMeta?.shows ?? title}
          title={chartMeta?.shows ?? title}
        >
          {title}
        </span>
      </figcaption>
      {chartMeta ? (
        <p className="mt-1 text-xs text-stone-500">{chartMeta.axes}</p>
      ) : null}
      <div
        className="mt-4"
        role="img"
        aria-label={`${title}. ${chartMeta?.shows ?? ""} ${dataSummary ?? ""}`}
      >
        {children}
      </div>
      {dataSummary ? (
        <p className="sr-only">{dataSummary}</p>
      ) : null}
    </figure>
  );
}

export function ShowroomDailyStatEda({
  rows,
  summary,
}: {
  rows: ShowroomDailyStatExportRow[];
  summary: ShowroomDailyStatsSummary;
}) {
  const openRows = useMemo(() => rows.filter((r) => r.open === 1), [rows]);

  const monthly = useMemo(() => {
    const map = new Map<
      string,
      { month: string; gmv: number; visits: number; purchases: number; days: number }
    >();
    for (const r of openRows) {
      const key = r.date.slice(0, 7);
      const cur = map.get(key) ?? {
        month: key,
        gmv: 0,
        visits: 0,
        purchases: 0,
        days: 0,
      };
      cur.gmv += r.gmv;
      cur.visits += r.visits;
      cur.purchases += r.purchases;
      cur.days += 1;
      map.set(key, cur);
    }
    return [...map.values()]
      .sort((a, b) => a.month.localeCompare(b.month))
      .map((m) => ({
        ...m,
        conversion: m.visits > 0 ? Math.round((m.purchases / m.visits) * 1000) / 10 : 0,
        gmv: Math.round(m.gmv),
      }));
  }, [openRows]);

  const seasonData = useMemo(() => {
    const map = new Map<string, { season: string; gmv: number; ticket: number; n: number }>();
    for (const r of openRows) {
      const cur = map.get(r.Season) ?? { season: r.Season, gmv: 0, ticket: 0, n: 0 };
      cur.gmv += r.gmv;
      cur.ticket += r.avg_ticket_with_impulse;
      cur.n += 1;
      map.set(r.Season, cur);
    }
    return [...map.values()].map((s) => ({
      season: s.season,
      gmv: Math.round(s.gmv),
      ticket: s.n > 0 ? Math.round((s.ticket / s.n) * 100) / 100 : 0,
    }));
  }, [openRows]);

  const holidayCompare = useMemo(() => {
    const groups = { festivo: { gmv: 0, n: 0 }, normal: { gmv: 0, n: 0 } };
    for (const r of openRows) {
      const bucket = r.holiday_or_event === 1 ? groups.festivo : groups.normal;
      bucket.gmv += r.gmv;
      bucket.n += 1;
    }
    return [
      {
        label: "Festivo/evento",
        gmv: groups.festivo.n ? Math.round(groups.festivo.gmv / groups.festivo.n) : 0,
      },
      {
        label: "Día normal",
        gmv: groups.normal.n ? Math.round(groups.normal.gmv / groups.normal.n) : 0,
      },
    ];
  }, [openRows]);

  const skuMix = useMemo(() => {
    const totals: Record<string, number> = {};
    for (const { key } of SKU_KEYS) totals[key] = 0;
    for (const r of openRows) {
      for (const { key } of SKU_KEYS) {
        totals[key] += r[key];
      }
    }
    return SKU_KEYS.map(({ key, label }) => ({ sku: label, units: totals[key] }));
  }, [openRows]);

  const lodgingSeries = useMemo(() => {
    return monthly.map((m) => {
      const monthRows = openRows.filter((r) => r.date.startsWith(m.month));
      return {
        month: m.month,
        referred: monthRows.reduce((s, r) => s + r.referred_visits, 0),
        baskets: monthRows.reduce((s, r) => s + r.baskets_via_lodging, 0),
        online: monthRows.reduce((s, r) => s + r.online_orders_attr, 0),
      };
    });
  }, [monthly, openRows]);

  const impulseSeries = useMemo(() => {
    return openRows.slice(-30).map((r) => ({
      date: r.date.slice(5),
      attach: r.impulse_attach_pct,
      quick: r.quick_buy_pct,
      ticket: r.avg_ticket_with_impulse,
    }));
  }, [openRows]);

  const monthlySummary = monthly
    .map((m) => `${m.month}: GMV ${m.gmv} €, conversión ${m.conversion} %`)
    .join(". ");

  if (rows.length === 0) {
    return (
      <section
        className="rounded-2xl border border-dashed border-stone-300 bg-stone-50 p-8 text-center"
        role="status"
      >
        <h2 className="text-lg font-semibold text-stone-800">Sin datos todavía</h2>
        <p className="mt-2 text-sm text-stone-600">
          Registra el primer día, carga el demo sintético o sincroniza pedidos/CRM. Los gráficos EDA
          aparecerán aquí.
        </p>
      </section>
    );
  }

  return (
    <div className="space-y-8" aria-label="Análisis exploratorio de estadísticas showroom">
      <section aria-labelledby="eda-kpi-panel-heading">
        <h2 id="eda-kpi-panel-heading" className="text-lg font-semibold text-stone-900">
          Panel de metas
        </h2>
        <p className="mt-1 text-sm text-stone-600">
          {summary.daysOpen} días abiertos · {summary.daysTotal} registros en el periodo. Pasa el ratón
          sobre cada KPI para la definición breve; el informe completo está más abajo.
        </p>
        <div
          className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
          role="list"
          aria-label="Indicadores clave del periodo"
        >
          <KpiCard
            kpiId="conversion"
            label="Conversión media"
            value={`${summary.avgConversion} %`}
            meta="Meta ≥ 30–35 %"
            ok={summary.avgConversion >= 30}
          />
          <KpiCard
            kpiId="ticket"
            label="Ticket medio"
            value={formatPrice(summary.avgTicket)}
            meta="Meta ≥ 38 €"
            ok={summary.avgTicket >= 38}
          />
          <KpiCard
            kpiId="attach"
            label="Attach impulso"
            value={`${summary.impulseAttachPct} %`}
            meta="Meta ≥ 40 %"
            ok={summary.impulseAttachPct >= 40}
          />
          <KpiCard
            kpiId="quick"
            label="Quick buy"
            value={`${summary.quickBuyPct} %`}
            meta="Meta ≥ 20 %"
            ok={summary.quickBuyPct >= 20}
          />
          <KpiCard kpiId="gmv" label="GMV periodo" value={formatPrice(summary.gmv)} />
          <KpiCard
            kpiId="units8"
            label="Unidades lista 8"
            value={String(summary.unitsSold)}
            meta="Meta ≥ 60 / periodo"
          />
          <KpiCard kpiId="contacts" label="Contactos" value={String(summary.contacts)} />
          <KpiCard
            kpiId="tote"
            label="Tote vendidas"
            value={String(summary.toteSold)}
            meta={`Stock último día: ${summary.toteStockLast}`}
          />
        </div>
      </section>

      {monthly.length > 0 ? (
        <ChartBlock
          chartId="monthly"
          title="Tendencia mensual — GMV y conversión"
          dataSummary={monthlySummary}
        >
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} unit="%" />
                <Tooltip />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="gmv"
                  name="GMV €"
                  stroke="#2f5d50"
                  strokeWidth={2}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="conversion"
                  name="Conversión %"
                  stroke="#8b4513"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartBlock>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartBlock chartId="season" title="Estación — GMV acumulado">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={seasonData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
                <XAxis dataKey="season" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="gmv" name="GMV €" fill="#2f5d50" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartBlock>

        <ChartBlock chartId="holiday" title="Festivo vs normal — GMV medio/día">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={holidayCompare}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="gmv" name="GMV medio €" fill="#8b4513" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartBlock>
      </div>

      {impulseSeries.length > 0 ? (
        <ChartBlock chartId="impulse" title="Impulso en caja — últimos 30 días abiertos">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={impulseSeries}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis yAxisId="pct" tick={{ fontSize: 11 }} unit="%" />
                <YAxis yAxisId="eur" orientation="right" tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Line
                  yAxisId="pct"
                  type="monotone"
                  dataKey="attach"
                  name="Attach impulso %"
                  stroke="#2f5d50"
                />
                <Line
                  yAxisId="pct"
                  type="monotone"
                  dataKey="quick"
                  name="Quick buy %"
                  stroke="#4a6fa5"
                />
                <Line
                  yAxisId="eur"
                  type="monotone"
                  dataKey="ticket"
                  name="Ticket €"
                  stroke="#8b4513"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartBlock>
      ) : null}

      <ChartBlock chartId="sku" title="Lista de 8 — mix de unidades">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={skuMix} layout="vertical" margin={{ left: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="sku" width={80} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="units" name="Unidades" fill="#2f5d50" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartBlock>

      {lodgingSeries.length > 0 ? (
        <ChartBlock chartId="lodging" title="Canal alojamientos — referidos y online">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={lodgingSeries}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="referred" name="Visitas referidas" fill="#2f5d50" />
                <Bar dataKey="baskets" name="Cestas partners" fill="#8b4513" />
                <Bar dataKey="online" name="Online atrib." fill="#4a6fa5" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartBlock>
      ) : null}

      <section className="rounded-2xl border border-stone-200 bg-white p-5 overflow-x-auto">
        <h3 className="font-semibold text-stone-900">Últimos registros</h3>
        <p className="mt-1 text-xs text-stone-500">
          Tabla accesible con los 14 días más recientes. Abreviaturas: Conv. = conversión; Attach =
          attach impulso.
        </p>
        <table className="mt-3 w-full min-w-[720px] text-left text-sm">
          <caption className="sr-only">
            Últimos catorce días de estadísticas del showroom
          </caption>
          <thead>
            <tr className="border-b border-stone-200 text-xs uppercase text-stone-500">
              <th scope="col" className="py-2 pr-3">
                Fecha
              </th>
              <th scope="col" className="py-2 pr-3">
                Abierto
              </th>
              <th scope="col" className="py-2 pr-3">
                Visitas
              </th>
              <th scope="col" className="py-2 pr-3">
                Compras
              </th>
              <th scope="col" className="py-2 pr-3">
                <abbr title="Gross Merchandise Value — ventas brutas en euros">GMV</abbr>
              </th>
              <th scope="col" className="py-2 pr-3">
                <abbr title="Conversión visita a compra">Conv.</abbr>
              </th>
              <th scope="col" className="py-2 pr-3">
                <abbr title="Porcentaje de tickets con producto de impulso añadido">Attach</abbr>
              </th>
              <th scope="col" className="py-2">
                Demanda
              </th>
            </tr>
          </thead>
          <tbody>
            {[...rows].reverse().slice(0, 14).map((r) => (
              <tr key={r.date} className="border-b border-stone-100">
                <th scope="row" className="py-2 pr-3 tabular-nums font-normal">
                  {r.date}
                </th>
                <td className="py-2 pr-3">{r.open ? "Sí" : "No"}</td>
                <td className="py-2 pr-3 tabular-nums">{r.visits}</td>
                <td className="py-2 pr-3 tabular-nums">{r.purchases}</td>
                <td className="py-2 pr-3 tabular-nums">{formatPrice(r.gmv)}</td>
                <td className="py-2 pr-3 tabular-nums">
                  {(r.conversion_rate * 100).toFixed(1)} %
                </td>
                <td className="py-2 pr-3 tabular-nums">{r.impulse_attach_pct} %</td>
                <td className="py-2">{r.Demand_Level}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
