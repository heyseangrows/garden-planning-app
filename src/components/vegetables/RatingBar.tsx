import { clsx } from 'clsx';

interface RatingBarProps {
  label: string;
  value: number;
  max?: number;
  color?: string;
}

export function RatingBar({ label, value, max = 5, color = 'bg-brand-500' }: RatingBarProps) {
  const pct = (value / max) * 100;
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-stone-500 w-16 shrink-0">{label}</span>
      <div className="flex-1 h-2 bg-stone-100 rounded-full overflow-hidden">
        <div
          className={clsx('h-full rounded-full transition-all', color)}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs text-stone-600 w-6 text-right">{value}</span>
    </div>
  );
}
