/**
 * SLA Service — Control de cumplimiento logístico de VendorOrders
 *
 * Implementa la lógica de:
 *  - Cálculo del deadline de entrega según cut-off (13:00h) y días hábiles
 *  - Notificación al productor al crear/confirmar el VendorOrder
 *  - Alerta preventiva cuando quedan <4h para el deadline sin recepción en tienda
 *  - Detección de incumplimiento (BREACHED) para el panel de KPIs
 *  - Registro de recepción en trastienda (escaneo de código de barras)
 */

import { prisma } from "@culebra/db";
import { SlaStatus } from "@prisma/client";

// ---------------------------------------------------------------------------
// Constantes
// ---------------------------------------------------------------------------

/** Hora de corte (cut-off) en formato hora local España */
const CUTOFF_HOUR = 13; // 13:00h

/** Hora de cierre de la oficina para entregas del mismo día */
const CLOSE_HOUR = 19; // 19:00h

/** Margen de alerta preventiva antes del deadline (ms) */
const ALERT_THRESHOLD_MS = 4 * 60 * 60 * 1000; // 4 horas

/** Días hábiles: lunes (1) a viernes (5) */
const BUSINESS_DAYS = [1, 2, 3, 4, 5];

// ---------------------------------------------------------------------------
// Helpers de tiempo
// ---------------------------------------------------------------------------

function isBusinessDay(date: Date): boolean {
  return BUSINESS_DAYS.includes(date.getDay());
}

/** Devuelve la misma fecha pero con hora, minuto y segundo especificados (hora local) */
function setTimeLocal(date: Date, hours: number, minutes = 0, seconds = 0): Date {
  const d = new Date(date);
  d.setHours(hours, minutes, seconds, 0);
  return d;
}

/**
 * Calcula el deadline de entrega en tienda:
 *  - Si el pedido llega antes de CUTOFF_HOUR en día hábil → mismo día a CLOSE_HOUR
 *  - Si llega después de CUTOFF_HOUR o en fin de semana → siguiente día hábil a CLOSE_HOUR
 *  - Además, el SLA de preparación es máx 24h desde la notificación
 */
export function computeSlaDeadline(notifiedAt: Date): Date {
  const candidate = setTimeLocal(notifiedAt, CLOSE_HOUR);

  // Si la notificación es antes del cut-off en día hábil → mismo día
  if (
    isBusinessDay(notifiedAt) &&
    notifiedAt.getHours() < CUTOFF_HOUR
  ) {
    return candidate;
  }

  // Si no, buscar el siguiente día hábil
  const next = new Date(notifiedAt);
  do {
    next.setDate(next.getDate() + 1);
  } while (!isBusinessDay(next));

  return setTimeLocal(next, CLOSE_HOUR);
}

// ---------------------------------------------------------------------------
// Notificación al productor (stub extensible a email/WhatsApp real)
// ---------------------------------------------------------------------------

export type SlaNotification = {
  type: "NEW_ORDER" | "AT_RISK" | "BREACHED";
  vendorOrderId: string;
  orderNumber: string;
  vendorName: string;
  deadlineAt: Date;
  hoursRemaining?: number;
};

// ---------------------------------------------------------------------------
// Telegram (notificaciones en desarrollo y producción)
// ---------------------------------------------------------------------------

function buildTelegramMessage(notification: SlaNotification): string {
  const deadline = notification.deadlineAt.toLocaleString("es-ES", {
    timeZone: "Europe/Madrid",
    dateStyle: "short",
    timeStyle: "short",
  });

  switch (notification.type) {
    case "NEW_ORDER":
      return (
        `🛒 *Nuevo pedido SLA activado*\n` +
        `Artesano: ${notification.vendorName}\n` +
        `Pedido: #${notification.orderNumber}\n` +
        `⏰ Límite de entrega en tienda: *${deadline}*`
      );
    case "AT_RISK":
      return (
        `⚠️ *Alerta preventiva SLA*\n` +
        `Artesano: ${notification.vendorName}\n` +
        `Pedido: #${notification.orderNumber}\n` +
        `Quedan aprox. *${notification.hoursRemaining ?? "?"}h* para cumplir el SLA.\n` +
        `Límite: ${deadline}\n` +
        `El transportista pasa a las 14:00h. Por favor, entrega el paquete en Villardeciervos.`
      );
    case "BREACHED":
      return (
        `🔴 *SLA INCUMPLIDO*\n` +
        `Artesano: ${notification.vendorName}\n` +
        `Pedido: #${notification.orderNumber}\n` +
        `El deadline (${deadline}) fue superado sin recepción en tienda.\n` +
        `Revisar el panel de KPIs para aplicar las penalizaciones correspondientes.`
      );
  }
}

async function sendTelegramNotification(message: string): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) return; // no configurado → silencioso

  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: "Markdown",
      }),
    });
  } catch {
    // Las notificaciones Telegram son best-effort, nunca bloquean el flujo
    console.warn("[SLA] Telegram notification failed (non-critical)");
  }
}

/**
 * Envía la notificación: log estructurado + Telegram si está configurado.
 */
async function dispatchNotification(notification: SlaNotification): Promise<void> {
  console.log("[SLA]", JSON.stringify({
    ...notification,
    deadlineAt: notification.deadlineAt.toISOString(),
    timestamp: new Date().toISOString(),
  }));

  const message = buildTelegramMessage(notification);
  await sendTelegramNotification(message);
}

// ---------------------------------------------------------------------------
// Inicializar SLA al notificar al productor
// ---------------------------------------------------------------------------

/**
 * Llamar cuando se crea/confirma un VendorOrder y se notifica al productor.
 * Registra slaNotifiedAt y calcula slaDeadlineAt.
 */
export async function initVendorOrderSla(vendorOrderId: string): Promise<void> {
  const vendorOrder = await prisma.vendorOrder.findUnique({
    where: { id: vendorOrderId },
    include: { order: true, vendor: true },
  });

  if (!vendorOrder) return;
  if (vendorOrder.slaNotifiedAt) return; // ya inicializado

  const notifiedAt = new Date();
  const deadlineAt = computeSlaDeadline(notifiedAt);

  await prisma.vendorOrder.update({
    where: { id: vendorOrderId },
    data: {
      slaNotifiedAt: notifiedAt,
      slaDeadlineAt: deadlineAt,
      slaStatus: SlaStatus.NOTIFIED,
    },
  });

  await dispatchNotification({
    type: "NEW_ORDER",
    vendorOrderId,
    orderNumber: vendorOrder.order.orderNumber,
    vendorName: vendorOrder.vendor.tradeName,
    deadlineAt,
  });
}

// ---------------------------------------------------------------------------
// Registrar recepción en trastienda (escaneo de código de barras)
// ---------------------------------------------------------------------------

/**
 * Llamar desde el endpoint POST /api/vendor-orders/[id]/scan.
 * Registra slaReceivedAt y marca el SLA como FULFILLED o BREACHED según el deadline.
 */
export async function recordVendorOrderReceived(vendorOrderId: string): Promise<{
  status: SlaStatus;
  onTime: boolean;
  minutesLate: number;
}> {
  const vendorOrder = await prisma.vendorOrder.findUnique({
    where: { id: vendorOrderId },
  });

  if (!vendorOrder) throw new Error("VENDOR_ORDER_NOT_FOUND");
  if (vendorOrder.slaReceivedAt) {
    return { status: vendorOrder.slaStatus as SlaStatus, onTime: true, minutesLate: 0 };
  }

  const receivedAt = new Date();
  const deadline = vendorOrder.slaDeadlineAt ?? new Date(0);
  const onTime = receivedAt <= deadline;
  const minutesLate = onTime ? 0 : Math.round((receivedAt.getTime() - deadline.getTime()) / 60000);

  const newStatus = onTime ? SlaStatus.FULFILLED : SlaStatus.BREACHED;

  await prisma.vendorOrder.update({
    where: { id: vendorOrderId },
    data: {
      slaReceivedAt: receivedAt,
      slaStatus: newStatus,
    },
  });

  return { status: newStatus, onTime, minutesLate };
}

// ---------------------------------------------------------------------------
// Verificación periódica (llamar desde el cron)
// ---------------------------------------------------------------------------

export type SlaCheckResult = {
  atRisk: number;
  breached: number;
  alerts: SlaNotification[];
};

/**
 * Revisa todos los VendorOrders NOTIFIED o AT_RISK sin recepción en tienda.
 * - Si quedan <4h para el deadline → marca AT_RISK y dispara alerta preventiva
 * - Si el deadline ya pasó → marca BREACHED
 *
 * Llamar desde el cron diario (o añadir a release-payouts para reutilizar el slot).
 */
export async function checkSlaCompliance(): Promise<SlaCheckResult> {
  const now = new Date();
  const alertThresholdDate = new Date(now.getTime() + ALERT_THRESHOLD_MS);

  // Pedidos sin recepción y con deadline activo
  const openOrders = await prisma.vendorOrder.findMany({
    where: {
      slaStatus: { in: [SlaStatus.NOTIFIED, SlaStatus.AT_RISK] },
      slaReceivedAt: null,
      slaDeadlineAt: { not: null },
    },
    include: { order: true, vendor: true },
  });

  const alerts: SlaNotification[] = [];
  let atRisk = 0;
  let breached = 0;

  for (const vo of openOrders) {
    const deadline = vo.slaDeadlineAt!;

    if (now > deadline) {
      // Deadline superado → BREACHED
      await prisma.vendorOrder.update({
        where: { id: vo.id },
        data: { slaStatus: SlaStatus.BREACHED },
      });
      breached++;
      const alert: SlaNotification = {
        type: "BREACHED",
        vendorOrderId: vo.id,
        orderNumber: vo.order.orderNumber,
        vendorName: vo.vendor.tradeName,
        deadlineAt: deadline,
      };
      alerts.push(alert);
      await dispatchNotification(alert);

    } else if (deadline <= alertThresholdDate && vo.slaStatus !== SlaStatus.AT_RISK) {
      // Quedan <4h → AT_RISK
      const hoursRemaining = Math.round((deadline.getTime() - now.getTime()) / (1000 * 60 * 60));
      await prisma.vendorOrder.update({
        where: { id: vo.id },
        data: { slaStatus: SlaStatus.AT_RISK },
      });
      atRisk++;
      const alert: SlaNotification = {
        type: "AT_RISK",
        vendorOrderId: vo.id,
        orderNumber: vo.order.orderNumber,
        vendorName: vo.vendor.tradeName,
        deadlineAt: deadline,
        hoursRemaining,
      };
      alerts.push(alert);
      await dispatchNotification(alert);
    }
  }

  return { atRisk, breached, alerts };
}

// ---------------------------------------------------------------------------
// Informe de SLA para el panel de administración
// ---------------------------------------------------------------------------

export type VendorSlaReport = {
  vendorId: string;
  tradeName: string;
  total: number;
  fulfilled: number;
  breached: number;
  atRisk: number;
  pending: number;
  fulfillmentRate: number; // 0–100
  avgMinutesLate: number;
};

export async function getVendorSlaReports(): Promise<VendorSlaReport[]> {
  const vendorOrders = await prisma.vendorOrder.findMany({
    where: { slaStatus: { not: SlaStatus.PENDING } },
    include: { vendor: { select: { id: true, tradeName: true } } },
  });

  const map = new Map<string, VendorSlaReport>();

  for (const vo of vendorOrders) {
    const key = vo.vendorId;
    if (!map.has(key)) {
      map.set(key, {
        vendorId: vo.vendorId,
        tradeName: vo.vendor.tradeName,
        total: 0,
        fulfilled: 0,
        breached: 0,
        atRisk: 0,
        pending: 0,
        fulfillmentRate: 100,
        avgMinutesLate: 0,
      });
    }
    const row = map.get(key)!;
    row.total++;

    if (vo.slaStatus === SlaStatus.FULFILLED) row.fulfilled++;
    else if (vo.slaStatus === SlaStatus.BREACHED) {
      row.breached++;
      if (vo.slaReceivedAt && vo.slaDeadlineAt) {
        const late = Math.max(0, (vo.slaReceivedAt.getTime() - vo.slaDeadlineAt.getTime()) / 60000);
        row.avgMinutesLate = (row.avgMinutesLate * (row.breached - 1) + late) / row.breached;
      }
    } else if (vo.slaStatus === SlaStatus.AT_RISK) row.atRisk++;
    else row.pending++;
  }

  for (const row of map.values()) {
    row.fulfillmentRate = row.total > 0 ? Math.round((row.fulfilled / row.total) * 100) : 100;
    row.avgMinutesLate = Math.round(row.avgMinutesLate);
  }

  return Array.from(map.values()).sort((a, b) => a.tradeName.localeCompare(b.tradeName));
}
