import type { ReactNode } from 'react';
import { clsx } from 'clsx';

interface SlidePanelProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  width?: 'narrow' | 'half';
}

const widthClasses = {
  narrow: 'w-80 sm:w-96',
  half: 'w-full sm:w-[60%]',
};

export function SlidePanel({ open, onClose, title, children, width = 'narrow' }: SlidePanelProps) {
  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/20"
          onClick={onClose}
        />
      )}

      {/* Panel */}
      <div
        className={clsx(
          'fixed top-0 right-0 z-50 h-full bg-white shadow-xl border-l border-stone-200 flex flex-col transition-transform duration-300 ease-in-out',
          widthClasses[width],
          open ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-stone-200">
          <h2 className="font-semibold text-stone-800">{title}</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4">
          {children}
        </div>
      </div>
    </>
  );
}
