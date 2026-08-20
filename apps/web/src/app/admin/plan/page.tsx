import { requireAdmin } from "@/lib/admin";
import { AdminShell } from "@/components/admin/admin-shell";
import { prisma } from "@culebra/db";
import { OrderStatus, VendorStatus } from "@culebra/domain";
import { COMMISSION_RATE } from "@/lib/financial-plan";
import { PlanDashboard, type LivePlanStats } from "./plan-dashboard";

export const metadata = { title: "Plan financiero | Admin" };

const PAID_STATUSES: OrderStatus[] = [
  OrderStatus.PAID,
  OrderStatus.PARTIALLY_SHIPPED,
  OrderStatus.SHIPPED,
  OrderStatus.DELIVERED,
];

async function getLivePlanStats(): Promise<LivePlanStats> {
  const year = new Date().getFullYear();
  const yearStart = new Date(year, 0, 1);

  const [orders, vendorsActive] = await Promise.all([
    prisma.order.findMany({
      where: {
        status: { in: PAID_STATUSES },
        createdAt: { gte: yearStart },
      },
      select: {
        totalAmount: true,
        shippingAmount: true,
      },
    }),
    prisma.vendor.count({
      where: { deletedAt: null, status: VendorStatus.ACTIVE },
    }),
  ]);

  // GMV ≈ mercancía (total − portes; los descuentos ya van en totalAmount según checkout)
  let gmvPaid = 0;
  for (const o of orders) {
    const total = Number(o.totalAmount);
    const shipping = Number(o.shippingAmount ?? 0);
    gmvPaid += Math.max(0, total - shipping);
  }

  const ordersPaid = orders.length;
  const avgTicket = ordersPaid > 0 ? gmvPaid / ordersPaid : 0;

  return {
    gmvPaid,
    ordersPaid,
    avgTicket,
    estimatedCommission: gmvPaid * COMMISSION_RATE,
    vendorsActive,
    year,
  };
}

export default async function AdminPlanPage() {
  await requireAdmin();
  const live = await getLivePlanStats();

  return (
    <AdminShell title="Plan financiero">
      <PlanDashboard live={live} />
    </AdminShell>
  );
}
