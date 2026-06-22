"use client";

import { useChat } from "ai/react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import ErrorBanner from "@/components/ErrorBanner";
import MessageBubble from "@/components/MessageBubble";
import ModelSelector from "@/components/ModelSelector";
import {
  ACCEPTED_IMAGE_TYPES,
  filesToFileList,
  validateImageFile,
} from "@/lib/image-utils";
import type { ChatModelId } from "@/lib/providers";

const SUGGESTED_PROMPTS = [
  "Explain what the Vercel AI SDK is and why it's useful",
  "What are three creative uses for streaming AI APIs?",
  "What's the difference between REST and streaming in chat APIs?",
];

const IMAGE_ONLY_PROMPT = "What's in this image?";

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
  const [attachments, setAttachments] = useState<File[]>([]);
  const [attachmentPreviews, setAttachmentPreviews] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const clearError = useCallback(() => setApiError(null), []);

  const clearAttachments = useCallback(() => {
    setAttachments([]);
    setAttachmentPreviews((prev) => {
      prev.forEach((url) => URL.revokeObjectURL(url));
      return [];
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

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
      clearAttachments();
    },
  });

  const isBusy = isLoading || status === "submitted" || status === "streaming";
  const displayError = apiError ?? error?.message ?? null;
  const lastMessage = messages[messages.length - 1];
  const isStreamingAssistant =
    isBusy && lastMessage?.role === "assistant" && lastMessage.content.length > 0;
  const canSend = Boolean(input.trim() || attachments.length > 0);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isBusy, displayError, attachmentPreviews]);

  useEffect(() => {
    if (input.trim() || attachments.length > 0) {
      setEmptySubmitAttempt(false);
    }
  }, [input, attachments.length]);

  useEffect(() => {
    return () => {
      attachmentPreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [attachmentPreviews]);

  const handleNewConversation = () => {
    setMessages([]);
    setInput("");
    clearError();
    clearAttachments();
    setEmptySubmitAttempt(false);
  };

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!canSend) {
      setEmptySubmitAttempt(true);
      return;
    }

    if (isBusy) return;

    clearError();

    if (attachments.length > 0) {
      void append(
        { role: "user", content: input.trim() || IMAGE_ONLY_PROMPT },
        { experimental_attachments: filesToFileList(attachments) },
      );
      setInput("");
      return;
    }

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

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(event.target.files ?? []);
    if (selected.length === 0) return;

    for (const file of selected) {
      const validationError = validateImageFile(file);
      if (validationError) {
        setApiError(validationError);
        return;
      }
    }

    clearError();
    setAttachments((prev) => [...prev, ...selected]);
    setAttachmentPreviews((prev) => [
      ...prev,
      ...selected.map((file) => URL.createObjectURL(file)),
    ]);
    event.target.value = "";
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
    setAttachmentPreviews((prev) => {
      const next = [...prev];
      const [removed] = next.splice(index, 1);
      if (removed) URL.revokeObjectURL(removed);
      return next;
    });
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
              Chat with ChatGPT or Gemini · images supported
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
                  Send a message, attach an image, or pick a suggestion to get started
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
          {attachmentPreviews.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {attachmentPreviews.map((preview, index) => (
                <div
                  key={preview}
                  className="relative h-20 w-20 overflow-hidden rounded-lg border border-slate-700"
                >
                  <Image
                    src={preview}
                    alt={`Attachment ${index + 1}`}
                    fill
                    unoptimized
                    className="object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeAttachment(index)}
                    disabled={isBusy}
                    className="absolute right-1 top-1 rounded-full bg-black/70 px-1.5 py-0.5 text-[10px] text-white hover:bg-black"
                    aria-label="Remove image"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_IMAGE_TYPES.join(",")}
              multiple
              className="hidden"
              onChange={handleImageSelect}
              disabled={isBusy}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isBusy}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-slate-700 bg-slate-900 text-slate-300 transition hover:border-violet-500/40 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Attach image"
              title="Attach image"
            >
              <ImageIcon />
            </button>
            <textarea
              value={input}
              onChange={onInputChange}
              disabled={isBusy}
              rows={1}
              placeholder={
                isBusy
                  ? "Waiting for response..."
                  : "Type a message or attach an image..."
              }
              aria-invalid={emptySubmitAttempt}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  if (canSend && !isBusy) {
                    onSubmit(e as unknown as React.FormEvent<HTMLFormElement>);
                  } else if (!canSend) {
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
              disabled={isBusy || !canSend}
              className="rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-3 text-sm font-medium text-white shadow-lg shadow-violet-900/30 transition hover:from-violet-500 hover:to-fuchsia-500 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Send
            </button>
          </div>
          {emptySubmitAttempt && (
            <p className="mt-2 text-xs text-amber-400">
              Type a message or attach an image before sending.
            </p>
          )}
        </form>
      </footer>
    </div>
  );
}

function ImageIcon() {
  return (
    <svg
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z"
      />
    </svg>
  );
}
