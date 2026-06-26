interface RatingFilterProps {
  label: string;
  value: number; // 0 = any, 1–5 = minimum stars
  onChange: (value: number) => void;
}

const STAR_LABELS: Record<number, string> = {
  0: 'Any',
  1: '★+',
  2: '★★+',
  3: '★★★+',
  4: '★★★★+',
  5: '★★★★★',
};

export function RatingFilter({ label, value, onChange }: RatingFilterProps) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-xs text-stone-500 whitespace-nowrap">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="px-2 py-1.5 text-xs border border-stone-300 rounded bg-white text-stone-700 focus:ring-2 focus:ring-brand-500 outline-none cursor-pointer"
      >
        {[0, 1, 2, 3, 4, 5].map((n) => (
          <option key={n} value={n}>
            {STAR_LABELS[n]}
          </option>
        ))}
      </select>
    </div>
  );
}

interface RatingFiltersProps {
  climate: number;
  onClimateChange: (v: number) => void;
  yield: number;
  onYieldChange: (v: number) => void;
  taste: number;
  onTasteChange: (v: number) => void;
}

export function RatingFilters({
  climate,
  onClimateChange,
  yield: yieldVal,
  onYieldChange,
  taste,
  onTasteChange,
}: RatingFiltersProps) {
  const hasActiveFilter = climate > 0 || yieldVal > 0 || taste > 0;

  return (
    <div className="flex flex-wrap items-center gap-3">
      <RatingFilter label="Climate" value={climate} onChange={onClimateChange} />
      <RatingFilter label="Yield" value={yieldVal} onChange={onYieldChange} />
      <RatingFilter label="Taste" value={taste} onChange={onTasteChange} />
      {hasActiveFilter && (
        <span className="text-[10px] text-amber-600 font-medium">★ filter active</span>
      )}
    </div>
  );
}
