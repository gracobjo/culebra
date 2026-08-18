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
      className={`mx-auto w-full ${widths[width]} px-4 py-8 sm:px-6 sm:py-12 lg:py-16 ${className}`}
    >
      {children}
    </main>
  );
}
