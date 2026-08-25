"use client";

import { useMemo } from "react";
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

function KpiCard({
  label,
  value,
  meta,
  ok,
}: {
  label: string;
  value: string;
  meta?: string;
  ok?: boolean;
}) {
  return (
    <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-stone-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums text-stone-900">{value}</p>
      {meta ? (
        <p
          className={`mt-1 text-xs ${ok === true ? "text-emerald-700" : ok === false ? "text-amber-700" : "text-stone-500"}`}
        >
          {meta}
        </p>
      ) : null}
    </div>
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

  if (rows.length === 0) {
    return (
      <section className="rounded-2xl border border-dashed border-stone-300 bg-stone-50 p-8 text-center">
        <h2 className="text-lg font-semibold text-stone-800">Sin datos todavía</h2>
        <p className="mt-2 text-sm text-stone-600">
          Registra el primer día o sincroniza pedidos/CRM. Los gráficos EDA aparecerán aquí como en
          los notebooks.
        </p>
      </section>
    );
  }

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-lg font-semibold text-stone-900">Panel de metas</h2>
        <p className="mt-1 text-sm text-stone-600">
          {summary.daysOpen} días abiertos · {summary.daysTotal} registros en el periodo
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            label="Conversión media"
            value={`${summary.avgConversion} %`}
            meta="Meta ≥ 30–35 %"
            ok={summary.avgConversion >= 30}
          />
          <KpiCard
            label="Ticket medio"
            value={formatPrice(summary.avgTicket)}
            meta="Meta ≥ 38 €"
            ok={summary.avgTicket >= 38}
          />
          <KpiCard
            label="Attach impulso"
            value={`${summary.impulseAttachPct} %`}
            meta="Meta ≥ 40 %"
            ok={summary.impulseAttachPct >= 40}
          />
          <KpiCard
            label="Quick buy"
            value={`${summary.quickBuyPct} %`}
            meta="Meta ≥ 20 %"
            ok={summary.quickBuyPct >= 20}
          />
          <KpiCard label="GMV periodo" value={formatPrice(summary.gmv)} />
          <KpiCard label="Unidades lista 8" value={String(summary.unitsSold)} meta="Meta ≥ 60 / periodo" />
          <KpiCard label="Contactos" value={String(summary.contacts)} />
          <KpiCard
            label="Tote vendidas"
            value={String(summary.toteSold)}
            meta={`Stock último día: ${summary.toteStockLast}`}
          />
        </div>
      </section>

      {monthly.length > 0 ? (
        <section className="rounded-2xl border border-stone-200 bg-white p-5">
          <h3 className="font-semibold text-stone-900">Tendencia mensual — GMV y conversión</h3>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} unit="%" />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="gmv" name="GMV €" stroke="#2f5d50" strokeWidth={2} />
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
        </section>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-stone-200 bg-white p-5">
          <h3 className="font-semibold text-stone-900">Estación — GMV acumulado</h3>
          <div className="mt-4 h-56">
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
        </section>

        <section className="rounded-2xl border border-stone-200 bg-white p-5">
          <h3 className="font-semibold text-stone-900">Festivo vs normal — GMV medio/día</h3>
          <div className="mt-4 h-56">
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
        </section>
      </div>

      {impulseSeries.length > 0 ? (
        <section className="rounded-2xl border border-stone-200 bg-white p-5">
          <h3 className="font-semibold text-stone-900">Impulso en caja — últimos 30 días abiertos</h3>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={impulseSeries}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis yAxisId="pct" tick={{ fontSize: 11 }} unit="%" />
                <YAxis yAxisId="eur" orientation="right" tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Line yAxisId="pct" type="monotone" dataKey="attach" name="Attach %" stroke="#2f5d50" />
                <Line yAxisId="pct" type="monotone" dataKey="quick" name="Quick buy %" stroke="#4a6fa5" />
                <Line yAxisId="eur" type="monotone" dataKey="ticket" name="Ticket €" stroke="#8b4513" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>
      ) : null}

      <section className="rounded-2xl border border-stone-200 bg-white p-5">
        <h3 className="font-semibold text-stone-900">Lista de 8 — mix de unidades</h3>
        <div className="mt-4 h-64">
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
      </section>

      {lodgingSeries.length > 0 ? (
        <section className="rounded-2xl border border-stone-200 bg-white p-5">
          <h3 className="font-semibold text-stone-900">Canal alojamientos — referidos y online</h3>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={lodgingSeries}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="referred" name="Visitas referidas" fill="#2f5d50" />
                <Bar dataKey="baskets" name="Cestas partners" fill="#8b4513" />
                <Bar dataKey="online" name="Online attr." fill="#4a6fa5" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      ) : null}

      <section className="rounded-2xl border border-stone-200 bg-white p-5 overflow-x-auto">
        <h3 className="font-semibold text-stone-900">Últimos registros</h3>
        <table className="mt-3 w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-stone-200 text-xs uppercase text-stone-500">
              <th className="py-2 pr-3">Fecha</th>
              <th className="py-2 pr-3">Abierto</th>
              <th className="py-2 pr-3">Visitas</th>
              <th className="py-2 pr-3">Compras</th>
              <th className="py-2 pr-3">GMV</th>
              <th className="py-2 pr-3">Conv.</th>
              <th className="py-2 pr-3">Attach</th>
              <th className="py-2">Demanda</th>
            </tr>
          </thead>
          <tbody>
            {[...rows].reverse().slice(0, 14).map((r) => (
              <tr key={r.date} className="border-b border-stone-100">
                <td className="py-2 pr-3 tabular-nums">{r.date}</td>
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
