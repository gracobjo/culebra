import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sierra de la Culebra Marketplace",
  description:
    "Marketplace multi-vendedor de productos autenticos de la Sierra de la Culebra.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
