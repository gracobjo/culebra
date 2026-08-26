import Image from "next/image";
import Link from "next/link";
import { getShowroomPricingSnapshot } from "@culebra/auth";
import { requireAdmin } from "@/lib/admin";
import { AdminShell } from "@/components/admin/admin-shell";
import {
  PACKAGING_BY_BASKET,
  PACKAGING_CLAIMS,
  PACKAGING_DO,
  PACKAGING_DONT,
  PACKAGING_LAUNCH,
  PACKAGING_SYSTEM,
  PACKAGING_UNIT_COSTS,
} from "@/lib/showroom-packaging";

export const metadata = { title: "Packaging | Admin" };

const BASKET_KEYS = [
  "cesta-escapada",
  "cesta-comarca",
  "cesta-sierra",
  "cesta-reserva",
] as const;

export default async function AdminPackagingPage() {
  await requireAdmin();
  const pricing = await getShowroomPricingSnapshot();

  return (
    <AdminShell title="Packaging — kraft + mosaico">
      <p className="max-w-3xl text-sm text-stone-600">
        Cajas y tags: ilustración mosaico (lobo + ciervo geométrico). Los documentos usan el
        lockup corporativo (escudo verde/oro). Distinto de las cajas de envío S/M/L. Playbook:{" "}
        <code className="rounded bg-stone-100 px-1 text-xs">docs/Packaging_Sabores_Culebra.md</code>
        {" · "}
        <Link href="/admin/showroom/precios" className="text-emerald-800 underline">
          Editar costes y PVP
        </Link>
        {" · "}
        <Link href="/admin/showroom" className="text-emerald-800 underline">
          Márgenes de cestas
        </Link>
        .
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,280px)_1fr]">
        <div className="flex flex-col items-center justify-center rounded-[1.75rem] border border-stone-200 bg-[#c4a574] p-6">
          <Image
            src="/logo.png"
            alt="Mosaico geométrico Sabores de la Culebra"
            width={240}
            height={240}
            className="h-auto w-full max-w-[220px]"
          />
          <p className="mt-4 text-center text-xs font-medium text-stone-800">
            {PACKAGING_CLAIMS.primary}
          </p>
        </div>
        <div className="rounded-[1.75rem] border border-stone-200 bg-white p-6">
          <h2 className="text-lg font-semibold">Frases para imprimir</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div>
              <dt className="text-xs uppercase tracking-wide text-stone-500">Principal</dt>
              <dd className="font-medium">{PACKAGING_CLAIMS.primary}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-stone-500">Secundaria</dt>
              <dd className="font-medium">{PACKAGING_CLAIMS.secondary}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-stone-500">Cierre</dt>
              <dd className="font-medium">{PACKAGING_CLAIMS.close}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-stone-500">Bolsa (reverso)</dt>
              <dd className="font-medium">{PACKAGING_CLAIMS.bagBack}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-stone-500">Tarjeta</dt>
              <dd className="font-medium">{PACKAGING_CLAIMS.cardLine}</dd>
            </div>
          </dl>
        </div>
      </div>

      <section className="mt-8 overflow-x-auto rounded-3xl border border-stone-200 bg-white">
        <h2 className="border-b border-stone-100 px-5 py-4 text-lg font-semibold">Sistema</h2>
        <table className="min-w-full text-left text-sm">
          <thead className="bg-stone-50 text-xs uppercase tracking-wide text-stone-500">
            <tr>
              <th className="px-5 py-3">Elemento</th>
              <th className="px-5 py-3">Uso</th>
              <th className="px-5 py-3">Material</th>
              <th className="px-5 py-3">Piloto</th>
            </tr>
          </thead>
          <tbody>
            {PACKAGING_SYSTEM.map((row) => (
              <tr key={row.item} className="border-t border-stone-100">
                <td className="px-5 py-3 font-medium">{row.item}</td>
                <td className="px-5 py-3 text-stone-600">{row.use}</td>
                <td className="px-5 py-3 text-stone-600">{row.material}</td>
                <td className="px-5 py-3">{row.launch ? "Sí" : row.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="mt-8 overflow-x-auto rounded-3xl border border-stone-200 bg-white">
        <h2 className="border-b border-stone-100 px-5 py-4 text-lg font-semibold">Por cesta</h2>
        <table className="min-w-full text-left text-sm">
          <thead className="bg-stone-50 text-xs uppercase tracking-wide text-stone-500">
            <tr>
              <th className="px-5 py-3">Cesta</th>
              <th className="px-5 py-3">Packaging</th>
              <th className="px-5 py-3">Extra</th>
              <th className="px-5 py-3">Coste plan</th>
              <th className="px-5 py-3">Rango</th>
            </tr>
          </thead>
          <tbody>
            {PACKAGING_BY_BASKET.map((row, index) => {
              const slug = BASKET_KEYS[index];
              const live = slug ? pricing.baskets[slug] : undefined;
              const cost = live?.packagingCost ?? row.plannedCost;
              const pvpLabel = live?.pvp
                ? `${row.basket.split(" ")[0]} ${live.pvp.toLocaleString("es-ES")} €`
                : row.basket;
              return (
                <tr key={row.basket} className="border-t border-stone-100">
                  <td className="px-5 py-3 font-medium">{pvpLabel}</td>
                  <td className="px-5 py-3 text-stone-600">{row.pack}</td>
                  <td className="px-5 py-3 text-stone-600">{row.extra}</td>
                  <td className="px-5 py-3">
                    {cost.toLocaleString("es-ES", {
                      style: "currency",
                      currency: "EUR",
                    })}
                  </td>
                  <td className="px-5 py-3 text-stone-600">{row.costRange}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-stone-200 bg-white p-6">
          <h2 className="text-lg font-semibold">Arranque piloto</h2>
          <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-stone-700">
            {PACKAGING_LAUNCH.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ol>
          <p className="mt-4 text-xs text-stone-500">
            Mimbre y caja premium: Navidad o Cesta Reserva.
          </p>
        </div>
        <div className="rounded-3xl border border-stone-200 bg-white p-6">
          <h2 className="text-lg font-semibold">Coste unitario</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {pricing.packagingUnits.length > 0
              ? pricing.packagingUnits.map((row) => (
                  <li key={row.key} className="flex justify-between gap-3">
                    <span className="text-stone-700">{row.label}</span>
                    <span className="tabular-nums font-medium">
                      {row.costEur.toLocaleString("es-ES", {
                        style: "currency",
                        currency: "EUR",
                      })}
                    </span>
                  </li>
                ))
              : PACKAGING_UNIT_COSTS.map((row) => (
                  <li key={row.item} className="flex justify-between gap-3">
                    <span className="text-stone-700">{row.item}</span>
                    <span className="tabular-nums font-medium">{row.range}</span>
                  </li>
                ))}
          </ul>
          <p className="mt-3 text-xs text-stone-500">
            Editables en{" "}
            <Link href="/admin/showroom/precios" className="underline">
              /admin/showroom/precios
            </Link>
            .
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6">
          <h2 className="text-lg font-semibold text-emerald-950">Sí</h2>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-emerald-950">
            {PACKAGING_DO.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6">
          <h2 className="text-lg font-semibold text-rose-950">No</h2>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-rose-950">
            {PACKAGING_DONT.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </AdminShell>
  );
}
