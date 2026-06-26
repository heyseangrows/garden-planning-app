import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <span className="text-5xl mb-4">{icon}</span>
      <h3 className="text-lg font-semibold text-stone-700 mb-1">{title}</h3>
      <p className="text-sm text-stone-500 mb-4 max-w-sm">{description}</p>
      {action}
    </div>
  );
}
