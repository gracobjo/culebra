import Link from "next/link";
import Image from "next/image";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { listVendorProducts } from "@culebra/auth";
import { formatPrice, productStatusLabels } from "@/lib/format";
import { getProductImage } from "@/components/catalog/product-card";
import { PageShell } from "@/components/layout/page-shell";

export default async function VendorProductsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/panel/proveedor/productos");
  }
  if (!session?.user?.roles?.includes("VENDOR")) {
    redirect("/quiero-vender");
  }

  let products = [];
  try {
    products = await listVendorProducts(session.user.id);
  } catch {
    redirect("/quiero-vender");
  }

  const missingPhotoCount = products.filter((p) => !p.images[0]?.url).length;

  return (
    <PageShell width="xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-emerald-800 sm:text-sm">
            Panel productor
          </p>
          <h1 className="mt-2 text-2xl font-semibold sm:text-3xl">Mis productos</h1>
          <p className="mt-2 max-w-xl text-sm text-stone-600">
            Edita ficha, precio, stock y foto. Los cambios de foto se guardan en la pantalla de
            edición.
          </p>
        </div>
        <Link
          href="/panel/proveedor/productos/nuevo"
          className="inline-flex min-h-11 items-center justify-center rounded-full bg-emerald-800 px-5 py-3 text-center text-sm font-medium text-white"
        >
          Nuevo producto
        </Link>
      </div>

      {missingPhotoCount > 0 ? (
        <p className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          {missingPhotoCount === 1
            ? "1 producto sin foto propia."
            : `${missingPhotoCount} productos sin foto propia.`}{" "}
          Usa «Añadir foto» en cada ficha para mejorar la tienda.
        </p>
      ) : null}

      {products.length === 0 ? (
        <div className="mt-10 rounded-3xl border border-dashed border-stone-300 p-6 text-center text-stone-600 sm:p-10">
          <p>Todavía no has creado productos.</p>
          <Link
            href="/panel/proveedor/productos/nuevo"
            className="mt-4 inline-flex min-h-11 items-center justify-center rounded-full bg-emerald-800 px-5 py-3 text-sm font-medium text-white"
          >
            Crear el primero
          </Link>
        </div>
      ) : (
        <>
          <ul className="mt-8 space-y-3 md:hidden">
            {products.map((product) => {
              const { src, isPlaceholder } = getProductImage(product);
              const editHref = `/panel/proveedor/productos/${product.id}`;
              return (
                <li
                  key={product.id}
                  className="flex gap-3 rounded-3xl border border-stone-200 bg-white p-3"
                >
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-stone-100">
                    <Image
                      src={src}
                      alt=""
                      fill
                      sizes="80px"
                      unoptimized={src.startsWith("/uploads/")}
                      className={`object-cover ${isPlaceholder ? "opacity-70" : ""}`}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link href={editHref} className="font-medium text-emerald-900">
                      {product.name}
                    </Link>
                    <p className="mt-1 text-sm text-stone-600">
                      {formatPrice(product.basePrice)} · {product.stock} uds.
                    </p>
                    <p className="mt-0.5 text-xs text-stone-500">
                      {productStatusLabels[product.status] ?? product.status}
                      {isPlaceholder ? " · Sin foto" : ""}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Link
                        href={editHref}
                        className="inline-flex min-h-10 items-center justify-center rounded-full bg-emerald-800 px-4 py-2 text-sm font-medium text-white"
                      >
                        Editar
                      </Link>
                      <Link
                        href={`${editHref}#foto`}
                        className="inline-flex min-h-10 items-center justify-center rounded-full border border-emerald-800 px-4 py-2 text-sm font-medium text-emerald-900"
                      >
                        {isPlaceholder ? "Añadir foto" : "Cambiar foto"}
                      </Link>
                      {product.status === "PUBLISHED" ? (
                        <Link
                          href={`/productos/${product.slug}`}
                          className="inline-flex min-h-10 items-center justify-center px-2 text-sm text-stone-600 underline"
                        >
                          Ver en tienda
                        </Link>
                      ) : null}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="mt-8 hidden overflow-x-auto rounded-3xl border border-stone-200 bg-white md:block">
            <table className="w-full min-w-[44rem] text-left text-sm">
              <thead className="bg-stone-50 text-stone-500">
                <tr>
                  <th className="px-4 py-3">Producto</th>
                  <th className="px-4 py-3">Precio</th>
                  <th className="px-4 py-3">Stock</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => {
                  const { src, isPlaceholder } = getProductImage(product);
                  const editHref = `/panel/proveedor/productos/${product.id}`;
                  return (
                    <tr key={product.id} className="border-t border-stone-100">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-stone-100">
                            <Image
                              src={src}
                              alt=""
                              fill
                              sizes="48px"
                              unoptimized={src.startsWith("/uploads/")}
                              className={`object-cover ${isPlaceholder ? "opacity-70" : ""}`}
                            />
                          </div>
                          <div>
                            <Link
                              href={editHref}
                              className="font-medium text-emerald-900 hover:underline"
                            >
                              {product.name}
                            </Link>
                            {isPlaceholder ? (
                              <p className="text-xs text-amber-700">Sin foto propia</p>
                            ) : null}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">{formatPrice(product.basePrice)}</td>
                      <td className="px-4 py-3">{product.stock}</td>
                      <td className="px-4 py-3">
                        {productStatusLabels[product.status] ?? product.status}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                          <Link
                            href={editHref}
                            className="inline-flex min-h-10 items-center justify-center rounded-full bg-emerald-800 px-4 py-2 text-sm font-medium text-white"
                          >
                            Editar
                          </Link>
                          <Link
                            href={`${editHref}#foto`}
                            className="inline-flex min-h-10 items-center justify-center rounded-full border border-stone-300 px-4 py-2 text-sm font-medium text-stone-800 hover:bg-stone-50"
                          >
                            {isPlaceholder ? "Añadir foto" : "Foto"}
                          </Link>
                          {product.status === "PUBLISHED" ? (
                            <Link
                              href={`/productos/${product.slug}`}
                              className="inline-flex min-h-10 items-center px-2 text-sm text-stone-600 underline"
                            >
                              Ver
                            </Link>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  );
                })}
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
