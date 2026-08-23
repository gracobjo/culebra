import { prisma } from "@culebra/db";
import type { OrderStatus, VendorOrderStatus } from "@prisma/client";

/** Pedidos que cuentan como GMV / actividad comercial. */
const PAID_ORDER_STATUSES: OrderStatus[] = [
  "PAID",
  "PARTIALLY_SHIPPED",
  "SHIPPED",
  "DELIVERED",
];

const CLOSED_VENDOR_STATUSES: VendorOrderStatus[] = [
  "CONFIRMED",
  "IN_PREPARATION",
  "SHIPPED",
  "DELIVERED",
];

export type RiskAlertLevel = "ok" | "warning" | "critical";

export type VendorGmvShare = {
  vendorId: string;
  tradeName: string;
  gmvEur: number;
  sharePct: number;
};

export type PlatformRiskMetrics = {
  /** Ventana usada para GMV / incidencias (mes natural en curso). */
  monthFrom: Date;
  monthTo: Date;
  /** Pedidos de plataforma en el mes (pagados). */
  ordersPaidMonth: number;
  /** Pedidos con ≥2 productores distintos. */
  multiproducerOrdersMonth: number;
  multiproducerPct: number;
  /** Subpedidos con incidencia (SLA breached, cancelados, o prep. >24h). */
  vendorOrdersMonth: number;
  incidentVendorOrdersMonth: number;
  incidentRatePct: number;
  slaBreachedMonth: number;
  latePrepMonth: number;
  cancelledMonth: number;
  /** Productores ACTIVE. */
  activeVendorsTotal: number;
  /** Con al menos una venta en 90 días. */
  activeVendorsWithSales90d: number;
  /** GMV merchandise (suma subtotales de VendorOrder) mes. */
  gmvMonthEur: number;
  vendorShares: VendorGmvShare[];
  top3SharePct: number;
  maxVendorSharePct: number;
  maxVendorName: string | null;
  alerts: {
    id: string;
    label: string;
    level: RiskAlertLevel;
    valueLabel: string;
    thresholdLabel: string;
  }[];
};

function startOfMonth(d = new Date()): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0);
}

function endOfMonth(d = new Date()): Date {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
}

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(0, 0, 0, 0);
  return d;
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

function vendorOrderIsIncident(vo: {
  status: VendorOrderStatus;
  createdAt: Date;
  updatedAt: Date;
  slaStatus: string;
  slaReceivedAt: Date | null;
  slaDeadlineAt: Date | null;
}): { incident: boolean; reason: "breached" | "cancelled" | "late" | null } {
  if (vo.status === "CANCELLED" || vo.status === "RETURNED") {
    return { incident: true, reason: "cancelled" };
  }
  if (vo.slaStatus === "BREACHED") {
    return { incident: true, reason: "breached" };
  }
  if (vo.slaReceivedAt && vo.slaDeadlineAt && vo.slaReceivedAt > vo.slaDeadlineAt) {
    return { incident: true, reason: "late" };
  }
  if (vo.slaStatus === "FULFILLED") {
    return { incident: false, reason: null };
  }
  if (CLOSED_VENDOR_STATUSES.includes(vo.status)) {
    const ref = vo.slaReceivedAt ?? vo.updatedAt;
    const hours = (ref.getTime() - vo.createdAt.getTime()) / (1000 * 60 * 60);
    if (hours > 24) return { incident: true, reason: "late" };
    return { incident: false, reason: null };
  }
  if (vo.status === "PENDING" || vo.status === "CONFIRMED" || vo.status === "IN_PREPARATION") {
    const hours = (Date.now() - vo.createdAt.getTime()) / (1000 * 60 * 60);
    if (hours > 24) return { incident: true, reason: "late" };
  }
  return { incident: false, reason: null };
}

export async function computePlatformRiskMetrics(
  now = new Date()
): Promise<PlatformRiskMetrics> {
  const monthFrom = startOfMonth(now);
  const monthTo = endOfMonth(now);
  const from90 = daysAgo(90);

  const [activeVendorsTotal, ordersMonth, vendorOrdersMonth, sales90d] = await Promise.all([
    prisma.vendor.count({ where: { status: "ACTIVE", deletedAt: null } }),
    prisma.order.findMany({
      where: {
        createdAt: { gte: monthFrom, lte: monthTo },
        status: { in: PAID_ORDER_STATUSES },
      },
      select: {
        id: true,
        vendorOrders: { select: { vendorId: true } },
      },
    }),
    prisma.vendorOrder.findMany({
      where: {
        createdAt: { gte: monthFrom, lte: monthTo },
        order: { status: { in: [...PAID_ORDER_STATUSES, "CANCELLED", "REFUNDED"] } },
      },
      select: {
        id: true,
        vendorId: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        slaStatus: true,
        slaReceivedAt: true,
        slaDeadlineAt: true,
        subtotalGross: true,
        vendor: { select: { tradeName: true } },
        order: { select: { status: true } },
      },
    }),
    prisma.vendorOrder.findMany({
      where: {
        createdAt: { gte: from90 },
        status: { notIn: ["CANCELLED", "RETURNED"] },
        order: { status: { in: PAID_ORDER_STATUSES } },
      },
      select: { vendorId: true },
      distinct: ["vendorId"],
    }),
  ]);

  const multiproducerOrdersMonth = ordersMonth.filter(
    (o) => new Set(o.vendorOrders.map((v) => v.vendorId)).size >= 2
  ).length;
  const ordersPaidMonth = ordersMonth.length;
  const multiproducerPct =
    ordersPaidMonth > 0 ? round1((multiproducerOrdersMonth / ordersPaidMonth) * 100) : 0;

  let incidentVendorOrdersMonth = 0;
  let slaBreachedMonth = 0;
  let latePrepMonth = 0;
  let cancelledMonth = 0;

  const gmvByVendor = new Map<string, { tradeName: string; gmv: number }>();

  for (const vo of vendorOrdersMonth) {
    const paidLike = PAID_ORDER_STATUSES.includes(vo.order.status);
    if (paidLike) {
      const gmv = Number(vo.subtotalGross);
      const prev = gmvByVendor.get(vo.vendorId);
      if (prev) prev.gmv += gmv;
      else gmvByVendor.set(vo.vendorId, { tradeName: vo.vendor.tradeName, gmv });
    }

    const { incident, reason } = vendorOrderIsIncident(vo);
    if (incident) {
      incidentVendorOrdersMonth += 1;
      if (reason === "breached") slaBreachedMonth += 1;
      else if (reason === "cancelled") cancelledMonth += 1;
      else if (reason === "late") latePrepMonth += 1;
    }
  }

  const vendorOrdersCount = vendorOrdersMonth.length;
  const incidentRatePct =
    vendorOrdersCount > 0
      ? round1((incidentVendorOrdersMonth / vendorOrdersCount) * 100)
      : 0;

  const gmvMonthEur = [...gmvByVendor.values()].reduce((a, b) => a + b.gmv, 0);
  const vendorShares: VendorGmvShare[] = [...gmvByVendor.entries()]
    .map(([vendorId, v]) => ({
      vendorId,
      tradeName: v.tradeName,
      gmvEur: round1(v.gmv),
      sharePct: gmvMonthEur > 0 ? round1((v.gmv / gmvMonthEur) * 100) : 0,
    }))
    .sort((a, b) => b.gmvEur - a.gmvEur);

  const top3SharePct = round1(
    vendorShares.slice(0, 3).reduce((a, b) => a + b.sharePct, 0)
  );
  const maxVendor = vendorShares[0] ?? null;
  const maxVendorSharePct = maxVendor?.sharePct ?? 0;

  const alerts: PlatformRiskMetrics["alerts"] = [
    {
      id: "incident_rate",
      label: "% subpedidos con incidencia (mes)",
      level:
        incidentRatePct > 15 ? "critical" : incidentRatePct > 10 ? "warning" : "ok",
      valueLabel: `${incidentRatePct} %`,
      thresholdLabel: "Alerta > 10 % · Crítico > 15 %",
    },
    {
      id: "top3_gmv",
      label: "Concentración GMV top 3 (mes)",
      level: top3SharePct > 70 ? "critical" : top3SharePct > 65 ? "warning" : "ok",
      valueLabel: `${top3SharePct} %`,
      thresholdLabel: "Alerta > 65 % · Crítico > 70 %",
    },
    {
      id: "max_vendor_gmv",
      label: "Máx. GMV un solo productor (mes)",
      level:
        maxVendorSharePct > 30 ? "critical" : maxVendorSharePct > 25 ? "warning" : "ok",
      valueLabel: maxVendor
        ? `${maxVendorSharePct} % (${maxVendor.tradeName})`
        : "—",
      thresholdLabel: "Objetivo ≤ 25–30 % por productor",
    },
    {
      id: "active_vendors",
      label: "Productores activos con venta (90 d)",
      level:
        sales90d.length < 3
          ? "critical"
          : sales90d.length < 5
            ? "warning"
            : "ok",
      valueLabel: `${sales90d.length} / ${activeVendorsTotal} dados de alta`,
      thresholdLabel: "Piloto ≥ 5 · Meta 18 m: 12–15",
    },
  ];

  return {
    monthFrom,
    monthTo,
    ordersPaidMonth,
    multiproducerOrdersMonth,
    multiproducerPct,
    vendorOrdersMonth: vendorOrdersCount,
    incidentVendorOrdersMonth,
    incidentRatePct,
    slaBreachedMonth,
    latePrepMonth,
    cancelledMonth,
    activeVendorsTotal,
    activeVendorsWithSales90d: sales90d.length,
    gmvMonthEur: round1(gmvMonthEur),
    vendorShares,
    top3SharePct,
    maxVendorSharePct,
    maxVendorName: maxVendor?.tradeName ?? null,
    alerts,
  };
}

/** % preparación a tiempo usando campos SLA cuando existen. */
export function vendorOrderOnTime(vo: {
  status: VendorOrderStatus;
  createdAt: Date;
  updatedAt: Date;
  slaStatus: string;
  slaReceivedAt: Date | null;
  slaDeadlineAt: Date | null;
}): boolean {
  if (vo.status === "CANCELLED" || vo.status === "RETURNED") return true;
  if (vo.slaStatus === "BREACHED") return false;
  if (vo.slaStatus === "FULFILLED") return true;
  if (vo.slaReceivedAt && vo.slaDeadlineAt) {
    return vo.slaReceivedAt.getTime() <= vo.slaDeadlineAt.getTime();
  }
  if (vo.status === "PENDING") {
    const hours = (Date.now() - vo.createdAt.getTime()) / (1000 * 60 * 60);
    return hours <= 24;
  }
  const hours = (vo.updatedAt.getTime() - vo.createdAt.getTime()) / (1000 * 60 * 60);
  return hours <= 24;
}
