import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import type { LanguageModelV1 } from "@ai-sdk/provider";

export type ChatModelId = "claude" | "gemini";

export const CHAT_MODELS: Record<
  ChatModelId,
  { label: string; modelId: string }
> = {
  claude: {
    label: "Claude Sonnet",
    modelId: "claude-3-5-sonnet-20241022",
  },
  gemini: {
    label: "Gemini",
    modelId: "gemini-2.0-flash",
  },
};

const anthropic = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

export function getModel(model: ChatModelId): LanguageModelV1 {
  const { modelId } = CHAT_MODELS[model];

  if (model === "claude") {
    return anthropic(modelId);
  }

  return google(modelId);
}
