import Link from "next/link";
import { auth } from "@/auth";
import { signOutAction } from "./actions";
import { PageShell } from "@/components/layout/page-shell";

export default async function AccountPage() {
  const session = await auth();

  return (
    <PageShell width="md">
      <div className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm sm:p-8">
        <p className="text-xs uppercase tracking-[0.2em] text-emerald-800 sm:text-sm">
          Mi cuenta
        </p>
        <h1 className="mt-2 break-words text-2xl font-semibold sm:text-3xl">Hola, {session?.user?.name}</h1>
        <p className="mt-2 text-stone-600">{session?.user?.email}</p>

        <div className="mt-8 rounded-2xl bg-stone-50 p-5">
          <h2 className="font-medium">Roles asignados</h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {(session?.user?.roles ?? []).map((role) => (
              <li
                key={role}
                className="rounded-full bg-emerald-100 px-3 py-1 text-sm text-emerald-900"
              >
                {role}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/cuenta/pedidos"
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-emerald-800 px-5 py-3 text-sm font-medium text-white"
          >
            Ver mis pedidos
          </Link>
          {(session?.user?.roles ?? []).includes("VENDOR") ? (
            <Link
              href="/panel/proveedor/pedidos"
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-stone-300 px-5 py-3 text-sm font-medium"
            >
              Pedidos de mi tienda
            </Link>
          ) : null}
        </div>

        <form action={signOutAction} className="mt-8">
          <button
            type="submit"
            className="min-h-11 rounded-full border border-stone-300 px-5 py-3 text-sm font-medium"
          >
            Cerrar sesion
          </button>
        </form>

        <Link href="/" className="mt-6 inline-block text-sm text-emerald-800">
          Volver al inicio
        </Link>
      </div>
    </PageShell>
  );
}
