"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type AdminNavLink = {
  href: string;
  label: string;
  hint: string;
};

type AdminNavGroup = {
  id: string;
  label: string;
  links: AdminNavLink[];
};

const groups: AdminNavGroup[] = [
  {
    id: "panel",
    label: "Panel",
    links: [
      { href: "/admin", label: "Resumen", hint: "Vista general del panel de administración" },
      { href: "/admin/config", label: "Configuración", hint: "Redes, bloques del inicio y auditoría WAI" },
    ],
  },
  {
    id: "catalogo",
    label: "Catálogo",
    links: [
      { href: "/admin/productores", label: "Productores", hint: "Gestionar productores del marketplace" },
      { href: "/admin/productos", label: "Productos", hint: "Revisar y publicar productos" },
      { href: "/admin/turismo", label: "Turismo / alojamientos", hint: "Alojamientos, packs y CRM de hosteleros" },
    ],
  },
  {
    id: "operaciones",
    label: "Operaciones",
    links: [
      { href: "/admin/pedidos", label: "Pedidos", hint: "Seguimiento de pedidos del marketplace" },
      { href: "/admin/contratos", label: "Contratos", hint: "Versiones y aceptación de contratos" },
      { href: "/admin/liquidaciones", label: "Liquidaciones", hint: "Pagos y liquidaciones a productores" },
      { href: "/admin/usuarios", label: "Usuarios", hint: "Cuentas y estados de usuarios" },
    ],
  },
  {
    id: "negocio",
    label: "Negocio",
    links: [
      { href: "/admin/kpis", label: "KPIs / riesgos", hint: "Indicadores y riesgos del negocio" },
      { href: "/admin/plan", label: "Plan / simulación", hint: "Plan económico y simulaciones" },
      { href: "/admin/rentabilidad", label: "Rentabilidad", hint: "Márgenes y rentabilidad" },
      { href: "/admin/rappels", label: "Rappels", hint: "Acuerdos de rappels con productores" },
    ],
  },
  {
    id: "proyecto",
    label: "Proyecto",
    links: [
      { href: "/admin/showroom", label: "Showroom", hint: "Optimización del showroom físico" },
      { href: "/admin/packaging", label: "Packaging", hint: "Cestas y packaging del catálogo" },
      { href: "/admin/piloto", label: "Grupo piloto", hint: "Seguimiento del grupo piloto" },
      { href: "/admin/raya", label: "La Raya L1", hint: "Checklist La Raya línea 1" },
      { href: "/admin/entregables-ai", label: "Entregables A.I", hint: "Entregables e informes asistidos" },
      { href: "/admin/sandbox", label: "Sandbox", hint: "Pruebas y experimentos" },
    ],
  },
  {
    id: "control",
    label: "Control",
    links: [
      { href: "/admin/auditoria", label: "Auditoría", hint: "Registro de acciones del sistema" },
    ],
  },
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
    <nav className="mt-6 space-y-4" aria-label="Secciones del panel">
      {groups.map((group) => (
        <div key={group.id}>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500">
            {group.label}
          </p>
          <ul className="flex flex-wrap gap-2">
            {group.links.map((link) => {
              const active = isActivePath(pathname, link.href);
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    title={link.hint}
                    aria-label={link.hint}
                    aria-current={active ? "page" : undefined}
                    data-hint={link.hint}
                    className={
                      active
                        ? "a11y-hint inline-flex min-h-10 items-center rounded-full border border-emerald-800 bg-emerald-800 px-4 py-2 text-sm font-medium text-white"
                        : "a11y-hint inline-flex min-h-10 items-center rounded-full border border-stone-300 bg-white px-4 py-2 text-sm text-stone-800 hover:border-emerald-800"
                    }
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
