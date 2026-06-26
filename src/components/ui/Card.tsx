import { clsx } from 'clsx';
import type { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const paddings = {
  none: '',
  sm: 'p-3',
  md: 'p-5',
  lg: 'p-6',
};

export function Card({ children, hover = false, padding = 'md', className, ...props }: CardProps) {
  return (
    <div
      className={clsx(
        'bg-white rounded-xl border border-stone-200',
        hover && 'hover:shadow-md hover:border-stone-300 transition-all duration-200',
        paddings[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
