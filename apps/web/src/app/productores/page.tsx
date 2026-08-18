import { listPublicVendors } from "@culebra/auth";
import { VendorCard } from "@/components/catalog/vendor-card";
import { PageShell } from "@/components/layout/page-shell";
import { Breadcrumbs } from "@/components/ux/breadcrumbs";
import { EmptyState } from "@/components/ux/empty-state";
import { siteConfig } from "@/lib/site";

export const metadata = {
  title: `Productores | ${siteConfig.shortName}`,
  description: "Productores y elaboradores de la Sierra de la Culebra.",
};

export default async function ProducersPage() {
  const { items } = await listPublicVendors({ limit: 50 });

  return (
    <PageShell>
      <Breadcrumbs items={[{ label: "Inicio", href: "/" }, { label: "Productores" }]} />
      <h1 className="mt-4 text-3xl font-semibold sm:text-4xl">Productores de la sierra</h1>
      <p className="mt-4 max-w-2xl text-stone-600">
        Descubre quienes elaboran los productos del marketplace. Compra directamente
        a productores locales y apoya la economia del territorio.
      </p>

      {items.length === 0 ? (
        <div className="mt-10">
          <EmptyState
            title="Aun no hay productores activos"
            description="Pronto apareceran elaboradores de la zona."
            actionHref="/quiero-vender"
            actionLabel="Quiero vender"
          />
        </div>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((vendor) => (
            <VendorCard key={vendor.id} vendor={vendor} />
          ))}
        </div>
      )}
    </PageShell>
  );
}
