export {
  assistantChatRequestSchema,
  handleAssistantChat,
  readAssistantConfig,
  isAssistantEnabled,
  searchFaq,
  FAQ_ENTRIES,
} from "./chat.service";

export type {
  AssistantChatInput,
  AssistantChatResult,
  AssistantProductSummary,
  ChatMessage,
} from "./types";
