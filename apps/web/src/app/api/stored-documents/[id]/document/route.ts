import { getStoredDocumentForAdmin, getStoredDocumentForOwner } from "@culebra/auth";
import { auth } from "@/auth";
import { requireAdmin } from "@/lib/admin";
import { generateCustomerOrderPdf, generateVendorOrderPdf } from "@/lib/order-document";
import { generateStoredDocumentPdf } from "@/lib/product-change-document";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const session = await auth();
  const isAdminRequest = new URL(request.url).searchParams.get("admin") === "1";

  let document;
  if (isAdminRequest) {
    await requireAdmin("/admin");
    document = await getStoredDocumentForAdmin(id);
  } else if (session?.user?.id) {
    document = await getStoredDocumentForOwner(id, session.user.id);
  }

  if (!document) {
    return new Response("Documento no encontrado o expirado.", { status: 404 });
  }

  try {
    let pdf: Buffer;
    if (document.kind === "ORDER_CUSTOMER") {
      const orderNumber = String(
        (document.snapshot.orderNumber as string | undefined) ??
          document.title.replace("Pedido ", ""),
      );
      pdf = await generateCustomerOrderPdf(orderNumber, { userId: session?.user?.id });
    } else if (document.kind === "ORDER_VENDOR") {
      pdf = await generateVendorOrderPdf(session!.user!.id, document.entityId);
    } else {
      pdf = await generateStoredDocumentPdf(document);
    }

    return new Response(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${document.kind.toLowerCase()}-${id}.pdf"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("[stored-document-pdf]", error);
    return new Response("No se pudo generar el PDF.", { status: 500 });
  }
}
