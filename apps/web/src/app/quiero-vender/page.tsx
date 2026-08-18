import Link from "next/link";
import { auth } from "@/auth";
import { getVendorByUserId } from "@culebra/auth";
import { redirect } from "next/navigation";
import { VendorApplyForm } from "@/components/vendor/vendor-apply-form";
import { PageShell } from "@/components/layout/page-shell";
import { buildPageMetadata } from "@/lib/site";

export const metadata = buildPageMetadata({
  title: "Quiero vender",
  description: "Alta de productores en el marketplace Sierra de la Culebra.",
  path: "/quiero-vender",
});

export default async function SellPage() {
  const session = await auth();

  if (!session?.user) {
    return (
      <PageShell width="md">
        <div className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm sm:p-8">
          <h1 className="text-2xl font-semibold sm:text-3xl">Vende tus productos online</h1>
          <p className="mt-4 text-stone-600">
            Conecta con consumidores interesados en producto local de la Sierra
            de la Culebra. Necesitas una cuenta para empezar.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:gap-4">
            <Link
              href="/login?callbackUrl=/quiero-vender"
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-emerald-800 px-5 py-3 text-sm font-medium text-white"
            >
              Iniciar sesion
            </Link>
            <Link
              href="/register"
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-stone-300 px-5 py-3 text-sm font-medium"
            >
              Crear cuenta
            </Link>
          </div>
        </div>
      </PageShell>
    );
  }

  const existingVendor = await getVendorByUserId(session.user.id);
  if (existingVendor) {
    redirect("/panel/proveedor");
  }

  return (
    <PageShell width="md">
      <div className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm sm:p-8">
        <p className="text-sm uppercase tracking-[0.2em] text-emerald-800">
          Productores
        </p>
        <h1 className="mt-2 text-3xl font-semibold">Quiero vender</h1>
        <p className="mt-4 text-stone-600">
          Completa los datos iniciales de tu negocio. Un administrador revisara
          tu solicitud antes de activar tu tienda.
        </p>
        <div className="mt-8">
          <VendorApplyForm />
        </div>
      </div>
    </PageShell>
  );
}
