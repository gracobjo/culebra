import Link from "next/link";

import { VendorPayoutMethod } from "@culebra/domain";
import { getVendorPayoutStatus } from "@culebra/auth";

type VendorPayoutNoticeProps = {
  method: VendorPayoutMethod;
  payoutsReady: boolean;
  stripeConnected: boolean;
  paypalEmail: string | null;
  className?: string;
};

export function VendorPayoutNotice({
  method,
  payoutsReady,
  stripeConnected,
  paypalEmail,
  className = "",
}: VendorPayoutNoticeProps) {
  if (payoutsReady) {
    return null;
  }

  return (
    <div
      className={`rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 ${className}`}
      role="status"
    >
      {method === VendorPayoutMethod.PAYPAL ? (
        <p>
          Configura tu email de PayPal para recibir liquidaciones. Puedes publicar productos y
          recibir pedidos, pero los pagos quedaran pendientes hasta indicar tu cuenta PayPal.{" "}
          <Link href="/panel/proveedor/pagos" className="font-medium underline">
            Configurar PayPal
          </Link>
        </p>
      ) : !stripeConnected ? (
        <p>
          Conecta Stripe para recibir el importe de tus ventas. Puedes publicar productos y
          recibir pedidos, pero las liquidaciones quedaran pendientes hasta completar el alta.{" "}
          <Link href="/panel/proveedor/pagos" className="font-medium underline">
            Conectar Stripe
          </Link>
        </p>
      ) : (
        <p>
          Tu cuenta Stripe esta conectada, pero los cobros aun no estan activos. Completa el
          onboarding para recibir transferencias.{" "}
          <Link href="/panel/proveedor/pagos" className="font-medium underline">
            Completar Stripe
          </Link>
        </p>
      )}
      {method === VendorPayoutMethod.PAYPAL && paypalEmail ? (
        <p className="mt-2 text-xs text-amber-900">Email guardado: {paypalEmail}</p>
      ) : null}
    </div>
  );
}

export async function VendorPayoutBanner({ userId }: { userId: string }) {
  try {
    const status = await getVendorPayoutStatus(userId);
    if (status.payoutsReady) {
      return null;
    }

    return (
      <div className="border-b border-amber-200/80 bg-amber-50/90 px-4 py-3">
        <div className="mx-auto max-w-6xl">
          <VendorPayoutNotice
            method={status.method}
            payoutsReady={status.payoutsReady}
            stripeConnected={status.stripe.connected}
            paypalEmail={status.paypalEmail}
          />
        </div>
      </div>
    );
  } catch {
    return null;
  }
}
