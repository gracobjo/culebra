import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { AdminShell } from "@/components/admin/admin-shell";
import { ShowroomOptimizer } from "@/components/admin/showroom-optimizer";
import { ShowroomImpulseMetrics } from "@/components/admin/showroom-impulse-metrics";
import { PackCover } from "@/components/catalog/pack-cover";
import {
  INCOME_SOURCES,
  SPACE_ZONES,
  REVENUE_SCENARIOS,
  IMPLANTATION_PRIORITY,
  SHOWROOM_BASKETS,
  basketEconomics,
} from "@/lib/showroom-cestas";
import {
  CHECKOUT_IMPULSE_GOAL,
  CHECKOUT_IMPULSE_ITEMS,
  EXTRA_ARTICLES_PHASES,
  EXTRA_ARTICLES_SUMMARY,
  HIGH_PRIORITY_ARTICLES,
  MEDIUM_PRIORITY_ARTICLES,
  PRIORITY_EIGHT_ARTICLES,
  PRIORITY_EIGHT_GOALS,
  PRIORITY_EIGHT_NEGOTIATION,
  PRIORITY_EIGHT_PLACEMENT,
  PRIORITY_EIGHT_ROLLOUT,
  TOTE_BAG_PHASES,
  TOTE_BAG_SPECS,
  TOTE_BAG_SUPPLIERS,
  TOTE_BAG_TIP,
  SHOWROOM_AVOID_ITEMS,
  SHOWROOM_COMBOS,
  SHOWROOM_EXPERIENCES,
} from "@/lib/showroom-otros-articulos";

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
        de margen y captación (cestas, otros artículos, experiencia, contactos → pedidos web).
        Playbook:{" "}
        <code className="rounded bg-stone-100 px-1 text-xs">docs/Showroom_Ingresos_Cestas.md</code>
        {" · "}
        <code className="rounded bg-stone-100 px-1 text-xs">docs/Showroom_Otros_Articulos.md</code>
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

      <div className="mt-8">
        <ShowroomImpulseMetrics />
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
          <article key={basket.slug} className="overflow-hidden rounded-3xl border border-stone-200 bg-white">
            <PackCover pack={{ slug: basket.slug, name: basket.name }} className="aspect-[16/9]" />
            <div className="p-6">
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
            </div>
          </article>
        ))}
      </div>

      <section className="mt-10 overflow-x-auto rounded-3xl border border-emerald-200 bg-white shadow-sm">
        <div className="border-b border-emerald-100 bg-emerald-50/70 px-5 py-4">
          <h2 className="text-lg font-semibold text-emerald-950">
            Lista corta prioritaria — 8 artículos
          </h2>
          <p className="mt-1 text-sm text-emerald-900/80">
            Impulso, ticket medio y fácil gestión (depósito o poca inversión). Orden de
            implantación. Playbook:{" "}
            <code className="rounded bg-white/80 px-1 text-xs">docs/Showroom_Otros_Articulos.md</code>
          </p>
        </div>
        <table className="min-w-full text-left text-sm">
          <thead className="bg-stone-50 text-xs uppercase tracking-wide text-stone-500">
            <tr>
              <th className="px-5 py-3">#</th>
              <th className="px-5 py-3">Artículo</th>
              <th className="px-5 py-3">Formato</th>
              <th className="px-5 py-3">Modelo</th>
              <th className="px-5 py-3">PVP</th>
              <th className="px-5 py-3">Objetivo</th>
            </tr>
          </thead>
          <tbody>
            {PRIORITY_EIGHT_ARTICLES.map((row) => (
              <tr key={row.order} className="border-t border-stone-100">
                <td className="px-5 py-3 tabular-nums text-stone-500">{row.order}</td>
                <td className="px-5 py-3 font-medium">{row.name}</td>
                <td className="px-5 py-3 text-stone-600">{row.format}</td>
                <td className="px-5 py-3 text-stone-600">{row.model}</td>
                <td className="px-5 py-3">{row.pvp}</td>
                <td className="px-5 py-3 text-stone-600">{row.goal}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-3xl border border-stone-200 bg-white p-6">
          <h3 className="text-base font-semibold">Colocación</h3>
          <ul className="mt-4 space-y-3 text-sm">
            {PRIORITY_EIGHT_PLACEMENT.map((row) => (
              <li key={row.zone}>
                <p className="font-medium">{row.zone}</p>
                <p className="text-stone-600">{row.items}</p>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-3xl border border-stone-200 bg-white p-6">
          <h3 className="text-base font-semibold">Negociación</h3>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-stone-700">
            {PRIORITY_EIGHT_NEGOTIATION.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-3xl border border-stone-200 bg-white p-6">
          <h3 className="text-base font-semibold">Meta de estos 8</h3>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-stone-700">
            {PRIORITY_EIGHT_GOALS.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-3xl border border-stone-200 bg-white p-6">
          <h3 className="text-base font-semibold">Puesta en marcha</h3>
          <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-stone-700">
            {PRIORITY_EIGHT_ROLLOUT.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mt-8 overflow-x-auto rounded-3xl border border-stone-200 bg-white">
        <div className="border-b border-stone-100 px-5 py-4">
          <h2 className="text-lg font-semibold">Tote bag personalizada — proveedores</h2>
          <p className="mt-1 text-sm text-stone-600">
            Artículo #5 de la lista corta. Compra propia, PVP orientativo 8–10 €. {TOTE_BAG_TIP}
          </p>
        </div>
        <table className="min-w-full text-left text-sm">
          <thead className="bg-stone-50 text-xs uppercase tracking-wide text-stone-500">
            <tr>
              <th className="px-5 py-3">Proveedor</th>
              <th className="px-5 py-3">Mínimo</th>
              <th className="px-5 py-3">Ideal para</th>
              <th className="px-5 py-3">Precio</th>
              <th className="px-5 py-3">Enlace</th>
            </tr>
          </thead>
          <tbody>
            {TOTE_BAG_SUPPLIERS.map((row) => (
              <tr key={row.name} className="border-t border-stone-100">
                <td className="px-5 py-3">
                  <p className="font-medium">{row.name}</p>
                  <p className="text-xs text-stone-500">{row.note}</p>
                </td>
                <td className="px-5 py-3 text-stone-600">{row.minOrder}</td>
                <td className="px-5 py-3 text-stone-600">{row.idealFor}</td>
                <td className="px-5 py-3">{row.priceHint}</td>
                <td className="px-5 py-3">
                  <a
                    href={row.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={`Abrir web de ${row.name}`}
                    data-hint={`Abrir web de ${row.name}`}
                    className="a11y-hint text-emerald-800 underline underline-offset-2"
                  >
                    Visitar
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-stone-200 bg-white p-6">
          <h3 className="text-base font-semibold">Según fase</h3>
          <ul className="mt-4 space-y-3 text-sm">
            {TOTE_BAG_PHASES.map((row) => (
              <li key={row.phase}>
                <p className="font-medium">{row.phase}</p>
                <p className="text-stone-600">{row.detail}</p>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-3xl border border-stone-200 bg-white p-6">
          <h3 className="text-base font-semibold">Especificaciones de marca</h3>
          <dl className="mt-4 space-y-2 text-sm">
            {TOTE_BAG_SPECS.map((row) => (
              <div key={row.aspect} className="grid grid-cols-[7.5rem_1fr] gap-2">
                <dt className="font-medium text-stone-800">{row.aspect}</dt>
                <dd className="text-stone-600">{row.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="mt-10 overflow-x-auto rounded-3xl border border-stone-200 bg-white">        <div className="border-b border-stone-100 px-5 py-4">
          <h2 className="text-lg font-semibold">Catálogo ampliado — alta prioridad</h2>
          <p className="mt-1 text-sm text-stone-600">
            Referencia completa además de la lista corta de 8.
          </p>
        </div>
        <table className="min-w-full text-left text-sm">
          <thead className="bg-stone-50 text-xs uppercase tracking-wide text-stone-500">
            <tr>
              <th className="px-5 py-3">Artículo</th>
              <th className="px-5 py-3">Por qué</th>
              <th className="px-5 py-3">Modelo</th>
              <th className="px-5 py-3">Margen</th>
            </tr>
          </thead>
          <tbody>
            {HIGH_PRIORITY_ARTICLES.map((row) => (
              <tr key={row.name} className="border-t border-stone-100">
                <td className="px-5 py-3 font-medium">{row.name}</td>
                <td className="px-5 py-3 text-stone-600">{row.why}</td>
                <td className="px-5 py-3 text-stone-600">{row.model}</td>
                <td className="px-5 py-3">{row.margin}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="mt-8 overflow-x-auto rounded-3xl border border-stone-200 bg-white">
        <h2 className="border-b border-stone-100 px-5 py-4 text-lg font-semibold">
          Media prioridad — marca y ticket
        </h2>
        <table className="min-w-full text-left text-sm">
          <thead className="bg-stone-50 text-xs uppercase tracking-wide text-stone-500">
            <tr>
              <th className="px-5 py-3">Artículo</th>
              <th className="px-5 py-3">Por qué</th>
              <th className="px-5 py-3">Modelo</th>
            </tr>
          </thead>
          <tbody>
            {MEDIUM_PRIORITY_ARTICLES.map((row) => (
              <tr key={row.name} className="border-t border-stone-100">
                <td className="px-5 py-3 font-medium">{row.name}</td>
                <td className="px-5 py-3 text-stone-600">{row.why}</td>
                <td className="px-5 py-3 text-stone-600">{row.model}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="overflow-x-auto rounded-3xl border border-stone-200 bg-white">
          <h2 className="border-b border-stone-100 px-5 py-4 text-lg font-semibold">
            Experiencias como artículo
          </h2>
          <table className="min-w-full text-left text-sm">
            <thead className="bg-stone-50 text-xs uppercase tracking-wide text-stone-500">
              <tr>
                <th className="px-5 py-3">Experiencia</th>
                <th className="px-5 py-3">Precio</th>
                <th className="px-5 py-3">Notas</th>
              </tr>
            </thead>
            <tbody>
              {SHOWROOM_EXPERIENCES.map((row) => (
                <tr key={row.name} className="border-t border-stone-100">
                  <td className="px-5 py-3 font-medium">{row.name}</td>
                  <td className="px-5 py-3">{row.price}</td>
                  <td className="px-5 py-3 text-stone-600">{row.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="rounded-3xl border border-emerald-200 bg-emerald-50/60 p-6">
          <h2 className="text-lg font-semibold text-emerald-950">Impulso junto al TPV</h2>
          <p className="mt-2 text-sm text-emerald-900/80">{CHECKOUT_IMPULSE_GOAL}</p>
          <ul className="mt-4 list-disc space-y-1.5 pl-5 text-sm text-emerald-950">
            {CHECKOUT_IMPULSE_ITEMS.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="rounded-3xl border border-stone-200 bg-white p-6">
          <h2 className="text-lg font-semibold">Combinaciones</h2>
          <ul className="mt-4 space-y-3 text-sm">
            {SHOWROOM_COMBOS.map((row) => (
              <li key={row.combo}>
                <p className="font-medium">{row.combo}</p>
                <p className="text-stone-600">{row.effect}</p>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-3xl border border-stone-200 bg-white p-6">
          <h2 className="text-lg font-semibold">Fases de implantación</h2>
          <ul className="mt-4 space-y-4 text-sm">
            {EXTRA_ARTICLES_PHASES.map((phase) => (
              <li key={phase.phase}>
                <p className="font-medium">{phase.phase}</p>
                <p className="mt-1 text-stone-600">{phase.items.join(" · ")}</p>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-3xl border border-stone-200 bg-white p-6">
          <h2 className="text-lg font-semibold">Qué evitar (por ahora)</h2>
          <ul className="mt-4 space-y-3 text-sm">
            {SHOWROOM_AVOID_ITEMS.map((row) => (
              <li key={row.item}>
                <p className="font-medium">{row.item}</p>
                <p className="text-stone-600">{row.reason}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mt-8 rounded-3xl border border-stone-200 bg-white p-6">
        <h2 className="text-lg font-semibold">Resumen — mejores «otros artículos»</h2>
        <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-stone-700">
          {EXTRA_ARTICLES_SUMMARY.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ol>
      </section>

      <p className="mt-8 rounded-3xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-950">
        Reglas: depósito mínimo (no compra de género); porte 6,50 € al cliente si hay envío;
        3–4 productores por cesta; Comarca 45 € como estrella; no bajar del rango 29–45 €.
        Impulso en caja: +4–12 € sin stock frío ni merchandising genérico.
      </p>
    </AdminShell>
  );
}
