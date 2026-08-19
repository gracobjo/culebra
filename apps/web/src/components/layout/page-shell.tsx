type PageShellProps = {
  children: React.ReactNode;
  width?: "sm" | "md" | "lg" | "xl" | "full";
  className?: string;
};

const widths = {
  sm: "max-w-md",
  md: "max-w-3xl",
  lg: "max-w-4xl",
  xl: "max-w-5xl",
  full: "max-w-6xl",
};

export function PageShell({
  children,
  width = "full",
  className = "",
}: PageShellProps) {
  return (
    <main
      className={`site-container py-8 sm:py-12 lg:py-16 ${widths[width]} ${className}`}
    >
      {children}
    </main>
  );
}
