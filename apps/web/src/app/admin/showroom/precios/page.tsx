import Link from "next/link";
import { listShowroomPriceCatalog } from "@culebra/auth/showroom-pricing.service";
import { requireAdmin } from "@/lib/admin";
import { AdminShell } from "@/components/admin/admin-shell";
import { ShowroomPricingForm } from "@/components/admin/showroom-pricing-form";

export const metadata = { title: "Precios showroom | Admin" };

export default async function AdminShowroomPricingPage() {
  await requireAdmin("/admin/showroom/precios");
  const items = await listShowroomPriceCatalog();

  return (
    <AdminShell title="Precios showroom — coste y PVP">
      <p className="max-w-3xl text-sm text-stone-600">
        Aquí se fijan los importes de cestas, cajas/packaging, tote y catas. Al guardar,
        alimentan márgenes de{" "}
        <Link href="/admin/showroom" className="text-emerald-800 underline">
          /admin/showroom
        </Link>
        , costes de{" "}
        <Link href="/admin/packaging" className="text-emerald-800 underline">
          /admin/packaging
        </Link>{" "}
        y defaults del{" "}
        <Link href="/admin/plan" className="text-emerald-800 underline">
          plan / simulador
        </Link>
        .
      </p>
      <div className="mt-8">
        <ShowroomPricingForm items={items} />
      </div>
    </AdminShell>
  );
}
