import { generateCustomerOrderPdf } from "@/lib/order-document";
import { auth } from "@/auth";
import { guestCanAccessOrder } from "@/lib/cart";

type RouteContext = {
  params: Promise<{ orderNumber: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  const { orderNumber } = await context.params;
  const session = await auth();
  const guestAccess = await guestCanAccessOrder(orderNumber);
  const email = new URL(request.url).searchParams.get("email") ?? undefined;

  try {
    const pdf = await generateCustomerOrderPdf(orderNumber, {
      userId: session?.user?.id,
      guestAccess,
      email,
    });

    return new Response(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="pedido-${orderNumber}.pdf"`,
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return new Response("No autorizado o pedido no encontrado.", { status: 404 });
  }
}
