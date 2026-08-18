import type { Metadata } from "next";

export const siteConfig = {
  name: "Sierra de la Culebra Marketplace",
  shortName: "Sierra de la Culebra",
  description:
    "Marketplace de productos tradicionales y agroalimentarios de la Sierra de la Culebra. Compra directa a productores locales.",
  locale: "es_ES",
  region: "Sierra de la Culebra, Zamora",
  keywords: [
    "Sierra de la Culebra",
    "marketplace",
    "productos locales",
    "agroalimentario",
    "Villardeciervos",
    "Zamora",
    "embutidos",
    "quesos",
    "miel",
  ],
};

export function getSiteUrl(path = "/"): string {
  const base = (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(
    /\/$/,
    "",
  );
  if (!path || path === "/") {
    return `${base}/`;
  }
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

type PageMetadataInput = {
  title: string;
  description: string;
  path: string;
  image?: string;
  noIndex?: boolean;
};

export function buildPageMetadata({
  title,
  description,
  path,
  image,
  noIndex = false,
}: PageMetadataInput): Metadata {
  const canonical = getSiteUrl(path);
  const openGraph: Metadata["openGraph"] = {
    title,
    description,
    url: canonical,
    locale: siteConfig.locale,
    type: "website",
    siteName: siteConfig.name,
  };
  if (image) {
    openGraph.images = [{ url: image }];
  }

  const twitter: NonNullable<Metadata["twitter"]> = {
    card: image ? "summary_large_image" : "summary",
    title,
    description,
  };
  if (image) {
    twitter.images = [image];
  }

  return {
    title,
    description,
    keywords: siteConfig.keywords,
    alternates: { canonical },
    openGraph,
    twitter,
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
  };
}

export const privateAreaMetadata: Metadata = {
  robots: { index: false, follow: false },
};
