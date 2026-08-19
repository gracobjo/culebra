import { NextResponse } from "next/server";

import {
  assistantChatRequestSchema,
  handleAssistantChat,
  isAssistantEnabled,
  readAssistantConfig,
} from "@culebra/assistant";

import { getSiteUrl } from "@/lib/site";

type RateBucket = {
  count: number;
  resetAt: number;
};

const rateBuckets = new Map<string, RateBucket>();

function getClientKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }
  return request.headers.get("x-real-ip") || "local";
}

function isRateLimited(key: string, max: number): boolean {
  const now = Date.now();
  const windowMs = 60_000;
  const bucket = rateBuckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    rateBuckets.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }

  bucket.count += 1;
  if (bucket.count > max) {
    return true;
  }

  return false;
}

export async function POST(request: Request) {
  if (!isAssistantEnabled()) {
    return NextResponse.json({ error: "Asistente deshabilitado" }, { status: 503 });
  }

  const config = readAssistantConfig();
  const clientKey = getClientKey(request);
  if (isRateLimited(clientKey, config.rateLimitMax)) {
    return NextResponse.json(
      { error: "Demasiadas solicitudes. Espera un momento e inténtalo de nuevo." },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const parsed = assistantChatRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Petición inválida", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const result = await handleAssistantChat({
      messages: parsed.data.messages,
      appBaseUrl: getSiteUrl("/").replace(/\/$/, ""),
      marketplaceName: config.marketplaceName,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("[api/assistant/chat]", error);
    return NextResponse.json(
      { error: "No se pudo procesar la consulta. Inténtalo de nuevo." },
      { status: 500 },
    );
  }
}
