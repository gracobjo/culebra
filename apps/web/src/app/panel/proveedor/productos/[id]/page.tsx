import Link from "next/link";
import { auth } from "@/auth";
import { notFound, redirect } from "next/navigation";
import { getVendorProduct, listCategories } from "@culebra/auth";
import { ProductForm } from "@/components/catalog/product-form";
import { productStatusLabels } from "@/lib/format";
import { PageShell } from "@/components/layout/page-shell";

type EditProductPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditProductPage({ params }: EditProductPageProps) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/panel/proveedor/productos");
  }

  const { id } = await params;
  const categories = await listCategories();

  let product;
  try {
    product = await getVendorProduct(session.user.id, id);
  } catch {
    notFound();
  }

  return (
    <PageShell width="md">
      <Link href="/panel/proveedor/productos" className="text-sm text-emerald-800">
        ← Volver a productos
      </Link>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <h1 className="break-words text-2xl font-semibold sm:text-3xl">{product.name}</h1>
        <span className="rounded-full bg-stone-100 px-4 py-2 text-sm">
          {productStatusLabels[product.status] ?? product.status}
        </span>
      </div>
      {product.rejectionReason ? (
        <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">
          Motivo de rechazo: {product.rejectionReason}
        </p>
      ) : null}
      <div className="mt-8 rounded-3xl border border-stone-200 bg-white p-5 shadow-sm sm:p-8">
        <ProductForm categories={categories} product={product} />
      </div>
    </PageShell>
  );
}
