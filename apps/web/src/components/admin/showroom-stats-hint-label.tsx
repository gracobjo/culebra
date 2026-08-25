"use client";

import { useId } from "react";

/** Etiqueta con definición visible, tooltip al hover/foco y soporte para lectores de pantalla. */
export function ShowroomStatsHintLabel({
  label,
  hint,
  htmlFor,
  as = "label",
  compact,
}: {
  label: string;
  hint: string;
  htmlFor?: string;
  as?: "label" | "span";
  compact?: boolean;
}) {
  const hintId = useId();
  const Tag = as;

  return (
    <>
      <Tag
        {...(htmlFor ? { htmlFor } : {})}
        className={
          compact
            ? "a11y-hint block min-h-[2.5rem] cursor-help text-xs font-medium leading-snug text-stone-700 break-words"
            : "a11y-hint block cursor-help font-medium text-stone-700"
        }
        data-hint={hint}
        title={hint}
      >
        {label}
        <span className="sr-only">. {hint}</span>
      </Tag>
      <p id={hintId} className="mt-0.5 text-xs leading-snug text-stone-500">
        {hint}
      </p>
    </>
  );
}

export function ShowroomStatsHintButton({
  label,
  hint,
  className,
  disabled,
  type = "button",
  ...rest
}: {
  label: string;
  hint: string;
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit";
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={`a11y-hint ${className ?? ""}`}
      data-hint={hint}
      title={hint}
      aria-label={`${label}. ${hint}`}
      {...rest}
    >
      {label}
    </button>
  );
}

export function ShowroomStatsHintLink({
  href,
  label,
  hint,
  className,
}: {
  href: string;
  label: string;
  hint: string;
  className?: string;
}) {
  return (
    <a
      href={href}
      className={`a11y-hint ${className ?? ""}`}
      data-hint={hint}
      title={hint}
      aria-label={`${label}. ${hint}`}
    >
      {label}
    </a>
  );
}
