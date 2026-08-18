import Link from "next/link";
import { listPublicVendors } from "@culebra/auth";
import { PageShell } from "@/components/layout/page-shell";

export default async function ProducersPage() {
  const { items } = await listPublicVendors({ limit: 50 });

  return (
    <PageShell>
      <div className="mb-8 sm:mb-10">
        <p className="text-xs uppercase tracking-[0.2em] text-emerald-800 sm:text-sm">
          Productores
        </p>
        <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">Productores de la sierra</h1>
        <p className="mt-4 max-w-2xl text-stone-600">
          Descubre quienes elaboran los productos del marketplace. Compra
          directamente a productores locales.
        </p>
      </div>

      {items.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-stone-300 p-10 text-center text-stone-600">
          Todavia no hay productores activos publicados.
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((vendor) => (
            <Link
              key={vendor.id}
              href={`/productores/${vendor.slug}`}
              className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm transition hover:border-emerald-300"
            >
              <h2 className="text-xl font-semibold">{vendor.tradeName}</h2>
              <p className="mt-2 text-sm text-stone-600">
                {[vendor.city, vendor.province].filter(Boolean).join(", ")}
              </p>
              {vendor.description ? (
                <p className="mt-4 line-clamp-3 text-sm text-stone-600">
                  {vendor.description}
                </p>
              ) : null}
            </Link>
          ))}
        </div>
      )}
    </PageShell>
  );
}
