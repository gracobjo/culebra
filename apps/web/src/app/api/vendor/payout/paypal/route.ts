import { NextResponse } from "next/server";
import { z } from "zod";

import { setVendorPayPalEmail } from "@culebra/auth";

import { auth } from "@/auth";

const bodySchema = z.object({
  email: z.string().trim().email().max(254),
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
    return NextResponse.json({ error: "Email de PayPal invalido." }, { status: 400 });
  }

  try {
    const result = await setVendorPayPalEmail(session.user.id, body.email);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof Error) {
      const messages: Record<string, string> = {
        PAYPAL_NOT_CONFIGURED: "PayPal no esta disponible en este entorno.",
        VENDOR_NOT_FOUND: "Perfil de productor no encontrado.",
      };
      if (messages[error.message]) {
        return NextResponse.json({ error: messages[error.message] }, { status: 503 });
      }
    }
    console.error("[api/vendor/payout/paypal]", error);
    return NextResponse.json({ error: "No se pudo guardar el email de PayPal." }, { status: 500 });
  }
}
