/**
 * Auditoría WCAG 2.2 (pautas WAI) sobre HTML público.
 * Comprueba criterios básicos de nivel A/AA: texto alternativo, nombre accesible y lang.
 */

export type WcagIssue = {
  level: "A" | "AA";
  criterion: string;
  message: string;
  snippet?: string;
};

export type WcagPageReport = {
  path: string;
  ok: boolean;
  issues: WcagIssue[];
  counts: { images: number; links: number; buttons: number };
};

const AUDIT_PATHS = ["/", "/tienda", "/packs", "/alojamientos", "/contacto", "/productos"];

function matchTags(html: string, tag: string): string[] {
  const re = new RegExp(`<${tag}\\b[^>]*>`, "gi");
  return html.match(re) ?? [];
}

function attr(tag: string, name: string): string | null {
  const re = new RegExp(`\\s${name}\\s*=\\s*("([^"]*)"|'([^']*)')`, "i");
  const m = tag.match(re);
  return m ? (m[2] ?? m[3] ?? "") : null;
}

export function auditHtml(path: string, html: string): WcagPageReport {
  const issues: WcagIssue[] = [];
  const lang = html.match(/<html\b[^>]*\blang\s*=\s*["']([^"']+)["']/i);
  if (!lang) {
    issues.push({
      level: "A",
      criterion: "3.1.1 Idioma de la página",
      message: "Falta el atributo lang en <html>.",
    });
  }

  const images = matchTags(html, "img");
  for (const tag of images) {
    const hidden = /aria-hidden\s*=\s*["']true["']/i.test(tag);
    const alt = attr(tag, "alt");
    if (hidden) continue;
    if (alt == null) {
      issues.push({
        level: "A",
        criterion: "1.1.1 Contenido no textual",
        message: "Imagen sin atributo alt.",
        snippet: tag.slice(0, 140),
      });
    } else if (alt.trim() === "") {
      issues.push({
        level: "A",
        criterion: "1.1.1 Contenido no textual",
        message: "Imagen con alt vacío (solo válido si es decorativa y está oculta a lectores).",
        snippet: tag.slice(0, 140),
      });
    }
  }

  const linkBlocks = html.match(/<a\b[^>]*>[\s\S]*?<\/a>/gi) ?? [];
  for (const block of linkBlocks) {
    const open = block.match(/<a\b[^>]*>/i)?.[0] ?? "";
    if (/aria-hidden\s*=\s*["']true["']/i.test(open)) continue;
    const inner = block.replace(/<a\b[^>]*>/i, "").replace(/<\/a>/i, "");
    const text = inner.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    const named = Boolean(attr(open, "aria-label")?.trim() || attr(open, "title")?.trim() || text);
    if (!named) {
      issues.push({
        level: "A",
        criterion: "2.4.4 Propósito de los enlaces",
        message: "Enlace sin texto visible, title ni aria-label.",
        snippet: block.slice(0, 160),
      });
    }
  }

  const buttonBlocks = html.match(/<button\b[^>]*>[\s\S]*?<\/button>/gi) ?? [];
  for (const block of buttonBlocks) {
    const open = block.match(/<button\b[^>]*>/i)?.[0] ?? "";
    if (/aria-hidden\s*=\s*["']true["']/i.test(open)) continue;
    const inner = block.replace(/<button\b[^>]*>/i, "").replace(/<\/button>/i, "");
    const text = inner.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    if (!attr(open, "aria-label")?.trim() && !attr(open, "title")?.trim() && !text) {
      issues.push({
        level: "A",
        criterion: "4.1.2 Nombre, función, valor",
        message: "Botón sin nombre accesible (texto, aria-label o title).",
        snippet: block.slice(0, 140),
      });
    }
  }

  return {
    path,
    ok: issues.length === 0,
    issues,
    counts: { images: images.length, links: linkBlocks.length, buttons: buttonBlocks.length },
  };
}

export async function auditPublicPages(baseUrl: string): Promise<WcagPageReport[]> {
  const origin = baseUrl.replace(/\/$/, "");
  const reports: WcagPageReport[] = [];
  for (const path of AUDIT_PATHS) {
    try {
      const res = await fetch(`${origin}${path}`, {
        headers: { Accept: "text/html" },
        redirect: "follow",
        cache: "no-store",
      });
      const html = await res.text();
      reports.push(auditHtml(path, html));
    } catch (error) {
      reports.push({
        path,
        ok: false,
        issues: [
          {
            level: "A",
            criterion: "Conectividad",
            message: error instanceof Error ? error.message : "No se pudo obtener la página.",
          },
        ],
        counts: { images: 0, links: 0, buttons: 0 },
      });
    }
  }
  return reports;
}
