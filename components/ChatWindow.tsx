"use client";

import { useChat } from "ai/react";
import { useEffect, useRef, useState } from "react";
import MessageBubble from "@/components/MessageBubble";
import ModelSelector from "@/components/ModelSelector";
import type { ChatModelId } from "@/lib/providers";

const DEFAULT_SYSTEM_PROMPT =
  "Eres un asistente útil, claro y conciso. Responde en el mismo idioma que use el usuario.";

export default function ChatWindow() {
  const [model, setModel] = useState<ChatModelId>("claude");
  const [systemPrompt, setSystemPrompt] = useState(DEFAULT_SYSTEM_PROMPT);
  const [showSystemPrompt, setShowSystemPrompt] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
  });

  const isBusy = isLoading || status === "submitted" || status === "streaming";

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isBusy]);

  const handleNewConversation = () => {
    setMessages([]);
    setInput("");
  };

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!input.trim() || isBusy) return;
    handleSubmit(event);
  };

  return (
    <div className="flex h-dvh flex-col bg-gray-50">
      <header className="border-b border-gray-200 bg-white px-4 py-4 shadow-sm sm:px-6">
        <div className="mx-auto flex max-w-3xl flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">AI Chat Assistant</h1>
            <p className="text-sm text-gray-500">
              Conversa con Claude o Gemini en tiempo real
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
                <span>Escribiendo...</span>
              </div>
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error.message}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </main>

      <footer className="border-t border-gray-200 bg-white px-4 py-4 sm:px-6">
        <form onSubmit={onSubmit} className="mx-auto flex max-w-3xl gap-2">
          <textarea
            value={input}
            onChange={handleInputChange}
            disabled={isBusy}
            rows={1}
            placeholder="Escribe tu mensaje..."
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                if (input.trim() && !isBusy) {
                  onSubmit(e as unknown as React.FormEvent<HTMLFormElement>);
                }
              }
            }}
            className="max-h-32 min-h-[44px] flex-1 resize-none rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:bg-gray-100"
          />
          <button
            type="submit"
            disabled={isBusy || !input.trim()}
            className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-300"
          >
            Enviar
          </button>
        </form>
      </footer>
    </div>
  );
}
