import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import type { LanguageModelV1 } from "@ai-sdk/provider";

export type ChatModelId = "openai" | "gemini";

export const CHAT_MODELS: Record<
  ChatModelId,
  { label: string; modelId: string }
> = {
  openai: {
    label: "ChatGPT",
    modelId: "gpt-4o-mini",
  },
  gemini: {
    label: "Gemini",
    modelId: "gemini-2.0-flash",
  },
};

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

export function getModel(model: ChatModelId): LanguageModelV1 {
  const { modelId } = CHAT_MODELS[model];

  if (model === "openai") {
    return openai(modelId);
  }

  return google(modelId);
}
