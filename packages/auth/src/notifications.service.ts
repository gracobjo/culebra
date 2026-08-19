/**
 * Notifications Service — Notificaciones Telegram centralizadas
 *
 * Todas las notificaciones son best-effort: nunca bloquean el flujo principal.
 * Silenciosas si TELEGRAM_BOT_TOKEN o TELEGRAM_CHAT_ID no están configurados.
 */

async function sendTelegram(message: string): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;

  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text: message, parse_mode: "Markdown" }),
    });
  } catch {
    console.warn("[Telegram] notification failed (non-critical)");
  }
}

function nowES(): string {
  return new Date().toLocaleString("es-ES", {
    timeZone: "Europe/Madrid",
    dateStyle: "short",
    timeStyle: "short",
  });
}

// ---------------------------------------------------------------------------
// Login / Sesión
// ---------------------------------------------------------------------------

export type LoginNotificationParams = {
  email: string;
  role: string;
  ipAddress?: string;
  userAgent?: string;
  success: boolean;
};

export function notifyLogin(params: LoginNotificationParams): void {
  if (!params.success) {
    // Intento fallido — útil para detectar ataques
    sendTelegram(
      `⚠️ *Intento de login fallido*\n` +
      `Email: \`${params.email}\`\n` +
      `IP: ${params.ipAddress ?? "desconocida"}\n` +
      `🕐 ${nowES()}`
    ).catch(() => {});
    return;
  }

  const roleEmoji: Record<string, string> = {
    ADMIN: "🛠️",
    VENDOR: "🏭",
    CONSUMER: "👤",
  };
  const emoji = roleEmoji[params.role] ?? "👤";

  sendTelegram(
    `${emoji} *Nueva sesión iniciada*\n` +
    `Email: \`${params.email}\`\n` +
    `Rol: ${params.role}\n` +
    `IP: ${params.ipAddress ?? "desconocida"}\n` +
    `🕐 ${nowES()}`
  ).catch(() => {});
}

// ---------------------------------------------------------------------------
// Checkout / Compra completada
// ---------------------------------------------------------------------------

export type CheckoutNotificationParams = {
  orderNumber: string;
  customerEmail: string;
  customerName: string;
  totalAmount: string;
  vendorCount: number;
  itemCount: number;
};

export function notifyCheckout(params: CheckoutNotificationParams): void {
  sendTelegram(
    `🛍️ *Nueva compra realizada*\n` +
    `Pedido: \`${params.orderNumber}\`\n` +
    `Cliente: ${params.customerName} — \`${params.customerEmail}\`\n` +
    `Importe: *${params.totalAmount} €*\n` +
    `Artesanos implicados: ${params.vendorCount}\n` +
    `Productos: ${params.itemCount}\n` +
    `🕐 ${nowES()}`
  ).catch(() => {});
}

// ---------------------------------------------------------------------------
// Pago confirmado (Stripe webhook)
// ---------------------------------------------------------------------------

export type PaymentNotificationParams = {
  orderNumber: string;
  customerEmail: string;
  amount: string;
};

export function notifyPaymentConfirmed(params: PaymentNotificationParams): void {
  sendTelegram(
    `💳 *Pago confirmado por Stripe*\n` +
    `Pedido: \`${params.orderNumber}\`\n` +
    `Cliente: \`${params.customerEmail}\`\n` +
    `Importe cobrado: *${params.amount} €*\n` +
    `⏳ Payout al artesano retenido 14 días\n` +
    `🕐 ${nowES()}`
  ).catch(() => {});
}
