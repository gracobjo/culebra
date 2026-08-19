"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";

type ChatRole = "user" | "assistant";

type ChatMessage = {
  role: ChatRole;
  content: string;
};

type ProductCard = {
  name: string;
  slug: string;
  price: string;
  shortDescription: string | null;
  url: string;
  imageUrl: string | null;
};

type ChatResponse = {
  message: string;
  products?: ProductCard[];
  mode?: "llm" | "fallback";
};

const STARTER_MESSAGE =
  "Hola, soy el asistente de Sabores de la Culebra. Puedo ayudarte a buscar productos del catálogo o resolver dudas sobre compras, envíos y pagos.";

const QUICK_PROMPTS = [
  "¿Qué métodos de pago aceptáis?",
  "Buscar miel local",
  "¿Cómo funciona el envío?",
  "Ver categorías de productos",
];

function isAssistantEnabledClient(): boolean {
  return process.env.NEXT_PUBLIC_ENABLE_ASSISTANT !== "false";
}

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: STARTER_MESSAGE },
  ]);
  const [products, setProducts] = useState<ProductCard[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (open && listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [open, messages, products, loading]);

  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
    }
  }, [open]);

  if (!isAssistantEnabledClient()) {
    return null;
  }

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) {
      return;
    }

    const nextMessages: ChatMessage[] = [...messages, { role: "user", content: trimmed }];
    setMessages(nextMessages);
    setInput("");
    setError(null);
    setLoading(true);
    setProducts([]);

    try {
      const response = await fetch("/api/assistant/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
      });

      const payload = (await response.json()) as ChatResponse & { error?: string };

      if (!response.ok) {
        throw new Error(payload.error || "No se pudo enviar el mensaje");
      }

      setMessages((current) => [
        ...current,
        { role: "assistant", content: payload.message },
      ]);
      setProducts(payload.products ?? []);
    } catch (sendError) {
      const message =
        sendError instanceof Error ? sendError.message : "Error de conexión";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    void sendMessage(input);
  }

  return (
    <>
      {open ? (
        <section
          id={panelId}
          role="dialog"
          aria-label="Asistente del marketplace"
          className="fixed bottom-24 right-4 z-[60] flex max-h-[min(32rem,calc(100dvh-7rem))] w-[min(100vw-2rem,24rem)] flex-col overflow-hidden rounded-2xl border border-stone-200 bg-[#fdfbf7] shadow-xl lg:bottom-6"
        >
          <header className="flex items-center justify-between gap-3 border-b border-stone-200 bg-[#065f46] px-4 py-3 text-white">
            <div>
              <p className="text-sm font-semibold">Asistente</p>
              <p className="text-xs text-emerald-100">Productos y ayuda</p>
            </div>
            <button
              type="button"
              className="rounded-full px-2 py-1 text-sm text-emerald-100 hover:bg-emerald-800"
              onClick={() => setOpen(false)}
              aria-label="Cerrar asistente"
            >
              ✕
            </button>
          </header>

          <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[90%] rounded-2xl px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap ${
                    message.role === "user"
                      ? "bg-[#065f46] text-white"
                      : "bg-white text-stone-800 shadow-sm ring-1 ring-stone-200"
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}

            {products.length ? (
              <div className="space-y-2">
                <p className="text-xs font-medium uppercase tracking-wide text-stone-500">
                  Productos sugeridos
                </p>
                {products.map((product) => (
                  <Link
                    key={product.slug}
                    href={product.url}
                    className="flex gap-3 rounded-xl border border-stone-200 bg-white p-2 transition hover:border-emerald-700"
                  >
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-stone-100">
                      {product.imageUrl ? (
                        <Image
                          src={product.imageUrl}
                          alt={product.name}
                          fill
                          sizes="56px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-xs text-stone-400">
                          Foto
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-stone-900">
                        {product.name}
                      </p>
                      <p className="text-sm text-emerald-800">{product.price}</p>
                      {product.shortDescription ? (
                        <p className="line-clamp-2 text-xs text-stone-500">
                          {product.shortDescription}
                        </p>
                      ) : null}
                    </div>
                  </Link>
                ))}
              </div>
            ) : null}

            {loading ? (
              <p className="text-sm text-stone-500" aria-live="polite">
                Escribiendo…
              </p>
            ) : null}

            {error ? (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
                {error}
              </p>
            ) : null}
          </div>

          {messages.length <= 1 ? (
            <div className="flex flex-wrap gap-2 border-t border-stone-100 px-4 py-2">
              {QUICK_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  className="rounded-full border border-stone-200 bg-white px-3 py-1 text-xs text-stone-700 hover:border-emerald-700"
                  onClick={() => void sendMessage(prompt)}
                  disabled={loading}
                >
                  {prompt}
                </button>
              ))}
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="border-t border-stone-200 p-3">
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                rows={2}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Escribe tu pregunta…"
                className="min-h-[2.75rem] flex-1 resize-none rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm text-stone-800"
                maxLength={2000}
                disabled={loading}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    void sendMessage(input);
                  }
                }}
              />
              <button
                type="submit"
                className="btn btn-primary shrink-0 px-4 py-2 text-sm"
                disabled={loading || !input.trim()}
              >
                Enviar
              </button>
            </div>
          </form>
        </section>
      ) : null}

      <button
        type="button"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        className="fixed bottom-24 right-4 z-[60] flex h-14 w-14 items-center justify-center rounded-full bg-[#065f46] text-2xl text-white shadow-lg transition hover:bg-emerald-900 lg:bottom-6"
        onClick={() => setOpen((value) => !value)}
        aria-label={open ? "Cerrar asistente" : "Abrir asistente"}
      >
        {open ? "✕" : "💬"}
      </button>
    </>
  );
}
