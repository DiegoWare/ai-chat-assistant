import type { Message } from "ai";
import Image from "next/image";
import MarkdownContent from "@/components/MarkdownContent";

interface MessageBubbleProps {
  message: Message;
  isStreaming?: boolean;
}

function isImageAttachment(contentType?: string) {
  return contentType?.startsWith("image/") ?? false;
}

export default function MessageBubble({
  message,
  isStreaming = false,
}: MessageBubbleProps) {
  const isUser = message.role === "user";
  const attachments = message.experimental_attachments ?? [];
  const imageAttachments = attachments.filter((file) =>
    isImageAttachment(file.contentType),
  );
  const showDefaultPrompt =
    isUser &&
    message.content === "What's in this image?" &&
    imageAttachments.length > 0;

  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
          isUser
            ? "bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white"
            : "border border-slate-700 bg-slate-800 text-violet-300"
        }`}
        aria-hidden="true"
      >
        {isUser ? "U" : "AI"}
      </div>

      <div
        className={`max-w-[min(100%,42rem)] rounded-2xl px-4 py-3 shadow-sm ${
          isUser
            ? "rounded-tr-md bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white"
            : "rounded-tl-md border border-slate-700/80 bg-slate-900 text-slate-100"
        }`}
      >
        <p
          className={`mb-2 text-[11px] font-semibold uppercase tracking-wider ${
            isUser ? "text-violet-200" : "text-slate-400"
          }`}
        >
          {isUser ? "You" : "Assistant"}
        </p>

        {imageAttachments.length > 0 && (
          <div
            className={`mb-3 flex flex-wrap gap-2 ${isUser ? "justify-end" : "justify-start"}`}
          >
            {imageAttachments.map((file, index) => (
              <div
                key={`${file.url}-${index}`}
                className="relative h-32 w-32 overflow-hidden rounded-lg border border-white/20"
              >
                <Image
                  src={file.url}
                  alt={file.name ?? `Image ${index + 1}`}
                  fill
                  unoptimized
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        )}

        {isUser ? (
          message.content && !showDefaultPrompt ? (
            <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
              {message.content}
            </p>
          ) : null
        ) : (
          <div className="text-sm">
            <MarkdownContent content={message.content} variant="assistant" />
            {isStreaming && (
              <span
                className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-violet-400"
                aria-hidden="true"
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
