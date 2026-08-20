"use client";

import { signOutAction } from "@/app/actions/auth";

type SignOutButtonProps = {
  className?: string;
  formClassName?: string;
  label?: string;
};

export function SignOutButton({
  className = "min-h-11 rounded-full border border-stone-300 px-5 py-3 text-sm font-medium",
  formClassName = "",
  label = "Cerrar sesion",
}: SignOutButtonProps) {
  return (
    <form action={signOutAction} className={`inline-form ${formClassName}`.trim()}>
      <button type="submit" className={className}>
        {label}
      </button>
    </form>
  );
}
