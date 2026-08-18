"use client";

import { useActionState } from "react";
import {
  registerAction,
  type RegisterActionState,
} from "@/app/register/actions";

const initialState: RegisterActionState = {};

export function RegisterForm() {
  const [state, formAction, pending] = useActionState(
    registerAction,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="firstName">
            Nombre
          </label>
          <input
            id="firstName"
            name="firstName"
            className="w-full rounded-xl border border-stone-300 px-4 py-3"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="lastName">
            Apellidos
          </label>
          <input
            id="lastName"
            name="lastName"
            className="w-full rounded-xl border border-stone-300 px-4 py-3"
          />
        </div>
      </div>
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
          minLength={8}
          className="w-full rounded-xl border border-stone-300 px-4 py-3"
        />
        <p className="mt-1 text-xs text-stone-500">
          Minimo 8 caracteres, con letras y numeros.
        </p>
      </div>
      {state.error ? <p className="text-sm text-red-700">{state.error}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-emerald-800 px-5 py-3 text-sm font-medium text-white disabled:opacity-60"
      >
        {pending ? "Creando cuenta..." : "Crear cuenta"}
      </button>
    </form>
  );
}
