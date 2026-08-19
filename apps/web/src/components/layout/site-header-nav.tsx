"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

type SiteHeaderNavProps = {
  cartCount: number;
  isLoggedIn: boolean;
  isAdmin?: boolean;
};

const links = [
  { href: "/productos", label: "Productos" },
  { href: "/categorias", label: "Categorias" },
  { href: "/productores", label: "Productores" },
];

export function SiteHeaderNav({ cartCount, isLoggedIn, isAdmin }: SiteHeaderNavProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-40 border-b border-stone-200 bg-white/95 pt-[env(safe-area-inset-top)] backdrop-blur">
      <div className="site-container flex max-w-6xl items-center justify-between gap-3 py-3 sm:py-4">
        <Link
          href="/"
          className="min-w-0 truncate text-xs font-semibold uppercase tracking-[0.14em] text-emerald-800 sm:text-sm sm:tracking-[0.2em]"
        >
          <span className="sm:hidden">Culebra</span>
          <span className="hidden sm:inline">Sierra de la Culebra Marketplace</span>
        </Link>

        <nav className="hidden shrink-0 items-center gap-4 text-sm lg:flex xl:gap-6">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-emerald-800">
              {link.label}
            </Link>
          ))}
          <Link href="/carrito" className="hover:text-emerald-800">
            Carrito ({cartCount})
          </Link>
          {isLoggedIn ? (
            <>
              <Link href="/cuenta/pedidos" className="hover:text-emerald-800">
                Pedidos
              </Link>
              <Link href="/cuenta" className="hover:text-emerald-800">
                Cuenta
              </Link>
              {isAdmin ? (
                <Link href="/admin" className="hover:text-emerald-800">
                  Admin
                </Link>
              ) : null}
            </>
          ) : (
            <Link href="/login" className="hover:text-emerald-800">
              Entrar
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-2 lg:hidden">
          <Link
            href="/carrito"
            className="relative inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-stone-200 text-sm"
            aria-label={`Carrito, ${cartCount} articulos`}
          >
            <CartIcon />
            {cartCount > 0 ? (
              <span className="absolute -right-1 -top-1 inline-flex min-w-5 items-center justify-center rounded-full bg-emerald-800 px-1 text-[11px] font-medium text-white">
                {cartCount}
              </span>
            ) : null}
          </Link>
          <button
            type="button"
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-stone-200"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Cerrar menu" : "Abrir menu"}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      {open ? (
        <div
          id="mobile-menu"
          className="border-t border-stone-200 bg-white lg:hidden"
        >
          <nav className="site-container flex max-w-6xl flex-col gap-1 py-4 text-base">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-xl px-3 py-3 hover:bg-stone-50"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/como-funciona"
              className="rounded-xl px-3 py-3 hover:bg-stone-50"
              onClick={() => setOpen(false)}
            >
              Como funciona
            </Link>
            <Link
              href="/quiero-vender"
              className="rounded-xl px-3 py-3 hover:bg-stone-50"
              onClick={() => setOpen(false)}
            >
              Quiero vender
            </Link>
            <Link
              href="/pedido/consultar"
              className="rounded-xl px-3 py-3 hover:bg-stone-50"
              onClick={() => setOpen(false)}
            >
              Consultar pedido
            </Link>
            {isLoggedIn ? (
              <Link
                href="/cuenta/pedidos"
                className="rounded-xl px-3 py-3 hover:bg-stone-50"
                onClick={() => setOpen(false)}
              >
                Mis pedidos
              </Link>
            ) : null}
            <Link
              href={isLoggedIn ? "/cuenta" : "/login"}
              className="rounded-xl px-3 py-3 hover:bg-stone-50"
              onClick={() => setOpen(false)}
            >
              {isLoggedIn ? "Mi cuenta" : "Entrar"}
            </Link>
            {isAdmin ? (
              <Link
                href="/admin"
                className="rounded-xl px-3 py-3 hover:bg-stone-50"
                onClick={() => setOpen(false)}
              >
                Administracion
              </Link>
            ) : null}
          </nav>
        </div>
      ) : null}
    </header>
  );
}

function MenuIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M6 6h15l-1.5 9h-12z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M6 6L5 3H2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="9" cy="20" r="1.5" fill="currentColor" />
      <circle cx="18" cy="20" r="1.5" fill="currentColor" />
    </svg>
  );
}
