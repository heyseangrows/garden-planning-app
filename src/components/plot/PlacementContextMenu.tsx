import { useEffect } from 'react';
import { createPortal } from 'react-dom';

export type ReorderDirection = 'toFront' | 'forwards' | 'backwards' | 'toBack';

interface PlacementContextMenuProps {
  clientX: number;
  clientY: number;
  containerRect: DOMRect;
  onClose: () => void;
  onReorder: (direction: ReorderDirection) => void;
}

const MENU_ITEMS: { label: string; direction: ReorderDirection; shortcut?: string }[] = [
  { label: 'Bring to front', direction: 'toFront' },
  { label: 'Bring forwards', direction: 'forwards' },
  { label: 'Send backwards', direction: 'backwards' },
  { label: 'Send to back', direction: 'toBack' },
];

const MENU_WIDTH = 190;
const ITEM_HEIGHT = 36;
const MENU_PADDING = 8;

export function PlacementContextMenu({
  clientX,
  clientY,
  containerRect,
  onClose,
  onReorder,
}: PlacementContextMenuProps) {
  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const menuHeight = MENU_ITEMS.length * ITEM_HEIGHT;

  // Calculate position relative to container, clamped to bounds
  let x = clientX - containerRect.left;
  let y = clientY - containerRect.top;

  if (x + MENU_WIDTH > containerRect.width - MENU_PADDING) {
    x = containerRect.width - MENU_WIDTH - MENU_PADDING;
  }
  if (x < MENU_PADDING) x = MENU_PADDING;

  if (y + menuHeight > containerRect.height - MENU_PADDING) {
    y = containerRect.height - menuHeight - MENU_PADDING;
  }
  if (y < MENU_PADDING) y = MENU_PADDING;

  return createPortal(
    <>
      {/* Transparent backdrop to catch outside clicks */}
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
        onContextMenu={(e) => {
          e.preventDefault();
          onClose();
        }}
      />
      {/* Menu */}
      <div
        className="fixed z-50 bg-white rounded-lg shadow-xl border border-stone-200 py-1 select-none"
        style={{
          left: containerRect.left + x,
          top: containerRect.top + y,
          minWidth: MENU_WIDTH,
        }}
      >
        {MENU_ITEMS.map((item, i) => (
          <div key={item.direction}>
            {i === 2 && <div className="mx-2 my-1 border-t border-stone-100" />}
            <button
              className="w-full px-4 py-2 text-left text-sm text-stone-700 hover:bg-brand-50 hover:text-brand-700 flex items-center justify-between transition-colors"
              onClick={() => {
                onReorder(item.direction);
                onClose();
              }}
            >
              <span>{item.label}</span>
              {item.shortcut && (
                <span className="text-xs text-stone-400 ml-4">{item.shortcut}</span>
              )}
            </button>
          </div>
        ))}
      </div>
    </>,
    document.body,
  );
}
