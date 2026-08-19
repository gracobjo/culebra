/**
 * email.service.ts
 *
 * Servicio de email transaccional. En producción se conecta al proveedor
 * configurado en EMAIL_PROVIDER_API_KEY (Resend, SendGrid, Mailgun, etc.).
 * En desarrollo vuelca los emails en consola si no hay proveedor.
 *
 * Para activar Resend (recomendado): añade al .env:
 *   EMAIL_PROVIDER=resend
 *   EMAIL_PROVIDER_API_KEY=re_xxxx
 *   EMAIL_FROM=no-reply@tudominio.com
 *
 * Para activar SendGrid:
 *   EMAIL_PROVIDER=sendgrid
 *   EMAIL_PROVIDER_API_KEY=SG.xxxx
 */

export type EmailPayload = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

// ---------------------------------------------------------------------------
// Driver
// ---------------------------------------------------------------------------

async function sendEmail(payload: EmailPayload): Promise<void> {
  const from = process.env.EMAIL_FROM ?? "no-reply@culebra.local";
  const apiKey = process.env.EMAIL_PROVIDER_API_KEY;
  const provider = (process.env.EMAIL_PROVIDER ?? "").toLowerCase();

  if (!apiKey || apiKey.includes("REEMPLAZAR") || !provider) {
    // Modo desarrollo: log en consola
    console.log(`[EMAIL] To: ${payload.to} | Subject: ${payload.subject}`);
    if (process.env.NODE_ENV !== "production") {
      console.log(`[EMAIL BODY]\n${payload.text ?? payload.html}\n`);
    }
    return;
  }

  if (provider === "resend") {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to: payload.to, subject: payload.subject, html: payload.html }),
    });
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Resend error ${res.status}: ${body}`);
    }
    return;
  }

  if (provider === "sendgrid") {
    const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: { email: from },
        personalizations: [{ to: [{ email: payload.to }] }],
        subject: payload.subject,
        content: [{ type: "text/html", value: payload.html }],
      }),
    });
    if (!res.ok && res.status !== 202) {
      const body = await res.text();
      throw new Error(`SendGrid error ${res.status}: ${body}`);
    }
    return;
  }

  console.warn(`[EMAIL] Provider "${provider}" not supported. Email not sent.`);
}

// ---------------------------------------------------------------------------
// Helpers de plantillas
// ---------------------------------------------------------------------------

function baseLayout(content: string): string {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Sierra de la Culebra</title>
<style>
  body { margin:0; padding:0; background:#f7f4ee; font-family: system-ui, Arial, sans-serif; color:#1f2937; }
  .wrapper { max-width:600px; margin:40px auto; background:#fff; border-radius:24px; overflow:hidden; border:1px solid #e7e5e4; }
  .header  { background:#065f46; padding:24px 32px; }
  .header h1 { margin:0; color:#fff; font-size:18px; font-weight:600; letter-spacing:.08em; text-transform:uppercase; }
  .body    { padding:32px; }
  .footer  { padding:16px 32px; background:#f7f4ee; text-align:center; font-size:12px; color:#78716c; }
  .btn     { display:inline-block; margin-top:24px; padding:12px 24px; background:#065f46; color:#fff; border-radius:9999px; text-decoration:none; font-weight:500; font-size:14px; }
  table    { width:100%; border-collapse:collapse; margin-top:16px; }
  td       { padding:8px 0; border-bottom:1px solid #f5f5f4; font-size:14px; }
  .label   { color:#78716c; }
  .amount  { font-weight:600; text-align:right; }
  .tag     { display:inline-block; padding:4px 12px; border-radius:9999px; background:#ecfdf5; color:#065f46; font-size:12px; font-weight:600; }
</style>
</head>
<body>
<div class="wrapper">
  <div class="header"><h1>Sierra de la Culebra</h1></div>
  <div class="body">${content}</div>
  <div class="footer">Sierra de la Culebra Marketplace · Villardeciervos, Zamora<br>
  Este email ha sido generado automáticamente, no respondas a este correo.</div>
</div>
</body>
</html>`;
}

function euros(value: string | number): string {
  return `${Number(value).toFixed(2)} €`;
}

// ---------------------------------------------------------------------------
// Emails de cliente
// ---------------------------------------------------------------------------

export type OrderConfirmationData = {
  orderNumber: string;
  customerFirstName?: string | null;
  customerEmail: string;
  totalAmount: string;
  items: Array<{ productName: string; variantLabel?: string | null; quantity: number; subtotalGross: string }>;
  shippingAddress: { street?: string; city?: string; province?: string; postalCode?: string };
  orderUrl: string;
};

export async function sendOrderConfirmationEmail(data: OrderConfirmationData): Promise<void> {
  const greeting = data.customerFirstName ? `Hola, ${data.customerFirstName}` : "Hola";
  const rows = data.items
    .map(
      (item) =>
        `<tr><td>${item.productName}${item.variantLabel ? ` (${item.variantLabel})` : ""} × ${item.quantity}</td>
         <td class="amount">${euros(item.subtotalGross)}</td></tr>`,
    )
    .join("");

  const addr = data.shippingAddress;
  const addrText = [addr.street, `${addr.postalCode ?? ""} ${addr.city ?? ""}`.trim(), addr.province]
    .filter(Boolean)
    .join(", ");

  const html = baseLayout(`
    <p style="font-size:15px">${greeting},</p>
    <p>Hemos recibido tu pedido. A continuación tienes el resumen:</p>
    <p><span class="tag">Pedido ${data.orderNumber}</span></p>
    <table>
      ${rows}
      <tr><td class="label">Total</td><td class="amount" style="font-size:16px">${euros(data.totalAmount)}</td></tr>
    </table>
    ${addrText ? `<p style="margin-top:20px;font-size:14px;color:#78716c">Envío a: ${addrText}</p>` : ""}
    <p style="font-size:14px;margin-top:16px">
      Los artesanos tienen 24 horas hábiles para preparar el envío. 
      Te avisaremos en cuanto salga.
    </p>
    <a href="${data.orderUrl}" class="btn">Ver mi pedido</a>
  `);

  await sendEmail({
    to: data.customerEmail,
    subject: `Confirmación de pedido ${data.orderNumber} · Sierra de la Culebra`,
    html,
    text: `Pedido ${data.orderNumber} confirmado. Total: ${euros(data.totalAmount)}. Ver pedido: ${data.orderUrl}`,
  });
}

export type ShipmentNotificationData = {
  orderNumber: string;
  customerFirstName?: string | null;
  customerEmail: string;
  vendorName: string;
  carrier?: string | null;
  trackingNumber?: string | null;
  trackingUrl?: string | null;
  orderUrl: string;
};

export async function sendShipmentNotificationEmail(data: ShipmentNotificationData): Promise<void> {
  const greeting = data.customerFirstName ? `Hola, ${data.customerFirstName}` : "Hola";
  const tracking = data.trackingNumber
    ? `<p style="margin-top:16px;font-size:14px">
        Número de seguimiento: <strong>${data.carrier ? `${data.carrier} · ` : ""}${data.trackingNumber}</strong>
        ${data.trackingUrl ? `<br><a href="${data.trackingUrl}" style="color:#065f46">Rastrear envío</a>` : ""}
       </p>`
    : "";

  const html = baseLayout(`
    <p style="font-size:15px">${greeting},</p>
    <p>
      El artesano <strong>${data.vendorName}</strong> ha enviado tu pedido 
      <span class="tag">${data.orderNumber}</span>.
    </p>
    ${tracking}
    <a href="${data.orderUrl}" class="btn">Ver seguimiento</a>
  `);

  await sendEmail({
    to: data.customerEmail,
    subject: `Tu pedido ${data.orderNumber} está en camino · Sierra de la Culebra`,
    html,
    text: `Tu pedido ${data.orderNumber} ha salido de ${data.vendorName}.${data.trackingNumber ? ` Tracking: ${data.trackingNumber}` : ""} Ver pedido: ${data.orderUrl}`,
  });
}

// ---------------------------------------------------------------------------
// Emails de artesano
// ---------------------------------------------------------------------------

export type VendorNewOrderData = {
  orderNumber: string;
  vendorTradeName: string;
  vendorEmail: string;
  items: Array<{ productName: string; variantLabel?: string | null; quantity: number }>;
  shippingAddress: { street?: string; city?: string; province?: string; postalCode?: string };
  panelUrl: string;
  cutoffHours?: number;
};

export async function sendVendorNewOrderEmail(data: VendorNewOrderData): Promise<void> {
  const rows = data.items
    .map(
      (item) =>
        `<tr><td>${item.productName}${item.variantLabel ? ` (${item.variantLabel})` : ""}</td>
         <td class="amount">× ${item.quantity}</td></tr>`,
    )
    .join("");
  const addr = data.shippingAddress;
  const addrText = [addr.street, `${addr.postalCode ?? ""} ${addr.city ?? ""}`.trim(), addr.province]
    .filter(Boolean)
    .join(", ");
  const hours = data.cutoffHours ?? 24;

  const html = baseLayout(`
    <p style="font-size:15px">Hola, ${data.vendorTradeName},</p>
    <p>Tienes un nuevo pedido <span class="tag">${data.orderNumber}</span> que preparar.</p>
    <p style="font-size:14px;color:#b45309;font-weight:600">
      ⏱ SLA: tienes ${hours} horas hábiles para prepararlo y marcarlo listo para recogida.
    </p>
    <table>${rows}</table>
    ${addrText ? `<p style="margin-top:16px;font-size:14px;color:#78716c">Destino: ${addrText}</p>` : ""}
    <a href="${data.panelUrl}" class="btn">Ver en el panel</a>
  `);

  await sendEmail({
    to: data.vendorEmail,
    subject: `Nuevo pedido ${data.orderNumber} · Prepara en ${hours}h · Sierra de la Culebra`,
    html,
    text: `Nuevo pedido ${data.orderNumber} para preparar en ${hours}h. Panel: ${data.panelUrl}`,
  });
}
