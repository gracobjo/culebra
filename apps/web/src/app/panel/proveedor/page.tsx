import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getVendorContractStatus } from "@culebra/auth";
import { getVendorForPanel } from "./actions";
import { VendorProfileForm } from "@/components/vendor/vendor-profile-form";
import { PageShell } from "@/components/layout/page-shell";

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

  let contractStatus = null;
  try {
    contractStatus = await getVendorContractStatus(session.user.id);
  } catch {
    contractStatus = null;
  }

  return (
    <PageShell width="lg">
      <div className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-emerald-800">
              Panel productor
            </p>
            <h1 className="mt-2 break-words text-2xl font-semibold sm:text-3xl">{vendor.tradeName}</h1>
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

        {contractStatus?.pendingVersion ? (
          <p className="mt-6 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
            Tienes un contrato pendiente de aceptacion.{" "}
            <Link href="/panel/proveedor/contratos" className="underline">
              Revisar y firmar
            </Link>
          </p>
        ) : null}

        {!contractStatus?.hasActiveContract && vendor.status === "ACTIVE" ? (
          <p className="mt-4 rounded-xl bg-stone-100 px-4 py-3 text-sm text-stone-700">
            Necesitas un contrato activo para enviar productos a revision.{" "}
            <Link href="/panel/proveedor/contratos" className="underline">
              Ver contratos
            </Link>
          </p>
        ) : null}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/panel/proveedor/productos"
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-emerald-800 px-5 py-3 text-sm font-medium text-white"
          >
            Gestionar productos
          </Link>
          <Link
            href="/panel/proveedor/pedidos"
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-stone-300 px-5 py-3 text-sm font-medium"
          >
            Ver pedidos
          </Link>
          <Link
            href="/panel/proveedor/pagos"
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-stone-300 px-5 py-3 text-sm font-medium"
          >
            Pagos Stripe
          </Link>
          <Link
            href="/panel/proveedor/contratos"
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-stone-300 px-5 py-3 text-sm font-medium"
          >
            Contratos
          </Link>
          <Link
            href="/panel/proveedor/liquidaciones"
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-stone-300 px-5 py-3 text-sm font-medium"
          >
            Liquidaciones
          </Link>
        </div>

        <div className="mt-8">
          <VendorProfileForm vendor={vendor} />
        </div>

        <Link href="/" className="mt-8 inline-block text-sm text-emerald-800">
          Volver al inicio
        </Link>
      </div>
    </PageShell>
  );
}
