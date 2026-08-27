import { listPublicTourismPacks } from "@culebra/auth";
import { TourismPackCard } from "@/components/catalog/tourism-pack-card";
import { PageShell } from "@/components/layout/page-shell";
import { Breadcrumbs } from "@/components/ux/breadcrumbs";
import { EmptyState } from "@/components/ux/empty-state";
import { buildPageMetadata } from "@/lib/site";

export const metadata = buildPageMetadata({
  title: "Packs",
  description:
    "Cestas gourmet del showroom y packs noche + lote de la Sierra de la Culebra. El lote se compra en el marketplace; la noche se reserva fuera.",
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
      <h1 className="mt-4 text-3xl font-semibold sm:text-4xl">Packs y cestas</h1>
      <p className="mt-4 max-w-2xl text-stone-600">
        Cestas del showroom (Escapada, Comarca, Sierra) y packs noche + lote. La estancia se
        reserva fuera; el lote se compra aquí, para llevar o con envío (tarifa plana a cargo del cliente).
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
