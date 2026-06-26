interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="relative flex-1">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-sm">🔍</span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search vegetables..."
        className="w-full pl-9 pr-4 py-2 border border-stone-300 rounded-lg text-sm
                   focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
        >
          ✕
        </button>
      )}
    </div>
  );
}
