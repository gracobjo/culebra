import { generateVendorOrderPdf } from "@/lib/order-document";
import { auth } from "@/auth";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("No autorizado.", { status: 401 });
  }

  const { id } = await context.params;

  try {
    const pdf = await generateVendorOrderPdf(session.user.id, id);

    return new Response(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="pedido-productor-${id}.pdf"`,
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return new Response("Pedido no encontrado.", { status: 404 });
  }
}
