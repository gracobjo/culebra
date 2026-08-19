import { NextResponse } from "next/server";
import { z } from "zod";
import { VendorPayoutMethod } from "@culebra/domain";

import { updateVendorPayoutMethod } from "@culebra/auth";

import { auth } from "@/auth";

const bodySchema = z.object({
  method: z.enum([VendorPayoutMethod.STRIPE_CONNECT, VendorPayoutMethod.PAYPAL]),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  let body: z.infer<typeof bodySchema>;
  try {
    body = bodySchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "Metodo de cobro invalido." }, { status: 400 });
  }

  try {
    const result = await updateVendorPayoutMethod(session.user.id, body.method);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof Error) {
      const messages: Record<string, string> = {
        STRIPE_NOT_CONFIGURED: "Stripe no esta disponible en este entorno.",
        PAYPAL_NOT_CONFIGURED: "PayPal no esta disponible en este entorno.",
        VENDOR_NOT_FOUND: "Perfil de productor no encontrado.",
      };
      if (messages[error.message]) {
        return NextResponse.json({ error: messages[error.message] }, { status: 503 });
      }
    }
    console.error("[api/vendor/payout/method]", error);
    return NextResponse.json({ error: "No se pudo actualizar el metodo de cobro." }, { status: 500 });
  }
}
