"use client";

import { useState } from "react";
import type { VendorPayoutMethod } from "@culebra/domain";

import { StripeOnboardButton } from "@/components/orders/stripe-onboard-button";

type VendorPayoutSettingsProps = {
  method: VendorPayoutMethod;
  stripeConfigured: boolean;
  stripeConnected: boolean;
  stripeChargesEnabled: boolean;
  paypalConfigured: boolean;
  paypalEmail: string | null;
};

export function VendorPayoutSettings({
  method: initialMethod,
  stripeConfigured,
  stripeConnected,
  stripeChargesEnabled,
  paypalConfigured,
  paypalEmail: initialPaypalEmail,
}: VendorPayoutSettingsProps) {
  const [method, setMethod] = useState(initialMethod);
  const [paypalEmail, setPaypalEmail] = useState(initialPaypalEmail ?? "");
  const [pendingMethod, setPendingMethod] = useState(false);
  const [pendingPaypal, setPendingPaypal] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function selectMethod(nextMethod: VendorPayoutMethod) {
    setPendingMethod(true);
    setMessage(null);
    setError(null);

    try {
      const response = await fetch("/api/vendor/payout/method", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ method: nextMethod }),
      });
      const payload = (await response.json()) as { method?: VendorPayoutMethod; error?: string };
      if (!response.ok || !payload.method) {
        throw new Error(payload.error ?? "No se pudo cambiar el metodo de cobro.");
      }
      setMethod(payload.method);
      setMessage(
        payload.method === "PAYPAL"
          ? "Metodo PayPal seleccionado. Indica tu email de PayPal."
          : "Metodo Stripe seleccionado.",
      );
    } catch (selectError) {
      setError(
        selectError instanceof Error
          ? selectError.message
          : "No se pudo cambiar el metodo de cobro.",
      );
    } finally {
      setPendingMethod(false);
    }
  }

  async function savePayPalEmail(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPendingPaypal(true);
    setMessage(null);
    setError(null);

    try {
      const response = await fetch("/api/vendor/payout/paypal", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: paypalEmail }),
      });
      const payload = (await response.json()) as { paypalEmail?: string; error?: string };
      if (!response.ok || !payload.paypalEmail) {
        throw new Error(payload.error ?? "No se pudo guardar el email de PayPal.");
      }
      setPaypalEmail(payload.paypalEmail);
      setMethod("PAYPAL");
      setMessage("Email de PayPal guardado. Recibiras liquidaciones en esa cuenta.");
    } catch (saveError) {
      setError(
        saveError instanceof Error ? saveError.message : "No se pudo guardar el email de PayPal.",
      );
    } finally {
      setPendingPaypal(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Como quieres cobrar</h2>
        <p className="mt-2 text-sm text-stone-600">
          El cliente siempre paga con tarjeta/Bizum en la plataforma. Tu neto se transfiere por
          Stripe Connect o PayPal, segun elijas.
        </p>
      </div>

      {message ? <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{message}</p> : null}
      {error ? <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}

      <div className="grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          disabled={pendingMethod || !stripeConfigured}
          onClick={() => void selectMethod("STRIPE_CONNECT")}
          className={`rounded-2xl border px-4 py-4 text-left transition ${
            method === "STRIPE_CONNECT"
              ? "border-emerald-700 bg-emerald-50"
              : "border-stone-200 bg-white hover:border-stone-300"
          } disabled:opacity-60`}
        >
          <p className="font-medium">Stripe Connect</p>
          <p className="mt-1 text-sm text-stone-600">
            Cuenta Express con transferencia bancaria. Recomendado si ya usas Stripe.
          </p>
          {!stripeConfigured ? (
            <p className="mt-2 text-xs text-amber-800">Stripe no configurado en la plataforma.</p>
          ) : null}
        </button>

        <button
          type="button"
          disabled={pendingMethod || !paypalConfigured}
          onClick={() => void selectMethod("PAYPAL")}
          className={`rounded-2xl border px-4 py-4 text-left transition ${
            method === "PAYPAL"
              ? "border-emerald-700 bg-emerald-50"
              : "border-stone-200 bg-white hover:border-stone-300"
          } disabled:opacity-60`}
        >
          <p className="font-medium">PayPal</p>
          <p className="mt-1 text-sm text-stone-600">
            Recibe liquidaciones en tu cuenta PayPal por email. Sin alta en Stripe.
          </p>
          {!paypalConfigured ? (
            <p className="mt-2 text-xs text-amber-800">PayPal no configurado en la plataforma.</p>
          ) : null}
        </button>
      </div>

      {method === "STRIPE_CONNECT" ? (
        <section className="rounded-3xl border border-stone-200 bg-white p-5 sm:p-6">
          <p className="text-sm text-stone-600">
            Stripe en la plataforma: {stripeConfigured ? "configurado" : "pendiente"}
          </p>
          <p className="mt-2 text-sm text-stone-600">
            Tu cuenta: {stripeConnected ? "conectada" : "sin conectar"}
          </p>
          <p className="mt-2 text-sm text-stone-600">
            Cobros activos: {stripeChargesEnabled ? "si" : "no"}
          </p>
          <div className="mt-6">
            <StripeOnboardButton connected={stripeConnected} />
          </div>
        </section>
      ) : null}

      {method === "PAYPAL" && paypalConfigured ? (
        <section className="rounded-3xl border border-stone-200 bg-white p-5 sm:p-6">
          <h3 className="font-medium">Email de PayPal</h3>
          <p className="mt-2 text-sm text-stone-600">
            Debe coincidir con la cuenta PayPal donde quieres recibir las liquidaciones.
          </p>
          <form className="mt-4 space-y-4" onSubmit={(event) => void savePayPalEmail(event)}>
            <input
              type="email"
              required
              value={paypalEmail}
              onChange={(event) => setPaypalEmail(event.target.value)}
              placeholder="tu@email.paypal.com"
              className="w-full rounded-xl border border-stone-300 px-4 py-3 text-sm"
            />
            <button
              type="submit"
              disabled={pendingPaypal}
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-emerald-800 px-5 py-3 text-sm font-medium text-white disabled:opacity-60"
            >
              {pendingPaypal ? "Guardando..." : "Guardar email PayPal"}
            </button>
          </form>
        </section>
      ) : null}
    </div>
  );
}
