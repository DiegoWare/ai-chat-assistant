import { CHAT_MODELS, type ChatModelId } from "@/lib/providers";

interface ModelSelectorProps {
  value: ChatModelId;
  onChange: (model: ChatModelId) => void;
  disabled?: boolean;
}

export default function ModelSelector({
  value,
  onChange,
  disabled = false,
}: ModelSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <label
        htmlFor="model-select"
        className="text-xs font-medium text-slate-400"
      >
        Model
      </label>
      <select
        id="model-select"
        value={value}
        onChange={(e) => onChange(e.target.value as ChatModelId)}
        disabled={disabled}
        className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 shadow-sm transition focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {(Object.entries(CHAT_MODELS) as [ChatModelId, { label: string }][]).map(
          ([id, { label }]) => (
            <option key={id} value={id}>
              {label}
            </option>
          ),
        )}
      </select>
    </div>
  );
}
