export function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export async function createUniqueSlug(
  tradeName: string,
  exists: (slug: string) => Promise<boolean>,
  fallback = "item",
): Promise<string> {
  const base = slugify(tradeName) || fallback;
  let candidate = base;
  let suffix = 1;

  while (await exists(candidate)) {
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }

  return candidate;
}
