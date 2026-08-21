import Link from "next/link";

type OwnerProductToolbarProps = {
  productId: string;
  productName: string;
  hasOwnImage: boolean;
};

export function OwnerProductToolbar({
  productId,
  productName,
  hasOwnImage,
}: OwnerProductToolbarProps) {
  const editHref = `/panel/proveedor/productos/${productId}`;
  const photoHref = `${editHref}#foto`;

  return (
    <aside
      className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 sm:px-5"
      aria-label="Gestionar este producto"
    >
      <p className="text-sm font-medium text-emerald-950">
        Este producto es tuyo · {productName}
      </p>
      <p className="mt-1 text-sm text-emerald-900/80">
        {hasOwnImage
          ? "Puedes editar datos, precio, stock o cambiar la foto desde tu panel."
          : "Aún no tiene foto propia: súbela para que destaque en la tienda."}
      </p>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <Link
          href={editHref}
          className="inline-flex min-h-11 items-center justify-center rounded-full bg-emerald-800 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-900"
        >
          Editar producto
        </Link>
        <Link
          href={photoHref}
          className="inline-flex min-h-11 items-center justify-center rounded-full border border-emerald-800 bg-white px-5 py-2.5 text-sm font-medium text-emerald-900 hover:bg-emerald-50"
        >
          {hasOwnImage ? "Cambiar foto" : "Añadir foto"}
        </Link>
        <Link
          href="/panel/proveedor/productos"
          className="inline-flex min-h-11 items-center justify-center rounded-full px-4 py-2.5 text-sm font-medium text-emerald-900 underline-offset-2 hover:underline"
        >
          Mis productos
        </Link>
      </div>
    </aside>
  );
}
