"use client";

import { useState } from "react";

export function StripeOnboardButton({ connected }: { connected: boolean }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConnect() {
    setPending(true);
    setError(null);

    try {
      const response = await fetch("/api/vendor/stripe/onboard", {
        method: "POST",
        credentials: "same-origin",
      });
      const payload = (await response.json()) as { url?: string; error?: string };

      if (!response.ok || !payload.url) {
        throw new Error(payload.error || "No se pudo iniciar el alta en Stripe.");
      }

      window.location.href = payload.url;
    } catch (connectError) {
      const message =
        connectError instanceof Error
          ? connectError.message
          : "No se pudo iniciar el alta en Stripe.";
      setError(message);
      setPending(false);
    }
  }

  return (
    <div>
      {error ? <p className="mb-3 text-sm text-red-700">{error}</p> : null}
      <button
        type="button"
        disabled={pending}
        onClick={() => void handleConnect()}
        className="inline-flex min-h-11 w-full items-center justify-center rounded-full bg-emerald-800 px-5 py-3 text-sm font-medium text-white disabled:opacity-60 sm:w-auto"
      >
        {pending
          ? "Redirigiendo a Stripe..."
          : connected
            ? "Completar o actualizar Stripe"
            : "Conectar cuenta Stripe"}
      </button>
    </div>
  );
}
