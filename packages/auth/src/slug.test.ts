import { describe, expect, it } from "vitest";

import { createUniqueSlug, slugify } from "./slug.js";

describe("slugify", () => {
  it("normaliza acentos y espacios", () => {
    expect(slugify("Queso Curado Artesanal")).toBe("queso-curado-artesanal");
    expect(slugify("Embutidos de la Culebra")).toBe("embutidos-de-la-culebra");
  });

  it("elimina caracteres invalidos", () => {
    expect(slugify("  --Hola!! Mundo--  ")).toBe("hola-mundo");
  });
});

describe("createUniqueSlug", () => {
  it("anade sufijo cuando el slug ya existe", async () => {
    const taken = new Set(["queso-curado", "queso-curado-1"]);
    const slug = await createUniqueSlug("Queso Curado", async (candidate) =>
      taken.has(candidate),
    );
    expect(slug).toBe("queso-curado-2");
  });
});
