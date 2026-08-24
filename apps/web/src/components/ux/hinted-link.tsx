import Link, { type LinkProps } from "next/link";
import type { ReactNode, HTMLAttributeAnchorTarget } from "react";

type HintedLinkProps = LinkProps & {
  children: ReactNode;
  className?: string;
  hint: string;
  target?: HTMLAttributeAnchorTarget;
  rel?: string;
};

/** Enlace con title, aria-label y mensaje visible al pasar el ratón o enfocar. */
export function HintedLink({ hint, className = "", children, ...props }: HintedLinkProps) {
  return (
    <Link
      {...props}
      title={hint}
      aria-label={hint}
      data-hint={hint}
      className={`a11y-hint ${className}`.trim()}
    >
      {children}
    </Link>
  );
}
