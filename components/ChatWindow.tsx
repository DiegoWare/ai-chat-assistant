"use client";

import { useChat } from "ai/react";
import { useCallback, useEffect, useRef, useState } from "react";
import ErrorBanner from "@/components/ErrorBanner";
import MessageBubble from "@/components/MessageBubble";
import ModelSelector from "@/components/ModelSelector";
import type { ChatModelId } from "@/lib/providers";

const DEFAULT_SYSTEM_PROMPT =
  "Eres un asistente útil, claro y conciso. Responde en el mismo idioma que use el usuario.";

async function parseApiError(response: Response): Promise<string | null> {
  try {
    const data = (await response.json()) as { error?: string };
    return data.error ?? null;
  } catch {
    return null;
  }
}

export default function ChatWindow() {
  const [model, setModel] = useState<ChatModelId>("openai");
  const [systemPrompt, setSystemPrompt] = useState(DEFAULT_SYSTEM_PROMPT);
  const [showSystemPrompt, setShowSystemPrompt] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [emptySubmitAttempt, setEmptySubmitAttempt] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const clearError = useCallback(() => setApiError(null), []);

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    status,
    setMessages,
    setInput,
    error,
  } = useChat({
    api: "/api/chat",
    body: {
      model,
      systemPrompt,
    },
    onResponse: async (response) => {
      if (!response.ok) {
        const message =
          (await parseApiError(response)) ??
          "No se pudo conectar con el servidor. Intenta de nuevo.";
        setApiError(message);
      }
    },
    onError: (chatError) => {
      setApiError(chatError.message || "Ocurrió un error inesperado.");
    },
    onFinish: () => {
      clearError();
    },
  });

  const isBusy = isLoading || status === "submitted" || status === "streaming";
  const displayError = apiError ?? error?.message ?? null;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isBusy, displayError]);

  useEffect(() => {
    if (input.trim()) {
      setEmptySubmitAttempt(false);
    }
  }, [input]);

  const handleNewConversation = () => {
    setMessages([]);
    setInput("");
    clearError();
    setEmptySubmitAttempt(false);
  };

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!input.trim()) {
      setEmptySubmitAttempt(true);
      return;
    }

    if (isBusy) return;

    clearError();
    handleSubmit(event);
  };

  const onInputChange = (
    event: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    handleInputChange(event);
    if (apiError) clearError();
  };

  return (
    <div className="flex h-dvh flex-col bg-gray-50">
      {displayError && (
        <ErrorBanner message={displayError} onDismiss={clearError} />
      )}

      <header className="border-b border-gray-200 bg-white px-4 py-4 shadow-sm sm:px-6">
        <div className="mx-auto flex max-w-3xl flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">AI Chat Assistant</h1>
            <p className="text-sm text-gray-500">
              Conversa con ChatGPT o Gemini en tiempo real
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <ModelSelector
              value={model}
              onChange={setModel}
              disabled={isBusy}
            />
            <button
              type="button"
              onClick={handleNewConversation}
              disabled={isBusy}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Nueva conversación
            </button>
          </div>
        </div>
      </header>

      <div className="border-b border-gray-200 bg-white px-4 py-2 sm:px-6">
        <div className="mx-auto max-w-3xl">
          <button
            type="button"
            onClick={() => setShowSystemPrompt((open) => !open)}
            className="flex w-full items-center justify-between py-2 text-left text-sm font-medium text-gray-700"
          >
            <span>System prompt</span>
            <span className="text-gray-400">{showSystemPrompt ? "▲" : "▼"}</span>
          </button>
          {showSystemPrompt && (
            <textarea
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              disabled={isBusy}
              rows={3}
              placeholder="Define el comportamiento del asistente..."
              className="mb-3 w-full resize-y rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:bg-gray-100"
            />
          )}
        </div>
      </div>

      <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
        <div className="mx-auto flex max-w-3xl flex-col gap-4">
          {messages.length === 0 && (
            <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center text-gray-500">
              <p className="text-sm">
                Escribe un mensaje para empezar. Puedes cambiar de modelo en cualquier
                momento.
              </p>
            </div>
          )}

          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}

          {isBusy && (
            <div className="flex justify-start">
              <div className="flex items-center gap-2 rounded-2xl rounded-bl-md border border-gray-200 bg-white px-4 py-3 text-sm text-gray-500 shadow-sm">
                <span className="flex gap-1">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-indigo-400 [animation-delay:-0.3s]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-indigo-400 [animation-delay:-0.15s]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-indigo-400" />
                </span>
                <span>{status === "submitted" ? "Pensando..." : "Escribiendo..."}</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </main>

      <footer className="border-t border-gray-200 bg-white px-4 py-4 sm:px-6">
        <form onSubmit={onSubmit} className="mx-auto max-w-3xl">
          <div className="flex gap-2">
            <textarea
              value={input}
              onChange={onInputChange}
              disabled={isBusy}
              rows={1}
              placeholder={isBusy ? "Esperando respuesta..." : "Escribe tu mensaje..."}
              aria-invalid={emptySubmitAttempt}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  if (input.trim() && !isBusy) {
                    onSubmit(e as unknown as React.FormEvent<HTMLFormElement>);
                  } else if (!input.trim()) {
                    setEmptySubmitAttempt(true);
                  }
                }
              }}
              className={`max-h-32 min-h-[44px] flex-1 resize-none rounded-xl border px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:bg-gray-100 ${
                emptySubmitAttempt
                  ? "border-amber-400 focus:border-amber-400 focus:ring-amber-400/20"
                  : "border-gray-300 focus:border-indigo-500 focus:ring-indigo-500/20"
              }`}
            />
            <button
              type="submit"
              disabled={isBusy || !input.trim()}
              className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-300"
            >
              Enviar
            </button>
          </div>
          {emptySubmitAttempt && (
            <p className="mt-2 text-xs text-amber-600">
              Escribe un mensaje antes de enviar.
            </p>
          )}
        </form>
      </footer>
    </div>
  );
}
