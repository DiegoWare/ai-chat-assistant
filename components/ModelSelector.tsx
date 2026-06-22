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
    <div className="flex flex-col gap-1">
      <label htmlFor="model-select" className="text-xs font-medium text-gray-500">
        Modelo
      </label>
      <select
        id="model-select"
        value={value}
        onChange={(e) => onChange(e.target.value as ChatModelId)}
        disabled={disabled}
        className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500"
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
