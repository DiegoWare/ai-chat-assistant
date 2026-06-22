import { Inter } from "next/font/google";
import type { Metadata } from "next";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "AI Chat Assistant",
  description:
    "Chat with ChatGPT and Gemini in real time. Multi-provider AI chat with streaming responses.",
  openGraph: {
    title: "AI Chat Assistant",
    description:
      "Chat with ChatGPT and Gemini using real-time streaming.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${inter.className} min-h-dvh bg-slate-950 text-slate-100 antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
