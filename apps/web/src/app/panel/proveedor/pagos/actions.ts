"use server";

import { createVendorStripeOnboardingLink } from "@culebra/auth";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export type StripeOnboardState = {
  error?: string;
};

export async function startVendorStripeOnboarding(
  _prev: StripeOnboardState,
  _formData: FormData,
): Promise<StripeOnboardState> {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/panel/proveedor/pagos");
  }

  try {
    const link = await createVendorStripeOnboardingLink(session.user.id);
    redirect(link.url);
  } catch (error) {
    if (error && typeof error === "object" && "digest" in error) {
      throw error;
    }
    if (error instanceof Error && error.message === "STRIPE_NOT_CONFIGURED") {
      return { error: "Stripe no esta configurado en este entorno." };
    }
    return { error: "No se pudo iniciar el alta en Stripe." };
  }
}
