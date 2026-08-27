import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getVendorProduct, listCategories, listProductChangeDocuments } from "@culebra/auth";
import { ProductForm } from "@/components/catalog/product-form";
import { DownloadOrderDocumentButton } from "@/components/orders/download-order-document-button";
import { formatDate, productStatusLabels } from "@/lib/format";
import { PageShell } from "@/components/layout/page-shell";

type EditProductPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditProductPage({ params }: EditProductPageProps) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/panel/proveedor/productos");
  }
  if (!session?.user?.roles?.includes("VENDOR")) {
    redirect("/quiero-vender");
  }

  const { id } = await params;
  const categories = await listCategories();

  let product;
  try {
    product = await getVendorProduct(session.user.id, id);
  } catch {
    redirect("/panel/proveedor/productos");
  }

  let changeDocuments: Awaited<ReturnType<typeof listProductChangeDocuments>> = [];
  try {
    changeDocuments = await listProductChangeDocuments(session.user.id, id);
  } catch {
    // El historial es opcional; no bloquea la edicion del producto.
  }

  return (
    <PageShell width="md">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
        <Link href="/panel/proveedor/productos" className="text-emerald-800">
          ← Mis productos
        </Link>
        {product.status === "PUBLISHED" ? (
          <Link
            href={`/productos/${product.slug}`}
            className="text-stone-600 underline-offset-2 hover:underline"
          >
            Ver ficha pública
          </Link>
        ) : null}
      </div>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-emerald-800">Editar producto</p>
          <h1 className="mt-1 break-words text-2xl font-semibold sm:text-3xl">{product.name}</h1>
        </div>
        <span className="rounded-full bg-stone-100 px-4 py-2 text-sm">
          {productStatusLabels[product.status] ?? product.status}
        </span>
      </div>
      <p className="mt-4 text-sm text-stone-600">
        La foto está al principio del formulario.{" "}
        <a href="#foto" className="font-medium text-emerald-800 underline">
          Ir a la foto
        </a>
      </p>
      {product.rejectionReason ? (
        <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">
          Motivo de rechazo: {product.rejectionReason}
        </p>
      ) : null}
      <div className="mt-8 rounded-3xl border border-stone-200 bg-white p-5 shadow-sm sm:p-8">
        <ProductForm categories={categories} product={product} />
      </div>

      {changeDocuments.length > 0 ? (
        <section className="mt-8 rounded-3xl border border-stone-200 bg-white p-5 sm:p-8">
          <h2 className="text-lg font-semibold">Historial de cambios</h2>
          <p className="mt-2 text-sm text-stone-600">
            Registros conservados minimo 3 meses. Puedes descargar un PDF de cada modificacion.
          </p>
          <ul className="mt-4 space-y-2 text-sm">
            {changeDocuments.map((doc) => (
              <li
                key={doc.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-stone-200 bg-stone-50 px-4 py-3"
              >
                <span>
                  {formatDate(doc.createdAt)} ·{" "}
                  {((doc.snapshot.changedFields as string[]) ?? []).join(", ") || "Cambios"}
                </span>
                <DownloadOrderDocumentButton
                  href={`/api/stored-documents/${doc.id}/document`}
                  label="PDF del cambio"
                  className="inline-flex items-center text-emerald-800 underline"
                />
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </PageShell>
  );
}
