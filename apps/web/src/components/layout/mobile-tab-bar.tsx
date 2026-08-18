"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type MobileTabBarProps = {
  cartCount: number;
  isLoggedIn: boolean;
};

const tabs = [
  { href: "/", label: "Inicio", match: (path: string) => path === "/" },
  {
    href: "/productos",
    label: "Productos",
    match: (path: string) => path.startsWith("/productos") || path.startsWith("/categorias"),
  },
  {
    href: "/carrito",
    label: "Carrito",
    match: (path: string) => path.startsWith("/carrito") || path.startsWith("/checkout"),
  },
  {
    href: "/cuenta",
    label: "Cuenta",
    match: (path: string) =>
      path.startsWith("/cuenta") || path.startsWith("/login") || path.startsWith("/register") || path.startsWith("/panel"),
  },
];

export function MobileTabBar({ cartCount, isLoggedIn }: MobileTabBarProps) {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-stone-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
      aria-label="Navegacion principal"
    >
      <ul className="grid grid-cols-4">
        {tabs.map((tab) => {
          const href = tab.href === "/cuenta" && !isLoggedIn ? "/login" : tab.href;
          const active = tab.match(pathname);
          return (
            <li key={tab.href}>
              <Link
                href={href}
                className={`flex min-h-14 flex-col items-center justify-center gap-0.5 text-xs ${
                  active ? "font-semibold text-emerald-800" : "text-stone-600"
                }`}
              >
                <span className="relative">
                  {tab.label}
                  {tab.href === "/carrito" && cartCount > 0 ? (
                    <span className="absolute -right-4 -top-2 inline-flex min-w-4 items-center justify-center rounded-full bg-emerald-800 px-1 text-[10px] text-white">
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
