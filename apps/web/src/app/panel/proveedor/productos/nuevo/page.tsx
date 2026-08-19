import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { listCategories } from "@culebra/auth";
import { ProductForm } from "@/components/catalog/product-form";
import { PageShell } from "@/components/layout/page-shell";

export default async function NewProductPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?callbackUrl=/panel/proveedor/productos/nuevo");
  }
  if (!session?.user?.roles?.includes("VENDOR")) {
    redirect("/quiero-vender");
  }

  const categories = await listCategories();

  return (
    <PageShell width="md">
      <p className="text-xs uppercase tracking-[0.2em] text-emerald-800 sm:text-sm">
        Panel productor
      </p>
      <h1 className="mt-2 text-2xl font-semibold sm:text-3xl">Nuevo producto</h1>
      <p className="mt-3 text-sm text-stone-600">
        El producto quedara en borrador hasta que lo envies a revision.
      </p>
      <div className="mt-8 rounded-3xl border border-stone-200 bg-white p-5 shadow-sm sm:p-8">
        <ProductForm categories={categories} />
      </div>
    </PageShell>
  );
}
