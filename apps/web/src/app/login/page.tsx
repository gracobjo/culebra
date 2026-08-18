import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-16">
      <div className="rounded-3xl border border-stone-200 bg-white p-8 shadow-sm">
        <p className="text-sm uppercase tracking-[0.2em] text-emerald-800">
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
    </main>
  );
}
