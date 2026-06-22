import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Chat Assistant",
  description: "Chat con ChatGPT y Gemini usando streaming",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="min-h-dvh bg-gray-50 text-gray-900 antialiased">
        {children}
      </body>
    </html>
  );
}
