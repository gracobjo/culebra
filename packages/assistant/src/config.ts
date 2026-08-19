export type AssistantConfig = {
  enabled: boolean;
  llmEnabled: boolean;
  apiKey: string;
  apiBaseUrl: string;
  model: string;
  useTools: boolean;
  rateLimitMax: number;
  marketplaceName: string;
};

function isLocalApiBaseUrl(url: string): boolean {
  try {
    const host = new URL(url).hostname;
    return host === "localhost" || host === "127.0.0.1" || host === "::1";
  } catch {
    return false;
  }
}

function normalizeApiBaseUrl(value: string): string {
  return value.replace(/\/+$/, "");
}

export function readAssistantConfig(env: NodeJS.ProcessEnv = process.env): AssistantConfig {
  const enabled = env.ENABLE_ASSISTANT !== "false";
  const apiBaseUrl = normalizeApiBaseUrl(
    env.ASSISTANT_API_BASE_URL?.trim() ||
      env.OPENAI_BASE_URL?.trim() ||
      "https://api.openai.com/v1",
  );
  const isLocal = isLocalApiBaseUrl(apiBaseUrl);
  const apiKey =
    env.ASSISTANT_API_KEY?.trim() ||
    env.OPENAI_API_KEY?.trim() ||
    (isLocal ? "lm-studio" : "");

  const useToolsEnv = env.ASSISTANT_USE_TOOLS?.trim().toLowerCase();
  const useTools =
    useToolsEnv === "true" ? true : useToolsEnv === "false" ? false : !isLocal;

  const model =
    env.ASSISTANT_MODEL?.trim() ||
    (isLocal ? "qwen2.5-3b-instruct" : "gpt-4o-mini");
  const rateLimitMax = Number(env.ASSISTANT_RATE_LIMIT_MAX ?? "30");
  const llmEnabled = Boolean(apiKey) || isLocal;

  return {
    enabled,
    llmEnabled,
    apiKey,
    apiBaseUrl,
    model,
    useTools,
    rateLimitMax: Number.isFinite(rateLimitMax) && rateLimitMax > 0 ? rateLimitMax : 30,
    marketplaceName:
      env.MARKETPLACE_NAME?.trim() ||
      env.NEXT_PUBLIC_MARKETPLACE_NAME?.trim() ||
      "Sabores de la Culebra",
  };
}

export function isAssistantEnabled(env: NodeJS.ProcessEnv = process.env): boolean {
  return readAssistantConfig(env).enabled;
}
