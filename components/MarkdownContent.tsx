import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownContentProps {
  content: string;
  variant: "assistant" | "user";
}

export default function MarkdownContent({
  content,
  variant,
}: MarkdownContentProps) {
  const variantClass =
    variant === "assistant" ? "prose-assistant" : "prose-user";

  return (
    <div className={`prose-chat ${variantClass}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noopener noreferrer">
              {children}
            </a>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
