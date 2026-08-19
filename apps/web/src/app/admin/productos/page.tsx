import Link from "next/link";
import { listProductsForAdmin } from "@culebra/auth";
import type { ProductRecord } from "@culebra/auth";
import { requireAdmin } from "@/lib/admin";
import { AdminShell } from "@/components/admin/admin-shell";
import { formatPrice, productStatusLabels } from "@/lib/format";
import { updateProductStatusAction } from "@/app/admin/actions";

export const metadata = { title: "Productos | Admin" };

type PageProps = { searchParams: Promise<{ estado?: string }> };

export default async function AdminProductsPage({ searchParams }: PageProps) {
  await requireAdmin();
  const { estado } = await searchParams;
  const products = await listProductsForAdmin({
    status: estado as
      | "DRAFT"
      | "PENDING_REVIEW"
      | "PUBLISHED"
      | "REJECTED"
      | "DISABLED"
      | undefined,
  });

  return (
    <AdminShell title="Productos">
      <ul className="space-y-3">
        {products.items.map((product: ProductRecord) => (
          <li key={product.id} className="rounded-2xl border border-stone-200 bg-white p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-medium">{product.name}</p>
                <p className="text-sm text-stone-500">
                  {product.vendor?.tradeName ?? product.vendorId} ·{" "}
                  {productStatusLabels[product.status] ?? product.status} ·{" "}
                  {formatPrice(product.basePrice)}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link
                  href={`/admin/productos/${product.id}`}
                  className="rounded-full border border-stone-300 px-3 py-2 text-sm hover:bg-stone-50"
                >
                  Editar
                </Link>
                <form action={updateProductStatusAction.bind(null, product.id)}>
                  <input type="hidden" name="status" value="PUBLISHED" />
                  <button
                    type="submit"
                    className="rounded-full bg-emerald-800 px-3 py-2 text-sm text-white"
                  >
                    Publicar
                  </button>
                </form>
                <form action={updateProductStatusAction.bind(null, product.id)}>
                  <input type="hidden" name="status" value="REJECTED" />
                  <input type="hidden" name="rejectionReason" value="Revisar ficha y origen" />
                  <button
                    type="submit"
                    className="rounded-full border border-stone-300 px-3 py-2 text-sm"
                  >
                    Rechazar
                  </button>
                </form>
              </div>
            </div>
          </li>
        ))}
      </ul>
      {products.items.length === 0 ? (
        <p className="text-sm text-stone-600">No hay productos.</p>
      ) : null}
    </AdminShell>
  );
}
