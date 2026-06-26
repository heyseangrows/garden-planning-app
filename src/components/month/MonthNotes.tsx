import { useStore } from '@/store';
import { formatMonthLabel } from '@/data/frostDates';
import { useState, useEffect, useRef } from 'react';

export function MonthNotes() {
  const activePlotId = useStore((s) => s.activePlotId);
  const activeMonthIndex = useStore((s) => s.activeMonthIndex);
  const monthData = useStore((s) => s.monthData);
  const setMonthNotes = useStore((s) => s.setMonthNotes);
  const [isExpanded, setIsExpanded] = useState(false);

  const currentNotes = activePlotId
    ? monthData[activePlotId]?.[activeMonthIndex]?.notes ?? ''
    : '';

  const [localNotes, setLocalNotes] = useState(currentNotes);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  // Sync local notes when month/plot changes
  useEffect(() => {
    setLocalNotes(currentNotes);
  }, [activePlotId, activeMonthIndex]);

  const handleChange = (value: string) => {
    setLocalNotes(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (activePlotId) {
        setMonthNotes(activePlotId, activeMonthIndex, value);
      }
    }, 300);
  };

  if (!activePlotId) return null;

  const monthLabelText = formatMonthLabel(activeMonthIndex);

  return (
    <div className="bg-amber-50/95 backdrop-blur border-t-2 border-amber-300 shadow-md">
      {/* Collapsed bar */}
      {!isExpanded ? (
        <button
          onClick={() => setIsExpanded(true)}
          className="w-full px-4 py-2.5 flex items-center gap-2 text-sm font-medium text-amber-800 hover:bg-amber-100/80 transition-colors"
        >
          📝 Notes for {monthLabelText}
          {currentNotes && (
            <span className="text-xs text-amber-600 truncate max-w-[300px]">
              — {currentNotes.slice(0, 60)}{currentNotes.length > 60 ? '...' : ''}
            </span>
          )}
          <span className="ml-auto text-xs text-amber-500">Click to expand</span>
        </button>
      ) : (
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-semibold text-amber-900">
              📝 Notes for {monthLabelText}
            </label>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-xs text-amber-600 hover:text-amber-800"
            >
              ▼ Collapse
            </button>
          </div>
          <textarea
            value={localNotes}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={`What needs to be done in ${monthLabelText}? E.g. "Sow 15 broad bean seeds in separate pots", "Prepare bed 2 for carrots", "Harvest remaining lettuce"...`}
            className="w-full px-3 py-2 text-sm border-2 border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none resize-none bg-white"
            rows={3}
          />
        </div>
      )}
    </div>
  );
}
