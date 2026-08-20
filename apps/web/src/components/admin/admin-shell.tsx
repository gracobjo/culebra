import Link from "next/link";
import Image from "next/image";
import { PageShell } from "@/components/layout/page-shell";

const links = [
  { href: "/admin", label: "Resumen" },
  { href: "/admin/sandbox", label: "Sandbox" },
  { href: "/admin/piloto", label: "Grupo Piloto" },
  { href: "/admin/kpis", label: "KPIs artesanos" },
  { href: "/admin/rentabilidad", label: "Rentabilidad" },
  { href: "/admin/rappels", label: "Rappels" },
  { href: "/admin/productores", label: "Productores" },
  { href: "/admin/productos", label: "Productos" },
  { href: "/admin/turismo", label: "Turismo" },
  { href: "/admin/contratos", label: "Contratos" },
  { href: "/admin/pedidos", label: "Pedidos" },
  { href: "/admin/liquidaciones", label: "Liquidaciones" },
  { href: "/admin/usuarios", label: "Usuarios" },
  { href: "/admin/auditoria", label: "Auditoria" },
];

export function AdminShell({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <PageShell width="full">
      <div className="flex items-center gap-4">
        <Link href="/" aria-label="Sabores de la Culebra — Inicio">
          <Image
            src="/logo.png"
            alt="Sabores de la Culebra"
            width={80}
            height={80}
            className="h-14 w-auto"
            priority
          />
        </Link>
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-emerald-800">
            Panel administracion
          </p>
          <h1 className="mt-1 text-2xl font-semibold sm:text-3xl">{title}</h1>
        </div>
      </div>
      <nav className="mt-6 flex flex-wrap gap-2">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="inline-flex min-h-10 items-center rounded-full border border-stone-300 px-4 py-2 text-sm hover:border-emerald-800"
          >
            {link.label}
          </Link>
        ))}
      </nav>
      <div className="mt-8">{children}</div>
    </PageShell>
  );
}
