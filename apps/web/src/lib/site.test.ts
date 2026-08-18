import { afterEach, describe, expect, it } from "vitest";

import { buildPageMetadata, getSiteUrl } from "@/lib/site";

describe("site helpers", () => {
  const previousUrl = process.env.NEXT_PUBLIC_APP_URL;

  afterEach(() => {
    process.env.NEXT_PUBLIC_APP_URL = previousUrl;
  });

  it("getSiteUrl normaliza rutas", () => {
    process.env.NEXT_PUBLIC_APP_URL = "https://example.com/";
    expect(getSiteUrl("/productos")).toBe("https://example.com/productos");
    expect(getSiteUrl()).toBe("https://example.com/");
  });

  it("buildPageMetadata incluye canonical y robots", () => {
    process.env.NEXT_PUBLIC_APP_URL = "https://example.com";
    const metadata = buildPageMetadata({
      title: "Catalogo",
      description: "Productos locales",
      path: "/productos",
    });
    expect(metadata.alternates?.canonical).toBe("https://example.com/productos");
    expect(metadata.robots).toEqual({ index: true, follow: true });
  });
});
