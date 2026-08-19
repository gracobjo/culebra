import { NextResponse } from "next/server";

import { createVendorStripeOnboardingLink } from "@culebra/auth";

import { auth } from "@/auth";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  try {
    const link = await createVendorStripeOnboardingLink(session.user.id);
    return NextResponse.json({ url: link.url });
  } catch (error) {
    if (error instanceof Error && error.message === "STRIPE_NOT_CONFIGURED") {
      return NextResponse.json(
        { error: "Stripe no esta configurado en este entorno." },
        { status: 503 },
      );
    }
    console.error("[api/vendor/stripe/onboard]", error);
    return NextResponse.json(
      { error: "No se pudo iniciar el alta en Stripe." },
      { status: 500 },
    );
  }
}
