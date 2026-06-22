import { APICallError, LoadAPIKeyError } from "@ai-sdk/provider";
import { convertToCoreMessages, streamText, type Message } from "ai";
import { CHAT_MODELS, getModel, type ChatModelId } from "@/lib/providers";

export const maxDuration = 60;

function isChatModelId(value: unknown): value is ChatModelId {
  return value === "openai" || value === "gemini";
}

function getHttpStatusFromError(error: unknown): number {
  if (LoadAPIKeyError.isInstance(error)) {
    return 401;
  }

  if (APICallError.isInstance(error)) {
    const { statusCode } = error;
    if (statusCode === 401 || statusCode === 403) return 401;
    if (statusCode === 429) return 429;
    if (statusCode && statusCode >= 500) return 502;
    if (statusCode && statusCode >= 400) return statusCode;
    return 502;
  }

  if (error instanceof SyntaxError) {
    return 400;
  }

  return 500;
}

function getErrorMessage(error: unknown): string {
  if (LoadAPIKeyError.isInstance(error)) {
    return "API key is missing or invalid. Check your environment variables.";
  }

  if (APICallError.isInstance(error)) {
    if (error.statusCode === 401 || error.statusCode === 403) {
      return "Invalid API key or insufficient permissions. Check your configuration.";
    }

    if (error.statusCode === 429) {
      return "Rate limit reached. Please try again in a few minutes.";
    }

    if (error.message) {
      return error.message;
    }

    return "Failed to communicate with the AI provider.";
  }

  if (error instanceof Error) {
    if (error.name === "AbortError" || error.message.toLowerCase().includes("timeout")) {
      return "The request timed out. Please try again.";
    }

    return error.message;
  }

  return "An unexpected error occurred. Please try again.";
}

function errorResponse(error: unknown) {
  return Response.json(
    { error: getErrorMessage(error) },
    { status: getHttpStatusFromError(error) },
  );
}

export async function POST(req: Request) {
  try {
    let body: unknown;

    try {
      body = await req.json();
    } catch {
      return Response.json(
        { error: "Invalid request body." },
        { status: 400 },
      );
    }

    const { messages, model } = body as {
      messages?: Message[];
      model?: unknown;
    };

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return Response.json(
        { error: "At least one message is required." },
        { status: 400 },
      );
    }

    const lastMessage = messages[messages.length - 1];
    const hasAttachments =
      Array.isArray(lastMessage.experimental_attachments) &&
      lastMessage.experimental_attachments.length > 0;

    if (
      lastMessage.role === "user" &&
      !lastMessage.content?.trim() &&
      !hasAttachments
    ) {
      return Response.json(
        { error: "Message must include text or an image." },
        { status: 400 },
      );
    }

    if (!isChatModelId(model)) {
      return Response.json(
        {
          error: `Invalid model. Options: ${Object.keys(CHAT_MODELS).join(", ")}`,
        },
        { status: 400 },
      );
    }

    const result = streamText({
      model: getModel(model),
      messages: convertToCoreMessages(messages),
    });

    return result.toDataStreamResponse({
      getErrorMessage: (error) => getErrorMessage(error),
    });
  } catch (error) {
    return errorResponse(error);
  }
}
