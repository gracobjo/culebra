import Link from "next/link";
import { listVendorsForAdmin } from "@culebra/auth";
import type { VendorRecord } from "@culebra/auth";
import { requireAdmin } from "@/lib/admin";
import { AdminShell } from "@/components/admin/admin-shell";
import { formatDate } from "@/lib/format";

export const metadata = { title: "Productores | Admin" };

const statusLabels: Record<string, string> = {
  DRAFT: "Borrador",
  PENDING_REVIEW: "Pendiente",
  ACTIVE: "Activo",
  SUSPENDED: "Suspendido",
  REJECTED: "Rechazado",
};

type PageProps = { searchParams: Promise<{ estado?: string }> };

export default async function AdminVendorsPage({ searchParams }: PageProps) {
  await requireAdmin();
  const { estado } = await searchParams;
  const vendors = await listVendorsForAdmin({
    status: estado as "DRAFT" | "PENDING_REVIEW" | "ACTIVE" | "SUSPENDED" | "REJECTED" | undefined,
  });

  return (
    <AdminShell title="Productores">
      <div className="mb-4 flex flex-wrap gap-2 text-sm">
        {[
          ["", "Todos"],
          ["PENDING_REVIEW", "Pendientes"],
          ["ACTIVE", "Activos"],
          ["SUSPENDED", "Suspendidos"],
        ].map(([value, label]) => (
          <Link
            key={value || "all"}
            href={value ? `/admin/productores?estado=${value}` : "/admin/productores"}
            className="rounded-full border border-stone-300 px-3 py-1"
          >
            {label}
          </Link>
        ))}
      </div>
      <ul className="space-y-3">
        {vendors.items.map((vendor: VendorRecord) => (
          <li key={vendor.id} className="rounded-2xl border border-stone-200 bg-white p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Link href={`/admin/productores/${vendor.id}`} className="font-medium text-emerald-800">
                {vendor.tradeName}
              </Link>
              <span className="text-sm text-stone-600">
                {statusLabels[vendor.status] ?? vendor.status}
              </span>
            </div>
            <p className="mt-1 text-sm text-stone-500">
              {vendor.city ?? "—"} · {formatDate(vendor.createdAt)}
            </p>
          </li>
        ))}
      </ul>
      {vendors.items.length === 0 ? (
        <p className="text-sm text-stone-600">No hay productores en este filtro.</p>
      ) : null}
    </AdminShell>
  );
}
