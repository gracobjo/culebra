import { listPayoutsForAdmin } from "@culebra/auth";
import type { PayoutRecord } from "@culebra/auth";
import { requireAdmin } from "@/lib/admin";
import { AdminShell } from "@/components/admin/admin-shell";
import { formatDate, formatPrice } from "@/lib/format";

export const metadata = { title: "Liquidaciones | Admin" };

const statusLabels: Record<string, string> = {
  PENDING: "Pendiente",
  PROCESSING: "En proceso",
  PAID: "Pagada",
  FAILED: "Fallida",
  CANCELLED: "Cancelada",
};

export default async function AdminPayoutsPage() {
  await requireAdmin();
  const payouts = await listPayoutsForAdmin();

  return (
    <AdminShell title="Liquidaciones">
      <ul className="space-y-3">
        {payouts.items.map((payout: PayoutRecord) => (
          <li key={payout.id} className="rounded-2xl border border-stone-200 bg-white p-4 text-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-medium">{payout.orderNumber}</span>
              <span>{statusLabels[payout.status] ?? payout.status}</span>
            </div>
            <p className="mt-2 text-stone-600">
              Bruto {formatPrice(payout.amountGross)} · Comision{" "}
              {formatPrice(payout.commissionMarketplace)} · Neto{" "}
              {formatPrice(payout.amountNetToVendor)}
            </p>
            <p className="mt-1 text-xs text-stone-500">{formatDate(payout.createdAt)}</p>
          </li>
        ))}
      </ul>
      {payouts.items.length === 0 ? (
        <p className="text-sm text-stone-600">No hay liquidaciones.</p>
      ) : null}
    </AdminShell>
  );
}
