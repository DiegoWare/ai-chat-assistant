"use client";

import { useChat } from "ai/react";
import { useCallback, useEffect, useRef, useState } from "react";
import ErrorBanner from "@/components/ErrorBanner";
import MessageBubble from "@/components/MessageBubble";
import ModelSelector from "@/components/ModelSelector";
import type { ChatModelId } from "@/lib/providers";

const SUGGESTED_PROMPTS = [
  "Explain what the Vercel AI SDK is and why it's useful",
  "What are three creative uses for streaming AI APIs?",
  "What's the difference between REST and streaming in chat APIs?",
];

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
    append,
  } = useChat({
    api: "/api/chat",
    body: { model },
    onResponse: async (response) => {
      if (!response.ok) {
        const message =
          (await parseApiError(response)) ??
          "Could not connect to the server. Please try again.";
        setApiError(message);
      }
    },
    onError: (chatError) => {
      setApiError(chatError.message || "An unexpected error occurred.");
    },
    onFinish: () => {
      clearError();
    },
  });

  const isBusy = isLoading || status === "submitted" || status === "streaming";
  const displayError = apiError ?? error?.message ?? null;
  const lastMessage = messages[messages.length - 1];
  const isStreamingAssistant =
    isBusy && lastMessage?.role === "assistant" && lastMessage.content.length > 0;

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
    event:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    handleInputChange(event);
    if (apiError) clearError();
  };

  const sendSuggestedPrompt = (prompt: string) => {
    if (isBusy) return;
    clearError();
    void append({ role: "user", content: prompt });
  };

  return (
    <div className="flex h-dvh flex-col">
      {displayError && (
        <ErrorBanner message={displayError} onDismiss={clearError} />
      )}

      <header className="border-b border-slate-800 px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-3xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-slate-100 sm:text-xl">
              AI Chat Assistant
            </h1>
            <p className="text-xs text-slate-500 sm:text-sm">
              Chat with ChatGPT or Gemini · streaming responses
            </p>
          </div>
          <div className="flex items-center gap-3">
            <ModelSelector
              value={model}
              onChange={setModel}
              disabled={isBusy}
            />
            <button
              type="button"
              onClick={handleNewConversation}
              disabled={isBusy}
              className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-medium text-slate-200 transition hover:border-slate-600 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm"
            >
              New chat
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
        <div className="mx-auto flex max-w-3xl flex-col gap-5">
          {messages.length === 0 && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/40 p-8 text-center">
                <p className="text-sm text-slate-300">
                  Send a message or pick a suggestion to get started
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                {SUGGESTED_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => sendSuggestedPrompt(prompt)}
                    disabled={isBusy}
                    className="rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-left text-xs text-slate-300 transition hover:border-violet-500/40 hover:bg-slate-800 hover:text-slate-100 disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((message, index) => (
            <MessageBubble
              key={message.id}
              message={message}
              isStreaming={
                isStreamingAssistant &&
                index === messages.length - 1 &&
                message.role === "assistant"
              }
            />
          ))}

          {isBusy &&
            (messages.length === 0 ||
              lastMessage?.role !== "assistant" ||
              lastMessage.content.length === 0) && (
              <div className="flex gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-700 bg-slate-800 text-xs font-bold text-violet-300">
                  AI
                </div>
                <div className="flex items-center gap-2 rounded-2xl rounded-tl-md border border-slate-700/80 bg-slate-900 px-4 py-3 text-sm text-slate-400">
                  <span className="flex gap-1">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-violet-400 [animation-delay:-0.3s]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-violet-400 [animation-delay:-0.15s]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-violet-400" />
                  </span>
                  <span>{status === "submitted" ? "Thinking..." : "Writing..."}</span>
                </div>
              </div>
            )}

          <div ref={messagesEndRef} />
        </div>
      </main>

      <footer className="border-t border-slate-800 bg-slate-950/80 px-4 py-4 backdrop-blur sm:px-6">
        <form onSubmit={onSubmit} className="mx-auto max-w-3xl">
          <div className="flex gap-2">
            <textarea
              value={input}
              onChange={onInputChange}
              disabled={isBusy}
              rows={1}
              placeholder={isBusy ? "Waiting for response..." : "Type your message..."}
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
              className={`max-h-32 min-h-[48px] flex-1 resize-none rounded-xl border bg-slate-900 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60 ${
                emptySubmitAttempt
                  ? "border-amber-500/60 focus:border-amber-500 focus:ring-amber-500/20"
                  : "border-slate-700 focus:border-violet-500 focus:ring-violet-500/20"
              }`}
            />
            <button
              type="submit"
              disabled={isBusy || !input.trim()}
              className="rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-3 text-sm font-medium text-white shadow-lg shadow-violet-900/30 transition hover:from-violet-500 hover:to-fuchsia-500 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Send
            </button>
          </div>
          {emptySubmitAttempt && (
            <p className="mt-2 text-xs text-amber-400">
              Type a message before sending.
            </p>
          )}
        </form>
      </footer>
    </div>
  );
}
