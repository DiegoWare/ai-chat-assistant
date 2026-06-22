import { Inter } from "next/font/google";
import type { Metadata } from "next";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "AI Chat Assistant | Portfolio",
  description:
    "Chat web con streaming multi-proveedor (ChatGPT y Gemini). Proyecto full-stack con Next.js 14, TypeScript y Vercel AI SDK.",
  openGraph: {
    title: "AI Chat Assistant",
    description:
      "Demo interactiva de chat con IA — streaming en tiempo real con OpenAI y Google Gemini.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="scroll-smooth">
      <body
        className={`${inter.className} min-h-dvh bg-slate-950 text-slate-100 antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
