import { formatFaqContext, searchFaq } from "./faq";
import { toolListCategories, toolSearchProducts } from "./tools";
import type { AssistantChatInput, AssistantChatResult, AssistantProductSummary } from "./types";

const PRODUCT_HINTS =
  /\b(producto|productos|comprar|catalogo|catálogo|queso|quesos|embutido|embutidos|miel|conserva|conservas|precio|precios|artesano|productor|busca|buscar|recomienda|recomendar|tienes|tenéis|hay)\b/i;

function lastUserMessage(messages: AssistantChatInput["messages"]): string {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    if (messages[index]?.role === "user") {
      return messages[index].content.trim();
    }
  }
  return "";
}

function extractSearchTerms(message: string): string {
  return message
    .replace(/\?/g, " ")
    .replace(/\b(qué|que|como|cómo|cuanto|cuánto|donde|dónde|hay|tienes|tenéis|busco|buscar|productos|producto)\b/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function buildProductLines(products: AssistantProductSummary[]): string {
  if (!products.length) {
    return "No he encontrado productos que coincidan con tu búsqueda. Prueba con otra palabra o explora /productos.";
  }

  const lines = products.slice(0, 5).map((product) => {
    const parts = [product.name, product.price];
    if (product.vendorName) {
      parts.push(`de ${product.vendorName}`);
    }
    if (product.origin) {
      parts.push(`(${product.origin})`);
    }
    return `- ${parts.join(" · ")} → ${product.url}`;
  });

  const suffix =
    products.length > 5
      ? `\n\nHay ${products.length} resultados relevantes; puedes ver más en el catálogo.`
      : "";

  return `${lines.join("\n")}${suffix}`;
}

export async function runFallbackChat(input: AssistantChatInput): Promise<AssistantChatResult> {
  const userMessage = lastUserMessage(input.messages);
  if (!userMessage) {
    return {
      message:
        "Hola, soy el asistente del marketplace. Puedo ayudarte con dudas sobre compras, envíos o a buscar productos del catálogo.",
      products: [],
      mode: "fallback",
    };
  }

  const faqMatches = searchFaq(userMessage, 2);
  const bestFaq = faqMatches[0];
  const wantsProducts = PRODUCT_HINTS.test(userMessage);
  let products: AssistantProductSummary[] = [];

  if (wantsProducts || !bestFaq || bestFaq.score < 4) {
    const search = extractSearchTerms(userMessage);
    if (search.length >= 2) {
      const result = await toolSearchProducts({
        search,
        limit: 6,
        appBaseUrl: input.appBaseUrl,
      });
      products = result.items;
    }
  }

  if (products.length) {
    const intro = wantsProducts
      ? "Estos productos del catálogo pueden interesarte:"
      : "Además, he encontrado productos relacionados:";
    return {
      message: `${intro}\n\n${buildProductLines(products)}`,
      products,
      mode: "fallback",
    };
  }

  if (bestFaq && bestFaq.score >= 3) {
    return {
      message: bestFaq.answer,
      products: [],
      mode: "fallback",
    };
  }

  if (/\bcategor/i.test(userMessage)) {
    const categories = await toolListCategories();
    if (categories.length) {
      const lines = categories
        .slice(0, 8)
        .map((category) => `- ${category.name} (/categorias/${category.slug})`)
        .join("\n");
      return {
        message: `Estas son algunas categorías disponibles:\n\n${lines}\n\nExplora el catálogo completo en /productos.`,
        products: [],
        mode: "fallback",
      };
    }
  }

  const faqContext = formatFaqContext(searchFaq("ayuda comprar envio pago", 2));
  return {
    message:
      "No estoy seguro de haber entendido tu consulta. Puedo ayudarte a buscar productos o responder dudas sobre pagos, envíos y devoluciones. ¿Puedes concretar un poco más?\n\n" +
      (faqContext ? `Por ejemplo:\n${faqContext}` : ""),
    products: [],
    mode: "fallback",
  };
}
