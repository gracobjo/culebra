"use client";

export function SimulatorResetButton({
  onReset,
  label = "Restablecer",
  hint = "Volver a los valores iniciales del simulador",
  className = "",
}: {
  onReset: () => void;
  label?: string;
  hint?: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onReset}
      className={`a11y-hint min-h-9 rounded-full border border-stone-300 bg-white px-3 text-xs font-medium text-stone-800 hover:border-emerald-800 hover:bg-stone-50 ${className}`.trim()}
      data-hint={hint}
      title={hint}
      aria-label={hint}
    >
      {label}
    </button>
  );
}
