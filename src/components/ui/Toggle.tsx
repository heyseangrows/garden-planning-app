import { clsx } from 'clsx';

interface ToggleProps {
  value: boolean;
  onChange: (value: boolean) => void;
  label?: string;
  size?: 'sm' | 'md';
}

export function Toggle({ value, onChange, label, size = 'md' }: ToggleProps) {
  const isSm = size === 'sm';
  return (
    <label className="inline-flex items-center gap-2 cursor-pointer">
      <button
        role="switch"
        aria-checked={value}
        onClick={() => onChange(!value)}
        className={clsx(
          'relative rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-1',
          isSm ? 'w-8 h-4' : 'w-10 h-5',
          value ? 'bg-brand-600' : 'bg-stone-300'
        )}
      >
        <span
          className={clsx(
            'absolute top-0.5 left-0.5 bg-white rounded-full shadow transition-transform',
            isSm ? 'w-3 h-3' : 'w-4 h-4',
            value && (isSm ? 'translate-x-4' : 'translate-x-5')
          )}
        />
      </button>
      {label && <span className={clsx('text-stone-700', isSm ? 'text-xs' : 'text-sm')}>{label}</span>}
    </label>
  );
}
