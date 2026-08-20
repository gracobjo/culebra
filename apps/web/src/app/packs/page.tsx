import { listPublicTourismPacks } from "@culebra/auth";
import { TourismPackCard } from "@/components/catalog/tourism-pack-card";
import { PageShell } from "@/components/layout/page-shell";
import { Breadcrumbs } from "@/components/ux/breadcrumbs";
import { EmptyState } from "@/components/ux/empty-state";
import { buildPageMetadata } from "@/lib/site";

export const metadata = buildPageMetadata({
  title: "Packs",
  description:
    "Packs noche + lote gourmet de la Sierra de la Culebra. Reserva el alojamiento fuera y compra el lote en el marketplace.",
  path: "/packs",
});

export default async function PacksPage() {
  const { items } = await listPublicTourismPacks(50);

  return (
    <PageShell>
      <Breadcrumbs
        items={[
          { label: "Inicio", href: "/" },
          { label: "Tienda", href: "/tienda" },
          { label: "Packs" },
        ]}
      />
      <h1 className="mt-4 text-3xl font-semibold sm:text-4xl">Packs sierra</h1>
      <p className="mt-4 max-w-2xl text-stone-600">
        Combina una estancia en el territorio con un lote gourmet. La noche se reserva en el
        alojamiento; el lote se compra aqui, con envio a domicilio o para llevar.
      </p>

      {items.length === 0 ? (
        <div className="mt-10">
          <EmptyState
            title="Aun no hay packs publicados"
            description="Pronto podras elegir combos de noche + productos locales."
            actionHref="/alojamientos"
            actionLabel="Ver alojamientos"
          />
        </div>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((pack) => (
            <TourismPackCard key={pack.id} pack={pack} />
          ))}
        </div>
      )}
    </PageShell>
  );
}
