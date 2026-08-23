import Link from "next/link";
import Image from "next/image";
import { getAdminDashboardStats } from "@culebra/auth";
import { requireAdmin } from "@/lib/admin";
import { AdminShell } from "@/components/admin/admin-shell";
import { STOREFRONT_MOSAIC } from "@/lib/category-images";

export const metadata = { title: "Admin | Sierra de la Culebra" };

export default async function AdminDashboardPage() {
  await requireAdmin();
  const stats = await getAdminDashboardStats();

  const cards = [
    {
      href: "/admin/productores",
      label: "Productores pendientes",
      value: stats.vendorsPending,
      image: "/categories/embutidos-y-productos-carnicos.png",
      hint: "Altas y verificación",
    },
    {
      href: "/admin/productos",
      label: "Productos pendientes",
      value: stats.productsPending,
      image: "/categories/quesos-y-lacteos.png",
      hint: "Catálogo a moderar",
    },
    {
      href: "/admin/contratos",
      label: "Contratos por firmar",
      value: stats.contractsPending,
      image: "/categories/productos-tradicionales.png",
      hint: "Condiciones de venta",
    },
    {
      href: "/admin/liquidaciones",
      label: "Liquidaciones pendientes",
      value: stats.payoutsPending,
      image: "/categories/vinos.png",
      hint: "Pagos a productores",
    },
    {
      href: "/admin/pedidos",
      label: "Pedidos totales",
      value: stats.ordersTotal,
      image: "/categories/miel-y-productos-apicolas.png",
      hint: "Operativa de envíos",
    },
    {
      href: "/admin/usuarios",
      label: "Usuarios",
      value: stats.usersTotal,
      image: "/categories/reposteria.png",
      hint: "Cuentas y roles",
    },
    {
      href: "/admin/plan",
      label: "Plan / simulación",
      value: "Decisiones",
      isText: true as const,
      image: "/categories/licores.png",
      hint: "Viabilidad y caja",
    },
    {
      href: "/admin/entregables-ai",
      label: "Entregables A.I",
      value: "14.500 €",
      isText: true as const,
      image: "/categories/productos-tradicionales.png",
      hint: "Núcleo marketplace · checklist",
    },
  ];

  return (
    <AdminShell title="Resumen">
      <section className="relative mb-8 overflow-hidden rounded-[1.75rem] border border-emerald-900/10 bg-emerald-950 text-white shadow-md">
        <div className="absolute inset-0 grid grid-cols-3 gap-0.5 opacity-35 sm:grid-cols-6">
          {STOREFRONT_MOSAIC.map((src) => (
            <div key={src} className="relative min-h-[6.5rem]">
              <Image src={src} alt="" fill className="object-cover" sizes="16vw" />
            </div>
          ))}
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-950 via-emerald-950/90 to-emerald-950/50" />
        <div className="relative flex flex-col gap-6 px-6 py-8 sm:flex-row sm:items-end sm:justify-between sm:px-8 sm:py-10">
          <div className="max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-200">
              Sabores de la Culebra
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
              Mostrador digital de la comarca
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-emerald-50/85">
              Gestionas una tienda de territorio: productores, catálogo gourmet y
              pedidos. Mira la vitrina pública cuando quieras ver lo que ve el cliente.
            </p>
          </div>
          <Link
            href="/tienda"
            className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-full bg-white px-5 text-sm font-medium text-emerald-950 transition hover:bg-emerald-50"
          >
            Abrir tienda pública
          </Link>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="group overflow-hidden rounded-3xl border border-stone-200/80 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-500 hover:shadow-md"
          >
            <div className="relative h-28 overflow-hidden bg-stone-200">
              <Image
                src={card.image}
                alt=""
                fill
                sizes="(max-width: 640px) 100vw, 33vw"
                className="object-cover transition duration-500 group-hover:scale-[1.05]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-white via-white/40 to-transparent" />
            </div>
            <div className="relative -mt-6 px-5 pb-5">
              <p className="text-sm text-stone-500">{card.label}</p>
              <p
                className={`mt-1 font-semibold text-stone-900 ${
                  "isText" in card && card.isText ? "text-2xl" : "text-3xl"
                }`}
              >
                {card.value}
              </p>
              <p className="mt-1 text-xs text-stone-500">{card.hint}</p>
            </div>
          </Link>
        ))}
      </div>
    </AdminShell>
  );
}
