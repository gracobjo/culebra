import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getVendorPayoutStatus } from "@culebra/auth";
import { PageShell } from "@/components/layout/page-shell";
import { VendorPayoutSettings } from "@/components/vendor/vendor-payout-settings";

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
  let payoutStatus;
  try {
    payoutStatus = await getVendorPayoutStatus(session.user.id);
  } catch {
    redirect("/quiero-vender");
  }

  return (
    <PageShell width="md">
      <Link href="/panel/proveedor" className="text-sm text-emerald-800">
        ← Volver al perfil
      </Link>
      <h1 className="mt-6 text-2xl font-semibold sm:text-3xl">Pagos y liquidaciones</h1>
      <p className="mt-3 text-stone-600">
        Elige como recibir tu neto tras cada venta. La plataforma cobra al cliente; tu parte se
        transfiere por Stripe Connect o PayPal.
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

      <section className="mt-8">
        <VendorPayoutSettings
          method={payoutStatus.method}
          stripeConfigured={payoutStatus.stripe.stripeConfigured}
          stripeConnected={payoutStatus.stripe.connected}
          stripeChargesEnabled={payoutStatus.stripe.chargesEnabled}
          paypalConfigured={payoutStatus.paypalConfigured}
          paypalEmail={payoutStatus.paypalEmail}
        />
        <p className="mt-6 text-sm">
          <Link href="/panel/proveedor/liquidaciones" className="text-emerald-800 underline">
            Ver liquidaciones y comisiones
          </Link>
        </p>
      </section>
    </PageShell>
  );
}
