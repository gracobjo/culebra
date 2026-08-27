const items = [
  {
    title: "Productores locales",
    description: "Compra directa a elaboradores de la sierra.",
  },
  {
    title: "Pago seguro",
    description: "Checkout con Stripe y seguimiento de pedido.",
  },
  {
    title: "Informacion clara",
    description: "Origen y alergenos solo si el productor los indica.",
  },
  {
    title: "Envio con umbral",
    description: "Tarifa plana a cargo del cliente.",
  },
];

const itemClassName =
  "rounded-2xl border border-stone-100 bg-stone-50 px-5 py-4";

const itemClassNameBoxed =
  "rounded-2xl bg-stone-50 px-5 py-4";

function TrustItemContent({ item }: { item: (typeof items)[number] }) {
  return (
    <>
      <p className="text-sm font-medium leading-snug text-emerald-900">{item.title}</p>
      <p className="mt-1 text-xs text-stone-600 sm:text-sm">{item.description}</p>
    </>
  );
}

export function TrustStrip({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <section
        aria-label="Ventajas del marketplace"
        className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
      >
        {items.map((item) => (
          <div key={item.title} className={itemClassName}>
            <TrustItemContent item={item} />
          </div>
        ))}
      </section>
    );
  }

  return (
    <section
      aria-label="Ventajas del marketplace"
      className="rounded-3xl border border-stone-200 bg-white p-5 sm:p-6"
    >
      <h2 className="mb-4 text-lg font-semibold sm:mb-6">Por que comprar aqui</h2>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => (
          <li key={item.title} className={itemClassNameBoxed}>
            <TrustItemContent item={item} />
          </li>
        ))}
      </ul>
    </section>
  );
}
