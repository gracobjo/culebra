import { z } from "zod";

import { readAssistantConfig } from "./config";
import { runFallbackChat } from "./fallback";
import { runLlmChat } from "./openai";
import type { AssistantChatInput, AssistantChatResult } from "./types";

export const assistantChatRequestSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().trim().min(1).max(2000),
      }),
    )
    .min(1)
    .max(20),
});

export async function handleAssistantChat(
  input: AssistantChatInput,
  env: NodeJS.ProcessEnv = process.env,
): Promise<AssistantChatResult> {
  const config = readAssistantConfig(env);

  if (config.llmEnabled) {
    try {
      return await runLlmChat(input, {
        apiKey: config.apiKey,
        apiBaseUrl: config.apiBaseUrl,
        model: config.model,
        useTools: config.useTools,
      });
    } catch (error) {
      console.error("[assistant] LLM falló, usando fallback:", error);
      return runFallbackChat(input);
    }
  }

  return runFallbackChat(input);
}

export { readAssistantConfig, isAssistantEnabled } from "./config";
export { searchFaq, FAQ_ENTRIES } from "./faq";
export type {
  AssistantChatInput,
  AssistantChatResult,
  AssistantProductSummary,
  ChatMessage,
} from "./types";
