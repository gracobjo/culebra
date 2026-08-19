import fs from "node:fs";
import path from "node:path";
import type PDFDocument from "pdfkit";

export function marketplaceConfig() {
  return {
    name: process.env.MARKETPLACE_NAME ?? "Sabores de la Culebra",
    legalName: process.env.MARKETPLACE_LEGAL_NAME ?? "Marketplace Sabores de la Culebra",
    taxId: process.env.MARKETPLACE_TAX_ID ?? "",
    email:
      process.env.MARKETPLACE_EMAIL ??
      process.env.EMAIL_FROM ??
      "info@saboresdelaculebra.es",
    address: process.env.MARKETPLACE_ADDRESS ?? "Villardeciervos, Zamora, Espana",
  };
}

export function formatDocumentDate(value: Date | string): string {
  const date = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("es-ES", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(date);
}

export function resolveMarketplaceLogoPath(): string | null {
  const candidates = [
    path.join(process.cwd(), "public", "logo.png"),
    path.join(process.cwd(), "apps", "web", "public", "logo.png"),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  return null;
}

export function writeDocumentHeader(
  doc: InstanceType<typeof PDFDocument>,
  params: { subtitle: string; documentDate: Date | string },
) {
  const marketplace = marketplaceConfig();
  const logoPath = resolveMarketplaceLogoPath();
  const headerY = doc.y;
  const logoSize = 56;
  const left = doc.page.margins.left;
  const contentWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
  const textX = logoPath ? left + logoSize + 14 : left;
  const textWidth = contentWidth - (textX - left);

  if (logoPath) {
    doc.image(logoPath, left, headerY, { fit: [logoSize, logoSize] });
  }

  doc
    .font("Helvetica-Bold")
    .fontSize(17)
    .fillColor("#14532d")
    .text(marketplace.name, textX, headerY, { width: textWidth });

  doc
    .font("Helvetica")
    .fontSize(10)
    .fillColor("#000000")
    .text(params.subtitle, textX, doc.y + 2, { width: textWidth });

  doc
    .font("Helvetica")
    .fontSize(9)
    .fillColor("#444444")
    .text(`Fecha: ${formatDocumentDate(params.documentDate)}`, textX, doc.y + 2, {
      width: textWidth,
    });

  doc.fillColor("#000000").fontSize(10);

  const headerBottom = Math.max(doc.y, headerY + logoSize) + 14;
  doc.y = headerBottom;
  doc
    .moveTo(left, headerBottom - 6)
    .lineTo(left + contentWidth, headerBottom - 6)
    .strokeColor("#d6d3d1")
    .lineWidth(1)
    .stroke();
  doc.moveDown(0.6);
}
