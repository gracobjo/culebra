"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Credenciales invalidas.");
      return;
    }

    router.push("/cuenta");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="w-full rounded-xl border border-stone-300 px-4 py-3"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium" htmlFor="password">
          Contrasena
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          className="w-full rounded-xl border border-stone-300 px-4 py-3"
        />
      </div>
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-full bg-emerald-800 px-5 py-3 text-sm font-medium text-white disabled:opacity-60"
      >
        {loading ? "Entrando..." : "Iniciar sesion"}
      </button>
    </form>
  );
}
