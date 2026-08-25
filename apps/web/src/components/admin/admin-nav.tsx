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
      {
        href: "/admin",
        label: "Resumen",
        hint: "Cuadro de mando: pendientes, accesos rápidos y tienda pública.",
      },
      {
        href: "/admin/config",
        label: "Configuración",
        hint: "Redes sociales, bloques del hub /tienda y auditoría WAI.",
      },
    ],
  },
  {
    id: "catalogo",
    label: "Catálogo",
    links: [
      {
        href: "/admin/productores",
        label: "Productores",
        hint: "Aprobar artesanos, comisión % y ficha de cada productor.",
      },
      {
        href: "/admin/productos",
        label: "Productos",
        hint: "Moderar fichas enviadas a revisión y publicar en catálogo.",
      },
      {
        href: "/admin/turismo",
        label: "Turismo / alojamientos",
        hint: "Alojamientos, packs, cupones y CRM de hosteleros.",
      },
      {
        href: "/admin/afiliados",
        label: "Afiliados",
        hint: "Códigos ?ref=, comisiones 8–10 %, ledger y simulador de margen.",
      },
    ],
  },
  {
    id: "operaciones",
    label: "Operaciones",
    links: [
      {
        href: "/admin/pedidos",
        label: "Pedidos",
        hint: "Estado de pedidos, pagos, envíos y detalle por número.",
      },
      {
        href: "/admin/contratos",
        label: "Contratos",
        hint: "Versiones del contrato marco y firma de productores.",
      },
      {
        href: "/admin/liquidaciones",
        label: "Liquidaciones",
        hint: "Pagos netos a productores tras retención de 14 días.",
      },
      {
        href: "/admin/usuarios",
        label: "Usuarios",
        hint: "Suspender o reactivar cuentas de consumidores y artesanos.",
      },
    ],
  },
  {
    id: "negocio",
    label: "Negocio",
    links: [
      {
        href: "/admin/kpis",
        label: "KPIs / riesgos",
        hint: "Desempeño por artesano y alertas del modelo multimarca.",
      },
      {
        href: "/admin/plan",
        label: "Plan / simulación",
        hint: "PyG de viabilidad y simulador de escenarios económicos.",
      },
      {
        href: "/admin/rentabilidad",
        label: "Rentabilidad",
        hint: "Margen neto por transacción con costes imputables.",
      },
      {
        href: "/admin/rappels",
        label: "Rappels",
        hint: "Bonificación anual por volumen (Bronce / Plata / Oro).",
      },
    ],
  },
  {
    id: "proyecto",
    label: "Proyecto",
    links: [
      {
        href: "/admin/showroom",
        label: "Showroom",
        hint: "Simulador 90 días: conversión, impulso en caja y cestas.",
      },
      {
        href: "/admin/showroom/estadisticas",
        label: "Stats showroom",
        hint: "Captura diaria, procedencia visitantes, EDA y export CSV.",
      },
      {
        href: "/admin/showroom/fidelizacion",
        label: "Fidelización",
        hint: "Rasca y gana, sellos, club WhatsApp y referidos en tienda.",
      },
      {
        href: "/admin/packaging",
        label: "Packaging",
        hint: "Cajas kraft, etiquetas y costes por tipo de cesta.",
      },
      {
        href: "/admin/piloto",
        label: "Grupo piloto",
        hint: "Productores fundadores, fases, tareas y categorías piloto.",
      },
      {
        href: "/admin/raya",
        label: "La Raya L1",
        hint: "Checklist documental convocatoria La Raya (ICECYL).",
      },
      {
        href: "/admin/entregables-ai",
        label: "Entregables A.I",
        hint: "Estado del contrato de desarrollo núcleo marketplace.",
      },
      {
        href: "/admin/sandbox",
        label: "Sandbox",
        hint: "Probar pedido → pago → envío → payout sin Stripe real.",
      },
    ],
  },
  {
    id: "control",
    label: "Control",
    links: [
      {
        href: "/admin/auditoria",
        label: "Auditoría",
        hint: "Registro de acciones administrativas (quién, qué, cuándo).",
      },
    ],
  },
];

const ALL_NAV_HREFS = groups.flatMap((group) => group.links.map((link) => link.href));

/** Un solo enlace activo: el href más específico que encaja con la ruta actual. */
function getActiveNavHref(pathname: string): string | null {
  const matches = ALL_NAV_HREFS.filter((href) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname === href || pathname.startsWith(`${href}/`);
  });

  if (matches.length === 0) return null;
  return matches.sort((a, b) => b.length - a.length)[0] ?? null;
}

export function AdminNav() {
  const pathname = usePathname() || "/admin";
  const activeHref = getActiveNavHref(pathname);

  return (
    <nav className="mt-6 space-y-5" aria-label="Secciones del panel">
      <p className="text-xs text-stone-500">
        Guía completa:{" "}
        <code className="rounded bg-stone-100 px-1 py-0.5 text-[11px]">docs/admin.md</code>
      </p>
      {groups.map((group) => (
        <section key={group.id} aria-labelledby={`admin-nav-${group.id}`}>
          <h2
            id={`admin-nav-${group.id}`}
            className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500"
          >
            {group.label}
          </h2>
          <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {group.links.map((link) => {
              const active = link.href === activeHref;
              const hintId = `admin-nav-hint-${group.id}-${link.href.replace(/\//g, "-")}`;
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    aria-describedby={hintId}
                    className={
                      active
                        ? "block min-h-[4.5rem] rounded-2xl border border-emerald-800 bg-emerald-800 px-3.5 py-3 shadow-sm transition hover:bg-emerald-900"
                        : "block min-h-[4.5rem] rounded-2xl border border-stone-200 bg-white px-3.5 py-3 shadow-sm transition hover:border-emerald-700 hover:shadow-md"
                    }
                  >
                    <span
                      className={
                        active
                          ? "text-sm font-semibold text-white"
                          : "text-sm font-semibold text-stone-900"
                      }
                    >
                      {link.label}
                    </span>
                    <span
                      id={hintId}
                      className={
                        active
                          ? "mt-1 block text-xs leading-snug text-emerald-100/90"
                          : "mt-1 block text-xs leading-snug text-stone-500"
                      }
                    >
                      {link.hint}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </nav>
  );
}
