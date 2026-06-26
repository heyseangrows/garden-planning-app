import { clsx } from 'clsx';

interface MultiSelectProps {
  options: Array<{ value: string; label: string }>;
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
}

export function MultiSelect({ options, selected, onChange, placeholder = 'Select...' }: MultiSelectProps) {
  const toggle = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((s) => s !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  return (
    <div className="relative">
      <div className="flex flex-wrap gap-1 min-h-[2.5rem] p-2 border border-stone-300 rounded-lg bg-white">
        {selected.length === 0 && (
          <span className="text-stone-400 text-sm self-center">{placeholder}</span>
        )}
        {selected.map((id) => {
          const opt = options.find((o) => o.value === id);
          return (
            <span
              key={id}
              className="inline-flex items-center gap-1 px-2 py-0.5 bg-brand-100 text-brand-800 rounded-md text-xs font-medium"
            >
              {opt?.label ?? id}
              <button
                onClick={() => toggle(id)}
                className="text-brand-600 hover:text-brand-800"
              >
                ✕
              </button>
            </span>
          );
        })}
      </div>
      <div className="mt-1 max-h-40 overflow-y-auto border border-stone-200 rounded-lg bg-white shadow-sm">
        {options
          .filter((opt) => !selected.includes(opt.value))
          .map((opt) => (
            <button
              key={opt.value}
              onClick={() => toggle(opt.value)}
              className="w-full text-left px-3 py-2 text-sm hover:bg-brand-50 transition-colors"
            >
              {opt.label}
            </button>
          ))}
        {options.filter((opt) => !selected.includes(opt.value)).length === 0 && (
          <div className="px-3 py-2 text-sm text-stone-400">All options selected</div>
        )}
      </div>
    </div>
  );
}
