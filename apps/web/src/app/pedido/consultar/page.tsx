import { PageShell } from "@/components/layout/page-shell";
import { GuestOrderLookupForm } from "@/components/orders/guest-order-lookup-form";

export const metadata = {
  title: "Consultar pedido | Sierra de la Culebra Marketplace",
};

export default function GuestOrderLookupPage() {
  return (
    <PageShell width="sm">
      <p className="text-xs uppercase tracking-[0.2em] text-emerald-800 sm:text-sm">
        Seguimiento
      </p>
      <h1 className="mt-2 text-2xl font-semibold sm:text-3xl">Consultar pedido</h1>
      <p className="mt-3 text-stone-600">
        Si compraste como invitado, introduce el numero de pedido y el email.
      </p>
      <div className="mt-8 rounded-3xl border border-stone-200 bg-white p-5 sm:p-8">
        <GuestOrderLookupForm />
      </div>
    </PageShell>
  );
}
