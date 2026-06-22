const TECH_STACK = [
  "Next.js 14",
  "TypeScript",
  "Tailwind CSS",
  "Vercel AI SDK",
  "OpenAI",
  "Gemini",
];

const HIGHLIGHTS = [
  {
    title: "Multi-proveedor",
    description:
      "Un solo chat, dos modelos de IA. Cambia entre ChatGPT y Gemini sin perder el historial.",
  },
  {
    title: "Streaming en tiempo real",
    description:
      "Las respuestas aparecen token a token, como en ChatGPT, usando streamText del Vercel AI SDK.",
  },
  {
    title: "Arquitectura limpia",
    description:
      "App Router, API routes, componentes desacoplados y manejo de errores en cliente y servidor.",
  },
];

// Actualiza este enlace cuando subas el repo a GitHub
const GITHUB_URL = "https://github.com/diegogonzalez/ai-chat-assistant";

export default function ProjectIntro() {
  return (
    <aside className="flex flex-col border-b border-slate-800 lg:h-dvh lg:w-[22rem] lg:shrink-0 lg:border-b-0 lg:border-r xl:w-[26rem]">
      <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-6 sm:p-8">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-violet-400">
            Portfolio · Full-stack
          </p>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            <span className="gradient-text">AI Chat Assistant</span>
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-400">
            Demo interactiva de un chat con IA construido desde cero. Diseñada
            para mostrar experiencia en desarrollo web moderno, integración de
            APIs y UX en productos con streaming.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {TECH_STACK.map((tech) => (
            <span
              key={tech}
              className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs font-medium text-slate-300"
            >
              {tech}
            </span>
          ))}
        </div>

        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-slate-200">
            Qué demuestra este proyecto
          </h2>
          <ul className="space-y-3">
            {HIGHLIGHTS.map((item) => (
              <li
                key={item.title}
                className="rounded-xl border border-slate-800 bg-slate-900/60 p-4"
              >
                <p className="text-sm font-medium text-slate-100">
                  {item.title}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-slate-400">
                  {item.description}
                </p>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-4">
          <p className="text-sm font-medium text-violet-200">
            Pruébalo ahora →
          </p>
          <p className="mt-1 text-xs leading-relaxed text-slate-400">
            Escribe un mensaje en el panel de la derecha. Puedes cambiar de
            modelo en cualquier momento para comparar respuestas.
          </p>
        </div>
      </div>

      <footer className="border-t border-slate-800 p-6 sm:p-8">
        <p className="text-xs text-slate-500">
          Desarrollado por{" "}
          <span className="font-medium text-slate-300">Diego Gonzalez</span>
        </p>
        <div className="mt-3 flex flex-wrap gap-3">
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-medium text-slate-200 transition hover:border-violet-500/50 hover:text-white"
          >
            <GitHubIcon />
            Ver código
          </a>
          <span className="inline-flex items-center rounded-lg border border-slate-800 px-3 py-2 text-xs text-slate-500">
            Deploy: Vercel
          </span>
        </div>
      </footer>
    </aside>
  );
}

function GitHubIcon() {
  return (
    <svg
      className="h-4 w-4"
      fill="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
        clipRule="evenodd"
      />
    </svg>
  );
}
