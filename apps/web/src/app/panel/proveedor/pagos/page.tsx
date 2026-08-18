import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getVendorStripeStatus, isStripeConfigured } from "@culebra/auth";
import { PageShell } from "@/components/layout/page-shell";
import { StripeOnboardButton } from "@/components/orders/stripe-onboard-button";

export const metadata = {
  title: "Pagos | Panel productor",
};

type PagosPageProps = {
  searchParams: Promise<{ estado?: string }>;
};

export default async function VendorPaymentsPage({ searchParams }: PagosPageProps) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/panel/proveedor/pagos");
  }

  const { estado } = await searchParams;
  let stripeStatus;
  try {
    stripeStatus = await getVendorStripeStatus(session.user.id);
  } catch {
    redirect("/quiero-vender");
  }

  return (
    <PageShell width="md">
      <Link href="/panel/proveedor" className="text-sm text-emerald-800">
        ← Volver al perfil
      </Link>
      <h1 className="mt-6 text-2xl font-semibold sm:text-3xl">Pagos Stripe</h1>
      <p className="mt-3 text-stone-600">
        Conecta Stripe Express para recibir el importe de tus ventas. La
        plataforma cobra al cliente y transfiere tu neto.
      </p>

      {estado === "ok" ? (
        <p className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          Volviste de Stripe. Si el alta esta completa, los cobros quedaran activos.
        </p>
      ) : null}
      {estado === "refresh" ? (
        <p className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
          El enlace caduco. Vuelve a iniciar el alta.
        </p>
      ) : null}

      <section className="mt-8 rounded-3xl border border-stone-200 bg-white p-5 sm:p-6">
        <p className="text-sm text-stone-600">
          Stripe en la plataforma:{" "}
          {isStripeConfigured() || stripeStatus.stripeConfigured ? "configurado" : "pendiente"}
        </p>
        <p className="mt-2 text-sm text-stone-600">
          Tu cuenta: {stripeStatus.connected ? "conectada" : "sin conectar"}
        </p>
        <p className="mt-2 text-sm text-stone-600">
          Cobros activos: {stripeStatus.chargesEnabled ? "si" : "no"}
        </p>
        <div className="mt-6">
          <StripeOnboardButton connected={stripeStatus.connected} />
        </div>
        <p className="mt-4 text-sm">
          <Link href="/panel/proveedor/liquidaciones" className="text-emerald-800 underline">
            Ver liquidaciones y comisiones
          </Link>
        </p>
      </section>
    </PageShell>
  );
}
