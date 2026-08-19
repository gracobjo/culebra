import { generateCustomerOrderPdfForAdmin } from "@/lib/order-document";
import { requireAdmin } from "@/lib/admin";

type RouteContext = {
  params: Promise<{ orderNumber: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  await requireAdmin("/admin/pedidos");
  const { orderNumber } = await context.params;

  try {
    const pdf = await generateCustomerOrderPdfForAdmin(orderNumber);

    return new Response(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="pedido-${orderNumber}.pdf"`,
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return new Response("Pedido no encontrado.", { status: 404 });
  }
}
