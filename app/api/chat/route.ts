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
    return "API key no configurada o inválida. Verifica tus variables de entorno.";
  }

  if (APICallError.isInstance(error)) {
    if (error.statusCode === 401 || error.statusCode === 403) {
      return "API key no válida o sin permisos. Revisa tu configuración.";
    }

    if (error.statusCode === 429) {
      return "Límite de solicitudes alcanzado. Intenta de nuevo en unos minutos.";
    }

    if (error.message) {
      return error.message;
    }

    return "Error al comunicarse con el proveedor de IA.";
  }

  if (error instanceof Error) {
    if (error.name === "AbortError" || error.message.toLowerCase().includes("timeout")) {
      return "La solicitud tardó demasiado. Intenta de nuevo.";
    }

    return error.message;
  }

  return "Ocurrió un error inesperado. Intenta de nuevo.";
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
        { error: "Cuerpo de la solicitud inválido." },
        { status: 400 },
      );
    }

    const { messages, model } = body as {
      messages?: Message[];
      model?: unknown;
    };

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return Response.json(
        { error: "Se requiere al menos un mensaje." },
        { status: 400 },
      );
    }

    if (!isChatModelId(model)) {
      return Response.json(
        {
          error: `Modelo no válido. Opciones: ${Object.keys(CHAT_MODELS).join(", ")}`,
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
