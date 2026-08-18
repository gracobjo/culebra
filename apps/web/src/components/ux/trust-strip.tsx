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
    title: "Envio por productor",
    description: "Cada productor prepara y envia su parte del pedido.",
  },
];

export function TrustStrip({ compact = false }: { compact?: boolean }) {
  return (
    <section
      aria-label="Ventajas del marketplace"
      className={
        compact
          ? "grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
          : "rounded-3xl border border-stone-200 bg-white p-5 sm:p-6"
      }
    >
      {!compact ? (
        <h2 className="mb-4 text-lg font-semibold sm:mb-6">Por que comprar aqui</h2>
      ) : null}
      <ul className={compact ? "contents" : "grid gap-4 sm:grid-cols-2 lg:grid-cols-4"}>
        {items.map((item) => (
          <li
            key={item.title}
            className={
              compact
                ? "rounded-2xl border border-stone-100 bg-stone-50 px-4 py-3"
                : "rounded-2xl bg-stone-50 px-4 py-3"
            }
          >
            <p className="text-sm font-medium text-emerald-900">{item.title}</p>
            <p className="mt-1 text-xs text-stone-600 sm:text-sm">{item.description}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
