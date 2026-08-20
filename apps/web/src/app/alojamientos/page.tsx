import { listPublicAccommodations } from "@culebra/auth";
import { AccommodationCard } from "@/components/catalog/accommodation-card";
import { PageShell } from "@/components/layout/page-shell";
import { Breadcrumbs } from "@/components/ux/breadcrumbs";
import { EmptyState } from "@/components/ux/empty-state";
import { buildPageMetadata } from "@/lib/site";

export const metadata = buildPageMetadata({
  title: "Alojamientos",
  description:
    "Directorio de alojamientos de la Sierra de la Culebra. Reserva en su web o Booking y descubre productos locales.",
  path: "/alojamientos",
});

export default async function AccommodationsPage() {
  const { items } = await listPublicAccommodations(50);

  return (
    <PageShell>
      <Breadcrumbs
        items={[
          { label: "Inicio", href: "/" },
          { label: "Tienda", href: "/tienda" },
          { label: "Alojamientos" },
        ]}
      />
      <h1 className="mt-4 text-3xl font-semibold sm:text-4xl">Alojamientos del territorio</h1>
      <p className="mt-4 max-w-2xl text-stone-600">
        Casas rurales y hospedajes de la sierra. La reserva se hace en su canal habitual
        (web, Booking o WhatsApp). Si vienes a la sierra, prueba tambien los productos
        locales del marketplace.
      </p>

      {items.length === 0 ? (
        <div className="mt-10">
          <EmptyState
            title="Pronto habra alojamientos"
            description="Estamos incorporando casas rurales y hospedajes del territorio."
            actionHref="/productos"
            actionLabel="Ver productos"
          />
        </div>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <AccommodationCard key={item.id} accommodation={item} />
          ))}
        </div>
      )}
    </PageShell>
  );
}
