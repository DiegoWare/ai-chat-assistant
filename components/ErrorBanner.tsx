interface ErrorBannerProps {
  message: string;
  onDismiss: () => void;
}

export default function ErrorBanner({ message, onDismiss }: ErrorBannerProps) {
  return (
    <div
      role="alert"
      className="border-b border-red-200 bg-red-50 px-4 py-3 sm:px-6"
    >
      <div className="mx-auto flex max-w-3xl items-start justify-between gap-3">
        <div className="flex gap-2 text-sm text-red-800">
          <span className="mt-0.5 shrink-0" aria-hidden="true">
            ⚠️
          </span>
          <p>{message}</p>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className="shrink-0 rounded-md px-2 py-1 text-xs font-medium text-red-700 transition hover:bg-red-100"
          aria-label="Cerrar error"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}
