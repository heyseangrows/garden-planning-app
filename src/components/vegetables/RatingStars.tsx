import { clsx } from 'clsx';

interface RatingStarsProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md';
}

export function RatingStars({ value, max = 5, size = 'sm' }: RatingStarsProps) {
  const starSize = size === 'sm' ? 'text-xs' : 'text-sm';
  return (
    <div className={clsx('flex items-center gap-0.5', starSize)} title={`${value}/${max}`}>
      {Array.from({ length: max }, (_, i) => (
        <span
          key={i}
          className={clsx(
            i < Math.floor(value)
              ? 'text-amber-400'
              : i < value
              ? 'text-amber-300'
              : 'text-stone-200'
          )}
        >
          {i < value ? '★' : '☆'}
        </span>
      ))}
    </div>
  );
}
