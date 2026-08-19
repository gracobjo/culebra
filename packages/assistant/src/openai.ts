import { formatFaqContext, searchFaq } from "./faq";
import { executeTool, OPENAI_TOOLS, toolListCategories, toolSearchProducts } from "./tools";
import type { AssistantChatInput, AssistantChatResult, AssistantProductSummary } from "./types";

type LlmOptions = {
  apiKey: string;
  apiBaseUrl: string;
  model: string;
  useTools: boolean;
};

type OpenAiMessage =
  | { role: "system" | "user" | "assistant"; content: string }
  | {
      role: "assistant";
      content: string | null;
      tool_calls?: Array<{
        id: string;
        type: "function";
        function: { name: string; arguments: string };
      }>;
    }
  | { role: "tool"; tool_call_id: string; content: string };

type OpenAiResponse = {
  choices: Array<{
    message: {
      role: "assistant";
      content: string | null;
      tool_calls?: Array<{
        id: string;
        type: "function";
        function: { name: string; arguments: string };
      }>;
    };
    finish_reason: string;
  }>;
};

function chatCompletionsUrl(apiBaseUrl: string): string {
  return `${apiBaseUrl.replace(/\/+$/, "")}/chat/completions`;
}

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
    .replace(
      /\b(qué|que|como|cómo|cuanto|cuánto|donde|dónde|hay|tienes|tenéis|busco|buscar|productos|producto)\b/gi,
      " ",
    )
    .replace(/\s+/g, " ")
    .trim();
}

function buildSystemPrompt(input: AssistantChatInput, extraContext = ""): string {
  const faqContext = formatFaqContext(searchFaq("comprar envio pago devolucion cuenta productor", 4));

  const lines = [
    `Eres el asistente virtual de "${input.marketplaceName}", marketplace de productos locales de la Sierra de la Culebra (Zamora).`,
    "Responde siempre en español, de forma clara y breve (máximo 3 párrafos cortos).",
    "Incluye enlaces relativos cuando menciones rutas (p. ej. /productos, /carrito).",
    "No inventes productos, precios ni políticas: usa solo los datos del contexto.",
    "Si no puedes ayudar, indica amablemente que contacte con el email del marketplace.",
    "",
    "Contexto FAQ general:",
    faqContext || "(sin entradas FAQ)",
  ];

  if (extraContext) {
    lines.push("", "Datos consultados para esta pregunta:", extraContext);
  }

  if (!extraContext) {
    lines.push(
      "",
      "Si el usuario pregunta por productos, usa search_products o get_product antes de responder.",
      "Si pregunta sobre envíos, pagos, devoluciones o cómo usar la web, usa search_faq.",
    );
  }

  return lines.join("\n");
}

async function buildInjectedContext(
  input: AssistantChatInput,
): Promise<{ context: string; products: AssistantProductSummary[] }> {
  const userMessage = lastUserMessage(input.messages);
  const products: AssistantProductSummary[] = [];
  const sections: string[] = [];

  if (!userMessage) {
    return { context: "", products };
  }

  const faqMatches = searchFaq(userMessage, 3);
  if (faqMatches.length) {
    sections.push(formatFaqContext(faqMatches));
  }

  const search = extractSearchTerms(userMessage);
  if (search.length >= 2 || /\b(producto|busca|comprar|catalogo|catálogo|queso|miel|embutido)\b/i.test(userMessage)) {
    const result = await toolSearchProducts({
      search: search.length >= 2 ? search : userMessage.slice(0, 80),
      limit: 6,
      appBaseUrl: input.appBaseUrl,
    });
    products.push(...result.items);

    if (result.items.length) {
      const lines = result.items.map((product) => {
        const parts = [product.name, product.price];
        if (product.vendorName) parts.push(`de ${product.vendorName}`);
        if (product.origin) parts.push(`(${product.origin})`);
        parts.push(`→ ${product.url}`);
        return `- ${parts.join(" · ")}`;
      });
      sections.push(`Productos del catálogo (${result.total} en total):\n${lines.join("\n")}`);
    }
  }

  if (/\bcategor/i.test(userMessage)) {
    const categories = await toolListCategories();
    if (categories.length) {
      const lines = categories
        .slice(0, 10)
        .map((category) => `- ${category.name} (/categorias/${category.slug})`)
        .join("\n");
      sections.push(`Categorías:\n${lines}`);
    }
  }

  return {
    context: sections.join("\n\n"),
    products: dedupeProducts(products),
  };
}

function collectProductsFromToolResult(
  toolName: string,
  result: unknown,
  bucket: AssistantProductSummary[],
): void {
  if (toolName === "search_products" && result && typeof result === "object") {
    const items = (result as { items?: AssistantProductSummary[] }).items ?? [];
    bucket.push(...items);
    return;
  }

  if (toolName === "get_product" && result && typeof result === "object" && "slug" in result) {
    bucket.push(result as AssistantProductSummary);
  }
}

async function callChatCompletions(
  options: LlmOptions,
  body: Record<string, unknown>,
): Promise<OpenAiResponse> {
  const response = await fetch(chatCompletionsUrl(options.apiBaseUrl), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${options.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`LLM error ${response.status}: ${errorText.slice(0, 400)}`);
  }

  return (await response.json()) as OpenAiResponse;
}

async function runSimpleLlmChat(
  input: AssistantChatInput,
  options: LlmOptions,
): Promise<AssistantChatResult> {
  const injected = await buildInjectedContext(input);
  const messages: OpenAiMessage[] = [
    { role: "system", content: buildSystemPrompt(input, injected.context) },
    ...input.messages.map((message) => ({
      role: message.role,
      content: message.content,
    })),
  ];

  const payload = await callChatCompletions(options, {
    model: options.model,
    temperature: 0.2,
    max_tokens: 600,
    messages,
  });

  const choice = payload.choices[0];
  if (!choice) {
    throw new Error("El modelo no devolvió respuesta");
  }

  const content =
    choice.message.content?.trim() ||
    "No he podido generar una respuesta. ¿Puedes reformular tu pregunta?";

  return {
    message: content,
    products: injected.products,
    mode: "llm",
  };
}

async function runToolLlmChat(
  input: AssistantChatInput,
  options: LlmOptions,
): Promise<AssistantChatResult> {
  const collectedProducts: AssistantProductSummary[] = [];
  const messages: OpenAiMessage[] = [
    { role: "system", content: buildSystemPrompt(input) },
    ...input.messages.map((message) => ({
      role: message.role,
      content: message.content,
    })),
  ];

  for (let round = 0; round < 4; round += 1) {
    const payload = await callChatCompletions(options, {
      model: options.model,
      temperature: 0.3,
      messages,
      tools: OPENAI_TOOLS,
      tool_choice: "auto",
    });

    const choice = payload.choices[0];
    if (!choice) {
      throw new Error("El modelo no devolvió respuesta");
    }

    const assistantMessage = choice.message;
    messages.push(assistantMessage);

    if (assistantMessage.tool_calls?.length) {
      for (const toolCall of assistantMessage.tool_calls) {
        let parsedArgs: Record<string, unknown> = {};
        try {
          parsedArgs = JSON.parse(toolCall.function.arguments || "{}") as Record<string, unknown>;
        } catch {
          parsedArgs = {};
        }

        const toolResult = await executeTool(toolCall.function.name, parsedArgs, {
          appBaseUrl: input.appBaseUrl,
        });
        collectProductsFromToolResult(toolCall.function.name, toolResult, collectedProducts);

        messages.push({
          role: "tool",
          tool_call_id: toolCall.id,
          content: JSON.stringify(toolResult),
        });
      }
      continue;
    }

    const content =
      assistantMessage.content?.trim() ||
      "No he podido generar una respuesta. ¿Puedes reformular tu pregunta?";

    return {
      message: content,
      products: dedupeProducts(collectedProducts),
      mode: "llm",
    };
  }

  const uniqueProducts = dedupeProducts(collectedProducts);
  if (uniqueProducts.length) {
    return {
      message: buildProductFallbackMessage(uniqueProducts),
      products: uniqueProducts,
      mode: "llm",
    };
  }

  return {
    message: "He consultado el catálogo pero necesito un poco más de detalle para ayudarte.",
    products: [],
    mode: "llm",
  };
}

export async function runLlmChat(
  input: AssistantChatInput,
  options: LlmOptions,
): Promise<AssistantChatResult> {
  if (options.useTools) {
    return runToolLlmChat(input, options);
  }
  return runSimpleLlmChat(input, options);
}

/** @deprecated Use runLlmChat */
export const runOpenAiChat = runLlmChat;

function dedupeProducts(products: AssistantProductSummary[]): AssistantProductSummary[] {
  const seen = new Set<string>();
  return products.filter((product) => {
    if (seen.has(product.slug)) {
      return false;
    }
    seen.add(product.slug);
    return true;
  });
}

function buildProductFallbackMessage(products: AssistantProductSummary[]): string {
  const lines = products
    .slice(0, 5)
    .map((product) => `- ${product.name} (${product.price}) → ${product.url}`);
  return `Estos productos pueden encajar con tu consulta:\n\n${lines.join("\n")}`;
}
