export type ChatRole = "user" | "assistant";

export type ChatMessage = {
  role: ChatRole;
  content: string;
};

export type AssistantProductSummary = {
  name: string;
  slug: string;
  price: string;
  shortDescription: string | null;
  categoryName: string | null;
  vendorName: string | null;
  origin: string | null;
  stock: number;
  url: string;
  imageUrl: string | null;
};

export type AssistantCategorySummary = {
  name: string;
  slug: string;
  description: string | null;
};

export type FaqEntry = {
  id: string;
  question: string;
  answer: string;
  keywords: string[];
};

export type FaqMatch = {
  id: string;
  question: string;
  answer: string;
  score: number;
};

export type AssistantMode = "llm" | "fallback";

export type AssistantChatInput = {
  messages: ChatMessage[];
  appBaseUrl: string;
  marketplaceName: string;
};

export type AssistantChatResult = {
  message: string;
  products: AssistantProductSummary[];
  mode: AssistantMode;
};
