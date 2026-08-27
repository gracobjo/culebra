"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

type SessionPayload = { user?: { roles?: string[] } };

async function waitForSession(retries = 8): Promise<SessionPayload["user"] | null> {
  for (let i = 0; i < retries; i++) {
    const sessionRes = await fetch("/api/auth/session", { cache: "no-store" });
    if (sessionRes.ok) {
      const session = (await sessionRes.json()) as SessionPayload;
      if (session?.user) return session.user;
    }
    await new Promise((r) => setTimeout(r, 200));
  }
  return null;
}

function resolvePostLoginPath(roles: string[], callbackUrl: string | null): string {
  if (roles.includes("ADMIN")) return "/admin";
  if (roles.includes("VENDOR")) return "/panel/proveedor";
  if (callbackUrl?.startsWith("/") && !callbackUrl.startsWith("//")) {
    return callbackUrl;
  }
  return "/cuenta";
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setLoading(false);
      setError("Credenciales invalidas. Revisa email y contraseña.");
      return;
    }

    const user = await waitForSession();
    if (!user) {
      setLoading(false);
      setError("Sesión no disponible. Recarga e inténtalo de nuevo.");
      return;
    }

    const path = resolvePostLoginPath(user.roles ?? [], searchParams.get("callbackUrl"));
    // Navegación completa para que el middleware vea la cookie de sesión.
    window.location.assign(path);
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
          type="text"
          inputMode="email"
          autoComplete="username"
          required
          placeholder="laura.garcia@example.com"
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
          autoComplete="current-password"
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
