import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { listCategories } from "@culebra/auth";
import { ProductForm } from "@/components/catalog/product-form";

export default async function NewProductPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?callbackUrl=/panel/proveedor/productos/nuevo");
  }

  const categories = await listCategories();

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-6 py-16">
      <p className="text-sm uppercase tracking-[0.2em] text-emerald-800">
        Panel productor
      </p>
      <h1 className="mt-2 text-3xl font-semibold">Nuevo producto</h1>
      <p className="mt-3 text-sm text-stone-600">
        El producto quedara en borrador hasta que lo envies a revision.
      </p>
      <div className="mt-8 rounded-3xl border border-stone-200 bg-white p-8 shadow-sm">
        <ProductForm categories={categories} />
      </div>
    </main>
  );
}
