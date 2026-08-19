import PDFDocument from "pdfkit";
import type { StoredDocumentRecord } from "@culebra/auth";
import {
  formatDocumentDate,
  writeDocumentHeader,
} from "@/lib/pdf-document-header";

function renderPdf(build: (doc: InstanceType<typeof PDFDocument>) => void): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 48, size: "A4" });
    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
    build(doc);
    doc.end();
  });
}

function writeHeading(doc: InstanceType<typeof PDFDocument>, text: string) {
  doc.moveDown(0.5).font("Helvetica-Bold").fontSize(14).text(text);
  doc.moveDown(0.25).font("Helvetica").fontSize(10);
}

export async function generateProductChangePdf(document: StoredDocumentRecord): Promise<Buffer> {
  const snapshot = document.snapshot;
  const changedFields = (snapshot.changedFields as string[]) ?? [];
  const before = (snapshot.before as Record<string, unknown>) ?? {};
  const after = (snapshot.after as Record<string, unknown>) ?? {};

  return renderPdf((doc) => {
    writeDocumentHeader(doc, {
      subtitle: "Registro de cambio de producto",
      documentDate: document.createdAt,
    });

    doc.font("Helvetica-Bold").text("Producto: ", { continued: true });
    doc.font("Helvetica").text(String(snapshot.productName ?? document.title));
    doc.font("Helvetica-Bold").text("Referencia: ", { continued: true });
    doc.font("Helvetica").text(document.entityId);
    doc.font("Helvetica-Bold").text("Conservacion hasta: ", { continued: true });
    doc.font("Helvetica").text(formatDocumentDate(document.retentionUntil));

    writeHeading(doc, "Campos modificados");
    if (changedFields.length === 0) {
      doc.text("Sin detalle de campos.");
    } else {
      for (const field of changedFields) {
        doc.font("Helvetica-Bold").text(field);
        doc.fontSize(9).fillColor("#444444");
        doc.text(`Antes: ${String(before[field] ?? "—")}`);
        doc.text(`Despues: ${String(after[field] ?? "—")}`);
        doc.fillColor("#000000").fontSize(10).moveDown(0.3);
      }
    }

    writeHeading(doc, "Informacion legal");
    doc.fontSize(9).text(
      "Este documento acredita la modificacion registrada en el marketplace. Se conserva durante el plazo indicado (minimo 3 meses) a efectos de trazabilidad y reclamaciones.",
      { align: "justify" },
    );
  });
}

export async function generateStoredDocumentPdf(
  document: StoredDocumentRecord,
): Promise<Buffer> {
  if (document.kind === "PRODUCT_CHANGE") {
    return generateProductChangePdf(document);
  }

  throw new Error("UNSUPPORTED_STORED_DOCUMENT_KIND");
}
