import PDFDocument from "pdfkit";
import { getVendorByUserId, recordOrderDocuments } from "@culebra/auth";
import { prisma } from "@culebra/db";
import {
  formatDocumentDate,
  marketplaceConfig,
  writeDocumentHeader,
} from "@/lib/pdf-document-header";

type AddressSnapshot = {
  firstName?: string;
  lastName?: string;
  street?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  country?: string;
  phone?: string;
  company?: string;
  taxId?: string;
};

type DocumentLineItem = {
  productName: string;
  variantLabel: string | null;
  vendorName: string;
  quantity: number;
  unitPriceGross: number;
  subtotalGross: number;
  vatRate: number;
  taxAmount: number;
  netAmount: number;
};

export type CustomerOrderDocument = {
  kind: "customer";
  orderNumber: string;
  createdAt: Date;
  status: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  shippingAddress: AddressSnapshot | null;
  billingAddress: AddressSnapshot | null;
  paymentStatus: string | null;
  paymentProvider: string | null;
  paymentMethod: string | null;
  currency: string;
  lines: DocumentLineItem[];
  subtotalGross: number;
  shippingAmount: number;
  taxTotal: number;
  totalAmount: number;
  vendorOrders: Array<{
    vendorName: string;
    status: string;
    trackingNumber: string | null;
    carrier: string | null;
  }>;
};

export type VendorOrderDocument = {
  kind: "vendor";
  orderNumber: string;
  vendorOrderId: string;
  vendorName: string;
  vendorLegalName: string | null;
  vendorTaxId: string | null;
  createdAt: Date;
  status: string;
  paymentStatus: string | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  shippingAddress: AddressSnapshot | null;
  notes: string | null;
  lines: DocumentLineItem[];
  subtotalGross: number;
  taxTotal: number;
  marketplaceCommission: number;
  vendorNetAmount: number;
  shipment: {
    carrier: string | null;
    trackingNumber: string | null;
    status: string;
  } | null;
};

function taxFromGross(gross: number, vatRate: number): number {
  return Number(((gross * vatRate) / (100 + vatRate)).toFixed(2));
}

function asAddress(value: unknown): AddressSnapshot | null {
  if (!value || typeof value !== "object") {
    return null;
  }
  return value as AddressSnapshot;
}

function asNumber(value: unknown): number {
  return Number(value ?? 0);
}

function formatMoney(value: number, currency = "EUR"): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency,
  }).format(value);
}

function formatDate(value: Date): string {
  return formatDocumentDate(value);
}

function paymentMethodLabel(
  metadata: unknown,
  provider: string | null,
  status: string | null,
): string {
  if (status !== "PAYMENT_PAID") {
    return "Pendiente de pago";
  }
  if (metadata && typeof metadata === "object" && "paymentMethod" in metadata) {
    const method = String((metadata as Record<string, unknown>).paymentMethod ?? "");
    if (method) {
      return method;
    }
  }
  if (provider === "stripe") {
    return "Stripe (tarjeta / Bizum)";
  }
  return provider ?? "Pago online";
}

function mapLineItem(item: {
  productName: string;
  variantLabel: string | null;
  quantity: number;
  unitPrice: unknown;
  subtotalGross: unknown;
  vatRate: unknown;
  vendor?: { tradeName: string } | null;
}): DocumentLineItem {
  const subtotalGross = asNumber(item.subtotalGross);
  const vatRate = asNumber(item.vatRate);
  const taxAmount = taxFromGross(subtotalGross, vatRate);
  return {
    productName: item.productName,
    variantLabel: item.variantLabel,
    vendorName: item.vendor?.tradeName ?? "Productor",
    quantity: item.quantity,
    unitPriceGross: asNumber(item.unitPrice),
    subtotalGross,
    vatRate,
    taxAmount,
    netAmount: Number((subtotalGross - taxAmount).toFixed(2)),
  };
}

const WITHDRAWAL_NOTICE = [
  "Derecho de desistimiento:",
  "De conformidad con el Real Decreto Legislativo 1/2007, dispone de 14 dias naturales desde la recepcion del producto para ejercer el derecho de desistimiento, salvo las excepciones legales aplicables (por ejemplo, productos perecederos o personalizados).",
  "Para ejercerlo, contacte con el marketplace indicando numero de pedido y producto afectado.",
].join(" ");

async function assertCustomerOrderAccess(
  order: { userId: string | null; customerEmail: string },
  access: { userId?: string; guestAccess?: boolean; email?: string },
) {
  const ownsOrder = Boolean(access.userId && order.userId === access.userId);
  const guestCookie = Boolean(access.guestAccess);
  const guestEmail = Boolean(
    access.email && order.customerEmail.toLowerCase() === access.email.toLowerCase(),
  );
  if (!ownsOrder && !guestCookie && !guestEmail) {
    throw new Error("ORDER_ACCESS_DENIED");
  }
}

function mapCustomerOrderDocument(order: {
  orderNumber: string;
  createdAt: Date;
  status: string;
  customerFirstName: string | null;
  customerLastName: string | null;
  customerEmail: string;
  customerPhone: string | null;
  shippingAddressSnapshot: unknown;
  billingAddressSnapshot: unknown;
  currency: string;
  subtotalGross: unknown;
  shippingAmount?: unknown;
  taxTotal: unknown;
  totalAmount: unknown;
  items: Array<{
    productName: string;
    variantLabel: string | null;
    quantity: number;
    unitPrice: unknown;
    subtotalGross: unknown;
    vatRate: unknown;
    taxAmount?: unknown;
    netAmount?: unknown;
    vendor?: { tradeName: string } | null;
  }>;
  payment: {
    status: string;
    provider: string;
    metadata: unknown;
  } | null;
  vendorOrders: Array<{
    status: string;
    vendor: { tradeName: string };
    shipment: { trackingNumber: string | null; carrier: string | null } | null;
  }>;
}): CustomerOrderDocument {
  const customerName = [order.customerFirstName, order.customerLastName]
    .filter(Boolean)
    .join(" ");

  return {
    kind: "customer",
    orderNumber: order.orderNumber,
    createdAt: order.createdAt,
    status: order.status,
    customerName: customerName || "Cliente",
    customerEmail: order.customerEmail,
    customerPhone: order.customerPhone,
    shippingAddress: asAddress(order.shippingAddressSnapshot),
    billingAddress: asAddress(order.billingAddressSnapshot),
    paymentStatus: order.payment?.status ?? null,
    paymentProvider: order.payment?.provider ?? null,
    paymentMethod: paymentMethodLabel(
      order.payment?.metadata,
      order.payment?.provider ?? null,
      order.payment?.status ?? null,
    ),
    currency: order.currency,
    lines: order.items.map((item) => mapLineItem(item)),
    subtotalGross: asNumber(order.subtotalGross),
    shippingAmount: asNumber(order.shippingAmount ?? 0),
    taxTotal: asNumber(order.taxTotal),
    totalAmount: asNumber(order.totalAmount),
    vendorOrders: order.vendorOrders.map((vendorOrder) => ({
      vendorName: vendorOrder.vendor.tradeName,
      status: vendorOrder.status,
      trackingNumber: vendorOrder.shipment?.trackingNumber ?? null,
      carrier: vendorOrder.shipment?.carrier ?? null,
    })),
  };
}

async function loadCustomerOrder(orderNumber: string) {
  return prisma.order.findFirst({
    where: { orderNumber },
    include: {
      items: { include: { vendor: { select: { tradeName: true } } } },
      payment: true,
      vendorOrders: {
        include: {
          vendor: { select: { tradeName: true } },
          shipment: true,
        },
      },
    },
  });
}

export async function generateCustomerOrderPdf(
  orderNumber: string,
  access: { userId?: string; guestAccess?: boolean; email?: string },
): Promise<Buffer> {
  const orderRow = await prisma.order.findFirst({
    where: { orderNumber },
    select: { id: true },
  });
  if (orderRow) {
    await recordOrderDocuments(orderRow.id).catch(() => undefined);
  }

  const order = await loadCustomerOrder(orderNumber);
  if (!order) {
    throw new Error("ORDER_NOT_FOUND");
  }
  await assertCustomerOrderAccess(order, access);
  return renderCustomerOrderPdf(mapCustomerOrderDocument(order));
}

export async function generateCustomerOrderPdfForAdmin(orderNumber: string): Promise<Buffer> {
  const order = await loadCustomerOrder(orderNumber);
  if (!order) {
    throw new Error("ORDER_NOT_FOUND");
  }
  return renderCustomerOrderPdf(mapCustomerOrderDocument(order));
}

export async function generateVendorOrderPdf(
  userId: string,
  vendorOrderId: string,
): Promise<Buffer> {
  const vendor = await getVendorByUserId(userId);
  if (!vendor) {
    throw new Error("VENDOR_NOT_FOUND");
  }

  const row = await prisma.vendorOrder.findFirst({
    where: { id: vendorOrderId, vendorId: vendor.id },
    include: {
      vendor: {
        select: {
          tradeName: true,
          legalName: true,
          taxId: true,
        },
      },
      shipment: true,
      items: {
        include: {
          orderItem: {
            include: {
              vendor: { select: { tradeName: true } },
            },
          },
        },
      },
      order: {
        include: {
          payment: true,
        },
      },
    },
  });

  if (!row) {
    throw new Error("VENDOR_ORDER_NOT_FOUND");
  }

  const customerName = [row.order.customerFirstName, row.order.customerLastName]
    .filter(Boolean)
    .join(" ");

  const data: VendorOrderDocument = {
    kind: "vendor",
    orderNumber: row.order.orderNumber,
    vendorOrderId: row.id,
    vendorName: row.vendor.tradeName,
    vendorLegalName: row.vendor.legalName,
    vendorTaxId: row.vendor.taxId,
    createdAt: row.createdAt,
    status: row.status,
    paymentStatus: row.order.payment?.status ?? null,
    customerName: customerName || "Cliente",
    customerEmail: row.order.customerEmail,
    customerPhone: row.order.customerPhone,
    shippingAddress: asAddress(row.order.shippingAddressSnapshot),
    notes: row.order.notes,
    lines: row.items.map((link) => mapLineItem(link.orderItem)),
    subtotalGross: asNumber(row.subtotalGross),
    taxTotal: asNumber(row.taxTotal),
    marketplaceCommission: asNumber(row.marketplaceCommission),
    vendorNetAmount: asNumber(row.vendorNetAmount),
    shipment: row.shipment
      ? {
          carrier: row.shipment.carrier,
          trackingNumber: row.shipment.trackingNumber,
          status: row.shipment.status,
        }
      : null,
  };

  return renderVendorOrderPdf(data);
}

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

function writeKeyValue(doc: InstanceType<typeof PDFDocument>, label: string, value: string) {
  doc.font("Helvetica-Bold").text(`${label}: `, { continued: true });
  doc.font("Helvetica").text(value);
}

function writeLinesTable(
  doc: InstanceType<typeof PDFDocument>,
  lines: DocumentLineItem[],
  currency: string,
) {
  writeHeading(doc, "Detalle de productos");
  for (const line of lines) {
    const title = line.variantLabel
      ? `${line.productName} (${line.variantLabel})`
      : line.productName;
    doc.text(title);
    doc.fontSize(9).fillColor("#444444");
    doc.text(
      [
        `Productor: ${line.vendorName}`,
        `Cantidad: ${line.quantity}`,
        `PVP unitario (IVA incl.): ${formatMoney(line.unitPriceGross, currency)}`,
        `Base imponible: ${formatMoney(line.netAmount, currency)}`,
        `IVA ${line.vatRate}%: ${formatMoney(line.taxAmount, currency)}`,
        `Importe linea (IVA incl.): ${formatMoney(line.subtotalGross, currency)}`,
      ].join(" · "),
    );
    doc.fillColor("#000000").fontSize(10).moveDown(0.4);
  }
}

async function renderCustomerOrderPdf(data: CustomerOrderDocument): Promise<Buffer> {
  const marketplace = marketplaceConfig();

  return renderPdf((doc) => {
    writeDocumentHeader(doc, {
      subtitle: "Justificante de compra / resumen de pedido",
      documentDate: data.createdAt,
    });

    writeKeyValue(doc, "Pedido", data.orderNumber);
    writeKeyValue(doc, "Fecha", formatDate(data.createdAt));
    writeKeyValue(doc, "Estado", data.status);
    writeKeyValue(doc, "Cliente", `${data.customerName} (${data.customerEmail})`);
    if (data.customerPhone) {
      writeKeyValue(doc, "Telefono", data.customerPhone);
    }
    writeKeyValue(doc, "Modo de pago", data.paymentMethod ?? "No disponible");
    writeKeyValue(doc, "Estado del pago", data.paymentStatus ?? "Pendiente");

    if (data.shippingAddress) {
      writeHeading(doc, "Direccion de envio");
      const address = data.shippingAddress;
      doc.text(
        [
          `${address.firstName ?? ""} ${address.lastName ?? ""}`.trim(),
          address.street,
          `${address.postalCode ?? ""} ${address.city ?? ""}`.trim(),
          address.province,
          address.country ?? "Espana",
        ]
          .filter(Boolean)
          .join("\n"),
      );
    }

    if (data.billingAddress) {
      writeHeading(doc, "Datos de facturacion");
      const billing = data.billingAddress;
      doc.text(
        [
          billing.company,
          `${billing.firstName ?? ""} ${billing.lastName ?? ""}`.trim(),
          billing.taxId ? `NIF/CIF: ${billing.taxId}` : null,
          billing.street,
          `${billing.postalCode ?? ""} ${billing.city ?? ""}`.trim(),
          billing.province,
        ]
          .filter(Boolean)
          .join("\n"),
      );
    }

    writeLinesTable(doc, data.lines, data.currency);

    writeHeading(doc, "Totales");
    writeKeyValue(doc, "Subtotal (IVA incl.)", formatMoney(data.subtotalGross, data.currency));
    writeKeyValue(doc, "IVA total", formatMoney(data.taxTotal, data.currency));
    if (data.shippingAmount > 0) {
      writeKeyValue(
        doc,
        "Gastos de envio (tarifa plana)",
        formatMoney(data.shippingAmount, data.currency),
      );
    }
    writeKeyValue(doc, "Total pagado", formatMoney(data.totalAmount, data.currency));

    if (data.vendorOrders.length > 0) {
      writeHeading(doc, "Seguimiento por productor");
      for (const vendorOrder of data.vendorOrders) {
        doc.text(
          `${vendorOrder.vendorName} · ${vendorOrder.status}${
            vendorOrder.trackingNumber
              ? ` · ${vendorOrder.carrier ?? "Transporte"} ${vendorOrder.trackingNumber}`
              : ""
          }`,
        );
      }
    }

    writeHeading(doc, "Informacion legal");
    doc.fontSize(9).text(WITHDRAWAL_NOTICE, { align: "justify" });
    doc.moveDown(0.5);
    doc.text(
      `${marketplace.legalName}${marketplace.taxId ? ` · NIF/CIF ${marketplace.taxId}` : ""} · ${marketplace.address} · ${marketplace.email}`,
      { align: "justify" },
    );
  });
}

async function renderVendorOrderPdf(data: VendorOrderDocument): Promise<Buffer> {
  return renderPdf((doc) => {
    writeDocumentHeader(doc, {
      subtitle: `Resumen de pedido para productor · ${data.vendorName}`,
      documentDate: data.createdAt,
    });

    writeKeyValue(doc, "Pedido marketplace", data.orderNumber);
    writeKeyValue(doc, "Referencia productor", data.vendorOrderId);
    writeKeyValue(doc, "Fecha", formatDate(data.createdAt));
    writeKeyValue(doc, "Estado", data.status);
    writeKeyValue(doc, "Pago del cliente", data.paymentStatus ?? "Pendiente");
    writeKeyValue(doc, "Cliente", `${data.customerName} (${data.customerEmail})`);
    if (data.customerPhone) {
      writeKeyValue(doc, "Telefono", data.customerPhone);
    }
    if (data.vendorLegalName) {
      writeKeyValue(doc, "Razon social", data.vendorLegalName);
    }
    if (data.vendorTaxId) {
      writeKeyValue(doc, "NIF/CIF productor", data.vendorTaxId);
    }

    if (data.shippingAddress) {
      writeHeading(doc, "Envio");
      const address = data.shippingAddress;
      doc.text(
        [
          address.street,
          `${address.postalCode ?? ""} ${address.city ?? ""}`.trim(),
          address.province,
        ]
          .filter(Boolean)
          .join("\n"),
      );
    }

    if (data.notes) {
      writeKeyValue(doc, "Notas del cliente", data.notes);
    }

    writeLinesTable(doc, data.lines, "EUR");

    writeHeading(doc, "Liquidacion del productor");
    writeKeyValue(doc, "Subtotal (IVA incl.)", formatMoney(data.subtotalGross));
    writeKeyValue(doc, "IVA total", formatMoney(data.taxTotal));
    writeKeyValue(doc, "Comision marketplace", formatMoney(data.marketplaceCommission));
    writeKeyValue(doc, "Neto a recibir", formatMoney(data.vendorNetAmount));

    if (data.shipment?.trackingNumber) {
      writeHeading(doc, "Envio registrado");
      writeKeyValue(
        doc,
        "Seguimiento",
        `${data.shipment.carrier ?? "Transporte"} · ${data.shipment.trackingNumber}`,
      );
    }
  });
}
