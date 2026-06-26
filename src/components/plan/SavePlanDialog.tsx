import { useState } from 'react';
import { useStore } from '@/store';

interface SavePlanDialogProps {
  open: boolean;
  onClose: () => void;
}

export function SavePlanDialog({ open, onClose }: SavePlanDialogProps) {
  const [name, setName] = useState('');
  const saveCurrentPlan = useStore((s) => s.saveCurrentPlan);
  const plots = useStore((s) => s.plots);
  const monthData = useStore((s) => s.monthData);

  if (!open) return null;

  // Count total placements
  const totalPlacements = Object.values(monthData).reduce((sum, plotMonths) => {
    for (const m of Object.values(plotMonths || {})) {
      sum += m?.placements?.length ?? 0;
    }
    return sum;
  }, 0);

  const handleSave = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    saveCurrentPlan(trimmed);
    setName('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm mx-4">
        <h2 className="text-lg font-semibold mb-2">Save Garden Plan</h2>
        <p className="text-sm text-stone-500 mb-4">
          Save {plots.length} plot{plots.length !== 1 ? 's' : ''} with {totalPlacements} total placement{totalPlacements !== 1 ? 's' : ''} across 12 months.
        </p>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          placeholder="My Garden Plan"
          className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 mb-4"
          autoFocus
        />
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-stone-600 hover:text-stone-800"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim()}
            className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save Plan
          </button>
        </div>
      </div>
    </div>
  );
}
