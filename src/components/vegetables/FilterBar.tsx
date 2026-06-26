import type { VegetableCategory } from '@/types';

interface FilterBarProps {
  value: 'all' | VegetableCategory;
  onChange: (value: 'all' | VegetableCategory) => void;
}

export function FilterBar({ value, onChange }: FilterBarProps) {
  const options = [
    { value: 'all' as const, label: 'All Vegetables', emoji: '🌱' },
    { value: 'western' as const, label: 'Western', emoji: '🥕' },
    { value: 'asian' as const, label: 'Asian', emoji: '🥢' },
  ];

  return (
    <div className="flex rounded-lg overflow-hidden border border-stone-300">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`px-3 py-2 text-sm font-medium transition-colors ${
            value === opt.value
              ? 'bg-brand-600 text-white'
              : 'bg-white text-stone-600 hover:bg-stone-50'
          }`}
        >
          <span className="mr-1">{opt.emoji}</span>
          {opt.label}
        </button>
      ))}
    </div>
  );
}
