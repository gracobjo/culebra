"use client";

import { useFormStatus } from "react-dom";

type SandboxSubmitButtonProps = {
  label: string;
  pendingLabel?: string;
  className?: string;
  disabled?: boolean;
  title?: string;
};

export function SandboxSubmitButton({
  label,
  pendingLabel = "Procesando…",
  className = "btn btn-primary",
  disabled = false,
  title,
}: SandboxSubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      className={`${className} disabled:cursor-not-allowed disabled:opacity-50`}
      disabled={disabled || pending}
      title={title}
      aria-busy={pending}
    >
      {pending ? pendingLabel : label}
    </button>
  );
}
