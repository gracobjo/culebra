"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

import { SignOutButton } from "@/components/auth/sign-out-button";

type SessionUser = {
  name: string;
  email: string;
  roles: string[];
};

type SiteHeaderNavProps = {
  cartCount: number;
  isLoggedIn: boolean;
  isAdmin?: boolean;
  user?: SessionUser | null;
};

const links = [
  { href: "/tienda", label: "Tienda" },
  { href: "/productos", label: "Productos" },
  { href: "/productores", label: "Productores" },
];

const ROLE_LABELS: Record<string, string> = {
  CONSUMER: "Consumidor",
  VENDOR: "Productor",
  ADMIN: "Administrador",
};

function getRoleLabel(roles: string[]): string {
  if (roles.includes("ADMIN")) return ROLE_LABELS.ADMIN;
  if (roles.includes("VENDOR")) return ROLE_LABELS.VENDOR;
  return ROLE_LABELS.CONSUMER;
}

function getAccountHref(roles: string[]): string {
  if (roles.includes("VENDOR")) return "/panel/proveedor";
  return "/cuenta";
}

function getInitial(name: string): string {
  return name.trim().charAt(0).toUpperCase() || "?";
}

function getDisplayName(name: string): string {
  const first = name.trim().split(/\s+/)[0];
  return first || name;
}

export function SiteHeaderNav({ cartCount, isLoggedIn, isAdmin, user }: SiteHeaderNavProps) {
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

  const accountHref = user ? getAccountHref(user.roles) : "/cuenta";
  const roleLabel = user ? getRoleLabel(user.roles) : "";

  return (
    <header className="sticky top-0 z-40 border-b border-stone-200 bg-white/95 pt-[env(safe-area-inset-top)] backdrop-blur supports-[backdrop-filter]:bg-white/90">
      <div className="site-container flex max-w-6xl items-center justify-between gap-3 py-3 sm:py-4">
        <Link href="/" className="shrink-0" aria-label="Sabores de la Culebra — Inicio">
          <Image
            src="/logo.png"
            alt="Sabores de la Culebra"
            width={120}
            height={120}
            className="h-12 w-auto sm:h-14"
            priority
          />
        </Link>

        <nav className="hidden min-w-0 shrink items-center gap-3 text-sm lg:flex xl:gap-5">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="shrink-0 hover:text-emerald-800">
              {link.label}
            </Link>
          ))}
          <Link href="/carrito" className="shrink-0 hover:text-emerald-800">
            Carrito ({cartCount})
          </Link>
          {isLoggedIn && user ? (
            <>
              {!user.roles.includes("VENDOR") ? (
                <Link href="/cuenta/pedidos" className="shrink-0 hover:text-emerald-800">
                  Pedidos
                </Link>
              ) : null}
              <div className="flex shrink-0 items-center gap-2 border-l border-stone-200 pl-3 xl:gap-3 xl:pl-4">
                <Link
                  href={accountHref}
                  className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-stone-50 px-2.5 py-1 hover:border-emerald-200 hover:bg-emerald-50"
                  title={user.email}
                >
                  <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-800 text-xs font-medium text-white">
                    {getInitial(user.name)}
                  </span>
                  <span className="flex flex-col leading-tight">
                    <span className="font-medium text-stone-900">{getDisplayName(user.name)}</span>
                    <span className="text-[11px] text-stone-500">{roleLabel}</span>
                  </span>
                </Link>
                {isAdmin ? (
                  <Link href="/admin" className="shrink-0 hover:text-emerald-800">
                    Admin
                  </Link>
                ) : null}
                <SignOutButton
                  className="shrink-0 text-sm text-stone-600 underline-offset-2 hover:text-emerald-900 hover:underline"
                  label="Salir"
                />
              </div>
            </>
          ) : (
            <Link href="/login" className="shrink-0 hover:text-emerald-800">
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
            {isLoggedIn && user ? (
              <Link
                href={accountHref}
                className="mb-2 rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 hover:bg-emerald-50"
                onClick={() => setOpen(false)}
              >
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-800 text-sm font-medium text-white">
                    {getInitial(user.name)}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-stone-900">{user.name}</p>
                    <p className="truncate text-sm text-stone-500">{user.email}</p>
                    <span className="mt-1 inline-block rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800">
                      {roleLabel}
                    </span>
                  </div>
                </div>
              </Link>
            ) : null}
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
            {isLoggedIn && user && !user.roles.includes("VENDOR") ? (
              <Link
                href="/cuenta/pedidos"
                className="rounded-xl px-3 py-3 hover:bg-stone-50"
                onClick={() => setOpen(false)}
              >
                Mis pedidos
              </Link>
            ) : null}
            {!isLoggedIn ? (
              <Link
                href="/login"
                className="rounded-xl px-3 py-3 hover:bg-stone-50"
                onClick={() => setOpen(false)}
              >
                Entrar
              </Link>
            ) : null}
            {isAdmin ? (
              <Link
                href="/admin"
                className="rounded-xl px-3 py-3 hover:bg-stone-50"
                onClick={() => setOpen(false)}
              >
                Administracion
              </Link>
            ) : null}
            {isLoggedIn ? (
              <div className="mt-2 border-t border-stone-100 pt-2">
                <SignOutButton
                  formClassName="w-full"
                  className="w-full rounded-xl px-3 py-3 text-left text-sm font-medium text-red-800 hover:bg-red-50"
                  label="Cerrar sesion"
                />
              </div>
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
