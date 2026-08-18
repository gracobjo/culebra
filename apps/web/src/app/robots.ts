import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin/",
        "/cuenta/",
        "/panel/",
        "/checkout",
        "/carrito",
        "/login",
        "/register",
        "/pedido/",
      ],
    },
    sitemap: getSiteUrl("/sitemap.xml"),
  };
}
