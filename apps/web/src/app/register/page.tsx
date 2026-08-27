import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { RegisterForm } from "@/components/auth/register-form";
import { PageShell } from "@/components/layout/page-shell";

export default async function RegisterPage() {
  const session = await auth().catch(() => null);
  if (session?.user) {
    const roles = session.user.roles ?? [];
    if (roles.includes("ADMIN")) redirect("/admin");
    if (roles.includes("VENDOR")) redirect("/panel/proveedor");
    redirect("/cuenta");
  }

  return (
    <PageShell width="sm" className="flex flex-col justify-center">
      <div className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm sm:p-8">
        <p className="text-xs uppercase tracking-[0.2em] text-emerald-800 sm:text-sm">
          Cuenta
        </p>
        <h1 className="mt-2 text-2xl font-semibold">Crear cuenta</h1>
        <p className="mt-2 text-sm text-stone-600">
          Registrate para comprar y hacer seguimiento de tus pedidos.
        </p>
        <div className="mt-6">
          <RegisterForm />
        </div>
        <p className="mt-6 text-sm text-stone-600">
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className="font-medium text-emerald-800">
            Inicia sesion
          </Link>
        </p>
        <p className="mt-4 text-xs text-stone-500">
          [REVISAR CON ABOGADO] Al registrarte aceptaras los terminos y la
          politica de privacidad.
        </p>
      </div>
    </PageShell>
  );
}
