import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { listVendorProducts } from "@culebra/auth";
import { formatPrice, productStatusLabels } from "@/lib/format";
import { PageShell } from "@/components/layout/page-shell";

export default async function VendorProductsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/panel/proveedor/productos");
  }

  let products = [];
  try {
    products = await listVendorProducts(session.user.id);
  } catch {
    redirect("/quiero-vender");
  }

  return (
    <PageShell width="xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-emerald-800 sm:text-sm">
            Panel productor
          </p>
          <h1 className="mt-2 text-2xl font-semibold sm:text-3xl">Productos</h1>
        </div>
        <Link
          href="/panel/proveedor/productos/nuevo"
          className="inline-flex min-h-11 items-center justify-center rounded-full bg-emerald-800 px-5 py-3 text-center text-sm font-medium text-white"
        >
          Nuevo producto
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="mt-10 rounded-3xl border border-dashed border-stone-300 p-6 text-center text-stone-600 sm:p-10">
          Todavia no has creado productos.
        </div>
      ) : (
        <>
          <ul className="mt-8 space-y-3 md:hidden">
            {products.map((product) => (
              <li
                key={product.id}
                className="rounded-3xl border border-stone-200 bg-white p-4"
              >
                <Link
                  href={`/panel/proveedor/productos/${product.id}`}
                  className="font-medium text-emerald-900"
                >
                  {product.name}
                </Link>
                <p className="mt-2 text-sm text-stone-600">
                  {formatPrice(product.basePrice)} · {product.stock} uds.
                </p>
                <p className="mt-1 text-sm text-stone-500">
                  {productStatusLabels[product.status] ?? product.status}
                </p>
              </li>
            ))}
          </ul>

          <div className="mt-8 hidden overflow-x-auto rounded-3xl border border-stone-200 bg-white md:block">
            <table className="w-full min-w-[32rem] text-left text-sm">
              <thead className="bg-stone-50 text-stone-500">
                <tr>
                  <th className="px-4 py-3">Producto</th>
                  <th className="px-4 py-3">Precio</th>
                  <th className="px-4 py-3">Stock</th>
                  <th className="px-4 py-3">Estado</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-t border-stone-100">
                    <td className="px-4 py-3">
                      <Link
                        href={`/panel/proveedor/productos/${product.id}`}
                        className="font-medium text-emerald-900"
                      >
                        {product.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3">{formatPrice(product.basePrice)}</td>
                    <td className="px-4 py-3">{product.stock}</td>
                    <td className="px-4 py-3">
                      {productStatusLabels[product.status] ?? product.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <Link href="/panel/proveedor" className="mt-8 inline-block text-sm text-emerald-800">
        Volver al perfil
      </Link>
    </PageShell>
  );
}
