import Link from "next/link";
import { auth } from "@/auth";
import { getVendorByUserId } from "@culebra/auth";
import { redirect } from "next/navigation";
import { VendorApplyForm } from "@/components/vendor/vendor-apply-form";

export default async function SellPage() {
  const session = await auth();

  if (!session?.user) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-16">
        <div className="rounded-3xl border border-stone-200 bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-semibold">Vende tus productos online</h1>
          <p className="mt-4 text-stone-600">
            Conecta con consumidores interesados en producto local de la Sierra
            de la Culebra. Necesitas una cuenta para empezar.
          </p>
          <div className="mt-8 flex gap-4">
            <Link
              href="/login?callbackUrl=/quiero-vender"
              className="rounded-full bg-emerald-800 px-5 py-3 text-sm font-medium text-white"
            >
              Iniciar sesion
            </Link>
            <Link
              href="/register"
              className="rounded-full border border-stone-300 px-5 py-3 text-sm font-medium"
            >
              Crear cuenta
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const existingVendor = await getVendorByUserId(session.user.id);
  if (existingVendor) {
    redirect("/panel/proveedor");
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <div className="rounded-3xl border border-stone-200 bg-white p-8 shadow-sm">
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
    </main>
  );
}
