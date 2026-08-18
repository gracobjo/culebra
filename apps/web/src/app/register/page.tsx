import Link from "next/link";
import { RegisterForm } from "@/components/auth/register-form";

export default function RegisterPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-16">
      <div className="rounded-3xl border border-stone-200 bg-white p-8 shadow-sm">
        <p className="text-sm uppercase tracking-[0.2em] text-emerald-800">
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
    </main>
  );
}
