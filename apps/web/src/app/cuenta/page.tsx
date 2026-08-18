import Link from "next/link";
import { auth } from "@/auth";
import { signOutAction } from "./actions";

export default async function AccountPage() {
  const session = await auth();

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-6 py-16">
      <div className="rounded-3xl border border-stone-200 bg-white p-8 shadow-sm">
        <p className="text-sm uppercase tracking-[0.2em] text-emerald-800">
          Mi cuenta
        </p>
        <h1 className="mt-2 text-3xl font-semibold">Hola, {session?.user?.name}</h1>
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

        <form action={signOutAction} className="mt-8">
          <button
            type="submit"
            className="rounded-full border border-stone-300 px-5 py-3 text-sm font-medium"
          >
            Cerrar sesion
          </button>
        </form>

        <Link href="/" className="mt-6 inline-block text-sm text-emerald-800">
          Volver al inicio
        </Link>
      </div>
    </main>
  );
}
