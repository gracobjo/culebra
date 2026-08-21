import Link from "next/link";
import { getAdminDashboardStats } from "@culebra/auth";
import { requireAdmin } from "@/lib/admin";
import { AdminShell } from "@/components/admin/admin-shell";

export const metadata = { title: "Admin | Sierra de la Culebra" };

export default async function AdminDashboardPage() {
  await requireAdmin();
  const stats = await getAdminDashboardStats();

  const cards = [
    { href: "/admin/productores", label: "Productores pendientes", value: stats.vendorsPending },
    { href: "/admin/productos", label: "Productos pendientes", value: stats.productsPending },
    { href: "/admin/contratos", label: "Contratos por firmar", value: stats.contractsPending },
    { href: "/admin/liquidaciones", label: "Liquidaciones pendientes", value: stats.payoutsPending },
    { href: "/admin/pedidos", label: "Pedidos totales", value: stats.ordersTotal },
    { href: "/admin/usuarios", label: "Usuarios", value: stats.usersTotal },
    {
      href: "/admin/plan",
      label: "Plan / simulación",
      value: "Decisiones",
      isText: true as const,
    },
  ];

  return (
    <AdminShell title="Resumen">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="rounded-3xl border border-stone-200 bg-white p-5 hover:border-emerald-800"
          >
            <p className="text-sm text-stone-500">{card.label}</p>
            <p
              className={`mt-2 font-semibold ${
                "isText" in card && card.isText ? "text-2xl" : "text-3xl"
              }`}
            >
              {card.value}
            </p>
          </Link>
        ))}
      </div>
    </AdminShell>
  );
}
