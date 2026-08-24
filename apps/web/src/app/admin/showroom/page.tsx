import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { AdminShell } from "@/components/admin/admin-shell";
import { ShowroomOptimizer } from "@/components/admin/showroom-optimizer";
import {
  INCOME_SOURCES,
  SPACE_ZONES,
  REVENUE_SCENARIOS,
  IMPLANTATION_PRIORITY,
  SHOWROOM_BASKETS,
  basketEconomics,
} from "@/lib/showroom-cestas";

export const metadata = { title: "Showroom | Admin" };

function euros(value: number) {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
  }).format(value);
}

export default async function AdminShowroomPage() {
  await requireAdmin();

  return (
    <AdminShell title="Showroom — motor de margen">
      <p className="max-w-3xl text-sm text-stone-600">
        El online prudente no sostiene solo los fijos: el showroom debe ser el principal generador
        de margen y captación (cestas, experiencia, contactos → pedidos web). Playbook:{" "}
        <code className="rounded bg-stone-100 px-1 text-xs">docs/Showroom_Ingresos_Cestas.md</code>
        {" · "}
        <Link href="/packs" className="text-emerald-800 underline">
          Cestas en /packs
        </Link>
        {" · "}
        <Link href="/admin/packaging" className="text-emerald-800 underline">
          Packaging
        </Link>
        {" · "}
        <Link href="/admin/plan" className="text-emerald-800 underline">
          Plan financiero
        </Link>
        {" · "}
        <Link href="/admin/turismo" className="text-emerald-800 underline">
          Alojamientos (canal)
        </Link>
        .
      </p>

      <div className="mt-8">
        <ShowroomOptimizer />
      </div>

      <section className="mt-10 overflow-x-auto rounded-3xl border border-stone-200 bg-white">
        <h2 className="border-b border-stone-100 px-5 py-4 text-lg font-semibold">Fuentes de ingreso</h2>
        <table className="min-w-full text-left text-sm">
          <thead className="bg-stone-50 text-xs uppercase tracking-wide text-stone-500">
            <tr>
              <th className="px-5 py-3">Fuente</th>
              <th className="px-5 py-3">Cómo</th>
              <th className="px-5 py-3">Modelo</th>
              <th className="px-5 py-3">Potencial</th>
            </tr>
          </thead>
          <tbody>
            {INCOME_SOURCES.map((row) => (
              <tr key={row.source} className="border-t border-stone-100">
                <td className="px-5 py-3 font-medium">{row.source}</td>
                <td className="px-5 py-3 text-stone-600">{row.how}</td>
                <td className="px-5 py-3 text-stone-600">{row.fit}</td>
                <td className="px-5 py-3">{row.potential}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-stone-200 bg-white p-6">
          <h2 className="text-lg font-semibold">Prioridad de implantación comercial</h2>
          <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-stone-700">
            {IMPLANTATION_PRIORITY.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ol>
        </div>
        <div className="rounded-3xl border border-stone-200 bg-white p-6">
          <h2 className="text-lg font-semibold">Zonas del local</h2>
          <ul className="mt-4 space-y-3 text-sm">
            {SPACE_ZONES.map((z) => (
              <li key={z.zone}>
                <p className="font-medium">{z.zone}</p>
                <p className="text-stone-600">
                  {z.role} → {z.goal}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mt-8 overflow-x-auto rounded-3xl border border-stone-200 bg-white">
        <h2 className="border-b border-stone-100 px-5 py-4 text-lg font-semibold">
          Estimación GMV showroom (prudente, sin optimizar)
        </h2>
        <table className="min-w-full text-left text-sm">
          <thead className="bg-stone-50 text-xs uppercase tracking-wide text-stone-500">
            <tr>
              <th className="px-5 py-3">Escenario</th>
              <th className="px-5 py-3">Días / año</th>
              <th className="px-5 py-3">Compras</th>
              <th className="px-5 py-3">Ticket</th>
              <th className="px-5 py-3">GMV</th>
              <th className="px-5 py-3">Comisión 17 %</th>
            </tr>
          </thead>
          <tbody>
            {REVENUE_SCENARIOS.map((row) => (
              <tr key={row.name} className="border-t border-stone-100">
                <td className="px-5 py-3 font-medium">{row.name}</td>
                <td className="px-5 py-3">{row.openDays}</td>
                <td className="px-5 py-3">{row.purchases}</td>
                <td className="px-5 py-3">{euros(row.avgTicket)}</td>
                <td className="px-5 py-3">{euros(row.gmv)}</td>
                <td className="px-5 py-3">{euros(row.commission)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="px-5 py-4 text-xs text-stone-500">
          Referencia antigua (escaparate pasivo). Usa el simulador de arriba para el escenario
          optimizado (ticket 40 €, conversión 35 %, margen showroom 7.500–9.000 €).
        </p>
      </section>

      <section className="mt-8 overflow-x-auto rounded-3xl border border-stone-200 bg-white">
        <h2 className="border-b border-stone-100 px-5 py-4 text-lg font-semibold">
          Cestas (PVP objetivo y margen S.L.)
        </h2>
        <table className="min-w-full text-left text-sm">
          <thead className="bg-stone-50 text-xs uppercase tracking-wide text-stone-500">
            <tr>
              <th className="px-5 py-3">Cesta</th>
              <th className="px-5 py-3">PVP</th>
              <th className="px-5 py-3">Comisión</th>
              <th className="px-5 py-3">Packaging</th>
              <th className="px-5 py-3">Margen neto</th>
              <th className="px-5 py-3">Arranque</th>
            </tr>
          </thead>
          <tbody>
            {SHOWROOM_BASKETS.map((basket) => {
              const eco = basketEconomics(basket);
              return (
                <tr key={basket.slug} className="border-t border-stone-100">
                  <td className="px-5 py-3">
                    <p className="font-medium">{basket.name}</p>
                    <p className="text-xs text-stone-500">{basket.positioning}</p>
                  </td>
                  <td className="px-5 py-3">{euros(basket.pvp)}</td>
                  <td className="px-5 py-3">{euros(eco.commission)}</td>
                  <td className="px-5 py-3">{euros(basket.packagingCost)}</td>
                  <td className="px-5 py-3 font-medium">
                    {euros(eco.netMargin)}{" "}
                    <span className="text-xs font-normal text-stone-500">({eco.netPercent} %)</span>
                  </td>
                  <td className="px-5 py-3">{basket.launch ? "Sí" : "Navidad / más tarde"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {SHOWROOM_BASKETS.filter((b) => b.launch).map((basket) => (
          <article key={basket.slug} className="rounded-3xl border border-stone-200 bg-white p-6">
            <h3 className="text-lg font-semibold">
              {basket.name} · {euros(basket.pvp)}
            </h3>
            <p className="mt-2 text-sm text-stone-600">{basket.sensation}</p>
            <ul className="mt-4 space-y-1 text-sm text-stone-700">
              {basket.items.map((item) => (
                <li key={item.product}>
                  {item.product}{" "}
                  <span className="text-stone-500">
                    ({item.format}) · {euros(item.pvpInBasket)}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-stone-500">{basket.idealFor}</p>
          </article>
        ))}
      </div>

      <p className="mt-8 rounded-3xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-950">
        Reglas: depósito mínimo (no compra de género); porte 6,50 € al cliente si hay envío;
        3–4 productores por cesta; Comarca 45 € como estrella; no bajar del rango 29–45 €.
      </p>
    </AdminShell>
  );
}
