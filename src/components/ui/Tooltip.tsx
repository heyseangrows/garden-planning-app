import { useState, useRef, useCallback, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
}

export function Tooltip({ content, children }: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const showTimer = useRef<ReturnType<typeof setTimeout>>();
  const hideTimer = useRef<ReturnType<typeof setTimeout>>();

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setPos({
      top: rect.top - 8, // 8px gap above trigger
      left: rect.left + rect.width / 2,
    });
  }, []);

  const show = useCallback(() => {
    clearTimeout(hideTimer.current);
    updatePosition();
    showTimer.current = setTimeout(() => setVisible(true), 200);
  }, [updatePosition]);

  const hide = useCallback(() => {
    clearTimeout(showTimer.current);
    hideTimer.current = setTimeout(() => setVisible(false), 100);
  }, []);

  return (
    <>
      <div
        ref={triggerRef}
        className="relative inline-block"
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
      >
        {children}
      </div>

      {visible &&
        createPortal(
          <div
            className="fixed z-[9999] pointer-events-none"
            style={{
              top: pos.top,
              left: pos.left,
              transform: 'translate(-50%, -100%)',
            }}
          >
            <div className="bg-stone-800 text-white text-xs rounded-lg px-3 py-2 shadow-xl max-w-xs whitespace-normal">
              {content}
            </div>
            <div className="mx-auto w-0 h-0 border-4 border-transparent border-t-stone-800" />
          </div>,
          document.body,
        )}
    </>
  );
}
