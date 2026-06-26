export function Spinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClass = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-8 h-8' : 'w-5 h-5';
  return (
    <div
      className={`${sizeClass} border-2 border-stone-200 border-t-brand-600 rounded-full animate-spin`}
      role="status"
      aria-label="Loading"
    />
  );
}
