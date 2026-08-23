import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { AdminShell } from "@/components/admin/admin-shell";

export const metadata = { title: "Entregables A.I | Admin" };

const SUBPARTIDAS = [
  {
    code: "A.1",
    title: "Arquitectura, BD y UI/UX",
    amount: "3.500 €",
    status: "Cumplido (repo)",
    checks: [
      "Modelo multi-vendedor en Prisma",
      "Docs architecture + database + wireframes",
      "Entorno Docker / seed",
    ],
    routes: [
      { href: "/", label: "Home" },
      { href: "/tienda", label: "Tienda" },
    ],
  },
  {
    code: "A.2",
    title: "Catálogo + panel productor",
    amount: "5.000 €",
    status: "Cumplido (repo)",
    checks: [
      "Perfiles y alta productor",
      "Productos, precios y stock",
      "Panel /panel/proveedor",
    ],
    routes: [
      { href: "/panel/proveedor", label: "Panel proveedor" },
      { href: "/admin/productores", label: "Admin productores" },
      { href: "/admin/productos", label: "Admin productos" },
      { href: "/quiero-vender", label: "Quiero vender" },
    ],
  },
  {
    code: "A.3",
    title: "Pedidos, carrito y checkout",
    amount: "4.000 €",
    status: "Cumplido (repo)",
    checks: [
      "Cesta unificada",
      "Desglose por productor en carrito",
      "Split VendorOrder + estados",
    ],
    routes: [
      { href: "/carrito", label: "Carrito" },
      { href: "/checkout", label: "Checkout" },
      { href: "/admin/pedidos", label: "Admin pedidos" },
    ],
  },
  {
    code: "A.5a",
    title: "Comisión base + admin usable",
    amount: "2.000 €",
    status: "Cumplido (repo)",
    checks: [
      "Comisión 17 % + mínimo 4 €",
      "Panel admin operativo",
      "Sin cierre fino A.5b",
    ],
    routes: [
      { href: "/admin", label: "Resumen admin" },
      { href: "/admin/productores", label: "Comisiones en productor" },
      { href: "/admin/liquidaciones", label: "Liquidaciones" },
    ],
  },
] as const;

export default async function AdminEntregablesAiPage() {
  await requireAdmin();

  return (
    <AdminShell title="Entregables A.I">
      <section className="rounded-[1.75rem] border border-emerald-900/10 bg-emerald-950 px-6 py-8 text-white sm:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-200">
          Contrato menor · núcleo marketplace
        </p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight">
          A.I — 14.500 € (A.1 + A.2 + A.3 + A.5a)
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-emerald-50/85">
          Checklist técnico para acreditar el núcleo funcional. La justificación
          económica (factura/pago) se registra en el Cuaderno; aquí se verifica el
          software.
        </p>
        <p className="mt-4 text-sm text-emerald-100/80">
          Documentación:{" "}
          <code className="rounded bg-white/10 px-1.5 py-0.5 text-xs">
            docs/Entregables_Contrato_AI_Nucleo_Marketplace.md
          </code>{" "}
          ·{" "}
          <code className="rounded bg-white/10 px-1.5 py-0.5 text-xs">
            docs/Wireframes_UIUX_Contrato_AI.md
          </code>
        </p>
      </section>

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        {SUBPARTIDAS.map((block) => (
          <article
            key={block.code}
            className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-800">
                  {block.code} · {block.amount}
                </p>
                <h3 className="mt-1 text-lg font-semibold">{block.title}</h3>
              </div>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-900">
                {block.status}
              </span>
            </div>
            <ul className="mt-4 space-y-1.5 text-sm text-stone-600">
              {block.checks.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="text-emerald-700" aria-hidden>
                    ✓
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <div className="mt-5 flex flex-wrap gap-2">
              {block.routes.map((route) => (
                <Link
                  key={route.href}
                  href={route.href}
                  className="inline-flex min-h-9 items-center rounded-full border border-stone-300 px-3 text-xs font-medium text-stone-800 hover:border-emerald-700 hover:text-emerald-900"
                >
                  {route.label}
                </Link>
              ))}
            </div>
          </article>
        ))}
      </div>

      <p className="mt-8 text-sm text-stone-500">
        Fuera de este checklist: A.4 pagos/retención, A.5b cierre fino y A.6
        seguridad/producción → contrato{" "}
        <strong className="font-medium text-stone-700">A.II (8.500 €)</strong>.
      </p>
    </AdminShell>
  );
}
