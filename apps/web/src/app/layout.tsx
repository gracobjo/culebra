import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import { SiteShell } from "@/components/layout/site-shell";
import { buildPageMetadata, getSiteUrl, siteConfig } from "@/lib/site";

const manrope = Manrope({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

export const metadata: Metadata = {
  ...buildPageMetadata({
    title: siteConfig.name,
    description: siteConfig.description,
    path: "/",
  }),
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.shortName}`,
  },
  metadataBase: new URL(getSiteUrl("/")),
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#f7f4ee",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={manrope.variable}>
      <body
        className={`${manrope.className} flex min-h-screen min-h-dvh flex-col overflow-x-hidden antialiased`}
      >
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
