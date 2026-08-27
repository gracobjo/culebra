"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type SessionUser = {
  name: string;
  email: string;
  roles: string[];
};

type MobileTabBarProps = {
  cartCount: number;
  isLoggedIn: boolean;
  isAdmin?: boolean;
  user?: SessionUser | null;
};

const tabs = [
  { id: "home", href: "/", label: "Inicio", match: (path: string) => path === "/" },
  {
    id: "products",
    href: "/tienda",
    label: "Tienda",
    match: (path: string) =>
      path.startsWith("/tienda") ||
      path.startsWith("/productos") ||
      path.startsWith("/categorias") ||
      path.startsWith("/alojamientos") ||
      path.startsWith("/packs"),
  },
  {
    id: "cart",
    href: "/carrito",
    label: "Carrito",
    match: (path: string) => path.startsWith("/carrito") || path.startsWith("/checkout"),
  },
  {
    id: "account",
    href: "/cuenta",
    label: "Cuenta",
    match: (path: string) =>
      path.startsWith("/cuenta") || path.startsWith("/login") || path.startsWith("/register") || path.startsWith("/panel"),
  },
];

function getAccountHref(user: SessionUser | null | undefined, isLoggedIn: boolean): string {
  if (!isLoggedIn) return "/login";
  if (user?.roles.includes("VENDOR") && !user.roles.includes("ADMIN")) {
    return "/panel/proveedor";
  }
  return "/cuenta";
}

function getAccountLabel(user: SessionUser | null | undefined, isLoggedIn: boolean): string {
  if (!isLoggedIn || !user) return "Cuenta";
  const first = user.name.trim().split(/\s+/)[0];
  if (!first) return "Cuenta";
  return first.length > 8 ? `${first.slice(0, 7)}…` : first;
}

export function MobileTabBar({ cartCount, isLoggedIn, isAdmin, user }: MobileTabBarProps) {
  const pathname = usePathname();
  const accountHref = getAccountHref(user, isLoggedIn);
  const accountLabel = getAccountLabel(user, isLoggedIn);
  const visibleTabs = isAdmin ? tabs.filter((tab) => tab.id !== "cart") : tabs;

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-stone-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
      aria-label="Navegacion principal"
    >
      <ul className={`site-container grid max-w-6xl ${isAdmin ? "grid-cols-3" : "grid-cols-4"}`}>
        {visibleTabs.map((tab) => {
          const href = tab.id === "account" ? accountHref : tab.href;
          const label = tab.id === "account" ? accountLabel : tab.label;
          const active = tab.match(pathname);
          return (
            <li key={tab.id}>
              <Link
                href={href}
                className={`flex min-h-14 flex-col items-center justify-center gap-0.5 text-xs ${
                  active ? "font-semibold text-emerald-800" : "text-stone-600"
                }`}
                title={tab.id === "account" && user ? user.name : undefined}
              >
                <span className="relative">
                  {label}
                  {tab.id === "cart" && cartCount > 0 ? (
                    <span className="absolute -right-3 -top-2 inline-flex min-w-4 items-center justify-center rounded-full bg-emerald-800 px-1 text-[10px] text-white">
                      {cartCount}
                    </span>
                  ) : null}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
