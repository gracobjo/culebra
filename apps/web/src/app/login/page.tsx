import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";
import { PageShell } from "@/components/layout/page-shell";

export default function LoginPage() {
  return (
    <PageShell width="sm" className="flex flex-col justify-center">
      <div className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm sm:p-8">
        <p className="text-xs uppercase tracking-[0.2em] text-emerald-800 sm:text-sm">
          Acceso
        </p>
        <h1 className="mt-2 text-2xl font-semibold">Iniciar sesion</h1>
        <p className="mt-2 text-sm text-stone-600">
          Accede a tu cuenta para gestionar pedidos y preferencias.
        </p>
        <div className="mt-6">
          <LoginForm />
        </div>
        <p className="mt-6 text-sm text-stone-600">
          ¿No tienes cuenta?{" "}
          <Link href="/register" className="font-medium text-emerald-800">
            Registrate
          </Link>
        </p>
      </div>
    </PageShell>
  );
}
