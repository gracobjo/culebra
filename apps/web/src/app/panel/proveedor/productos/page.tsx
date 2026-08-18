import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { listVendorProducts } from "@culebra/auth";
import { formatPrice, productStatusLabels } from "@/lib/format";

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
    <main className="mx-auto min-h-screen max-w-5xl px-6 py-16">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-emerald-800">
            Panel productor
          </p>
          <h1 className="mt-2 text-3xl font-semibold">Productos</h1>
        </div>
        <Link
          href="/panel/proveedor/productos/nuevo"
          className="rounded-full bg-emerald-800 px-5 py-3 text-sm font-medium text-white"
        >
          Nuevo producto
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="mt-10 rounded-3xl border border-dashed border-stone-300 p-10 text-center text-stone-600">
          Todavia no has creado productos.
        </div>
      ) : (
        <div className="mt-8 overflow-hidden rounded-3xl border border-stone-200 bg-white">
          <table className="w-full text-left text-sm">
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
      )}

      <Link href="/panel/proveedor" className="mt-8 inline-block text-sm text-emerald-800">
        Volver al perfil
      </Link>
    </main>
  );
}
