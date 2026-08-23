"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/admin", label: "Resumen" },
  { href: "/admin/entregables-ai", label: "Entregables A.I" },
  { href: "/admin/sandbox", label: "Sandbox" },
  { href: "/admin/piloto", label: "Grupo Piloto" },
  { href: "/admin/kpis", label: "KPIs / riesgos" },
  { href: "/admin/plan", label: "Plan / simulación" },
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

function isActivePath(pathname: string, href: string): boolean {
  if (href === "/admin") {
    return pathname === "/admin";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminNav() {
  const pathname = usePathname() || "/admin";

  return (
    <nav className="mt-6 flex flex-wrap gap-2" aria-label="Secciones del panel">
      {links.map((link) => {
        const active = isActivePath(pathname, link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={
              active
                ? "inline-flex min-h-10 items-center rounded-full border border-emerald-800 bg-emerald-800 px-4 py-2 text-sm font-medium text-white"
                : "inline-flex min-h-10 items-center rounded-full border border-stone-300 bg-white px-4 py-2 text-sm text-stone-800 hover:border-emerald-800"
            }
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
