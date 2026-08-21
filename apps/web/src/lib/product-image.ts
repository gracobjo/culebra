/**
 * Normaliza URLs de imagen de producto para servirlas desde el origen actual.
 * Evita roturas en local cuando NEXT_PUBLIC_APP_URL apunta a :3000 y Next
 * arranca en otro puerto (p. ej. :3001).
 */
export function toPublicImageSrc(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return trimmed;
  if (trimmed.startsWith("/") || trimmed.startsWith("blob:")) return trimmed;

  try {
    const parsed = new URL(trimmed);
    if (
      parsed.pathname.startsWith("/uploads/") &&
      (parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1")
    ) {
      return parsed.pathname;
    }
  } catch {
    // URL no parseable: devolver tal cual
  }

  return trimmed;
}
