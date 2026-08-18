import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getVendorForPanel } from "./actions";
import { VendorProfileForm } from "@/components/vendor/vendor-profile-form";

const statusLabels: Record<string, string> = {
  DRAFT: "Borrador",
  PENDING_REVIEW: "Pendiente de revision",
  ACTIVE: "Activo",
  SUSPENDED: "Suspendido",
  REJECTED: "Rechazado",
};

export default async function VendorPanelPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?callbackUrl=/panel/proveedor");
  }

  const vendor = await getVendorForPanel();
  if (!vendor) {
    redirect("/quiero-vender");
  }

  return (
    <main className="mx-auto min-h-screen max-w-4xl px-6 py-16">
      <div className="rounded-3xl border border-stone-200 bg-white p-8 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-emerald-800">
              Panel productor
            </p>
            <h1 className="mt-2 text-3xl font-semibold">{vendor.tradeName}</h1>
            <p className="mt-2 text-stone-600">/{vendor.slug}</p>
          </div>
          <span className="rounded-full bg-stone-100 px-4 py-2 text-sm">
            {statusLabels[vendor.status] ?? vendor.status}
          </span>
        </div>

        {vendor.status === "ACTIVE" ? (
          <p className="mt-6 text-sm text-emerald-700">
            Tu tienda esta activa.{" "}
            <Link href={`/productores/${vendor.slug}`} className="underline">
              Ver pagina publica
            </Link>
          </p>
        ) : null}

        <div className="mt-6">
          <Link
            href="/panel/proveedor/productos"
            className="rounded-full bg-emerald-800 px-5 py-3 text-sm font-medium text-white"
          >
            Gestionar productos
          </Link>
        </div>

        <div className="mt-8">
          <VendorProfileForm vendor={vendor} />
        </div>

        <Link href="/" className="mt-8 inline-block text-sm text-emerald-800">
          Volver al inicio
        </Link>
      </div>
    </main>
  );
}
