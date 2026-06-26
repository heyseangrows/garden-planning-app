import { useEffect } from 'react';
import { useStore } from '@/store';
import type { SavedPlan } from '@/types';

interface LoadPlanDialogProps {
  open: boolean;
  onClose: () => void;
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-GB', {
      day: 'numeric', month: 'short', year: 'numeric',
    });
  } catch {
    return iso;
  }
}

function countTotalPlacements(plan: SavedPlan): number {
  let count = 0;
  if (plan.monthData) {
    for (const plotId of Object.keys(plan.monthData)) {
      const plotMonths = plan.monthData[plotId];
      if (!plotMonths) continue;
      for (const mIdx of Object.keys(plotMonths)) {
        count += plotMonths[Number(mIdx)]?.placements?.length ?? 0;
      }
    }
  }
  return count;
}

export function LoadPlanDialog({ open, onClose }: LoadPlanDialogProps) {
  const savedPlans = useStore((s) => s.savedPlans);
  const loadPlan = useStore((s) => s.loadPlan);
  const deleteSavedPlan = useStore((s) => s.deleteSavedPlan);
  const loadSavedPlans = useStore((s) => s.loadSavedPlans);

  useEffect(() => {
    if (open) loadSavedPlans();
  }, [open, loadSavedPlans]);

  if (!open) return null;

  const handleLoad = (plan: SavedPlan) => {
    if (confirm(`Load "${plan.name}"? Your current plan will be replaced.`)) {
      loadPlan(plan.id);
      onClose();
    }
  };

  const handleDelete = (plan: SavedPlan) => {
    if (confirm(`Delete "${plan.name}"? This cannot be undone.`)) {
      deleteSavedPlan(plan.id);
    }
  };

  const handleExport = (plan: SavedPlan) => {
    const blob = new Blob([JSON.stringify(plan, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${plan.name.replace(/[^a-zA-Z0-9]/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4 max-h-[80vh] flex flex-col">
        <h2 className="text-lg font-semibold mb-2">Load Garden Plan</h2>
        <p className="text-sm text-stone-500 mb-4">
          Select a saved plan to load. Your current plan will be replaced.
        </p>

        {savedPlans.length === 0 ? (
          <p className="text-sm text-stone-400 text-center py-8">
            No saved plans yet. Save your current plan first.
          </p>
        ) : (
          <div className="flex-1 overflow-y-auto space-y-2 mb-4">
            {savedPlans.map((plan) => {
              const plotCount = plan.plots?.length ?? 0;
              const placementCount = countTotalPlacements(plan);

              return (
                <div
                  key={plan.id}
                  className="flex items-center justify-between p-3 border border-stone-200 rounded-lg hover:bg-stone-50"
                >
                  <button
                    onClick={() => handleLoad(plan)}
                    className="flex-1 text-left"
                  >
                    <div className="font-medium text-sm text-stone-900">{plan.name}</div>
                    <div className="text-xs text-stone-400 mt-0.5">
                      {formatDate(plan.updatedAt)} · {plotCount} plot{plotCount !== 1 ? 's' : ''} · {placementCount} placement{placementCount !== 1 ? 's' : ''}
                    </div>
                  </button>
                  <div className="flex gap-1 ml-2">
                    <button
                      onClick={() => handleExport(plan)}
                      className="p-1.5 text-stone-400 hover:text-stone-600 text-xs"
                      title="Export as JSON"
                    >
                      📥
                    </button>
                    <button
                      onClick={() => handleDelete(plan)}
                      className="p-1.5 text-stone-400 hover:text-red-600 text-xs"
                      title="Delete plan"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="flex justify-between items-center border-t border-stone-100 pt-3">
          <label className="text-xs text-stone-400 hover:text-stone-600 cursor-pointer">
            📤 Import JSON
            <input
              type="file"
              accept=".json"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = () => {
                  try {
                    const plan = JSON.parse(reader.result as string);
                    if (plan.plots !== undefined && plan.monthData !== undefined) {
                      const state = useStore.getState();
                      const now = new Date().toISOString();
                      plan.id = `plan-${Date.now()}`;
                      plan.name = plan.planName || plan.name || 'Imported Plan';
                      plan.createdAt = plan.createdAt || now;
                      plan.updatedAt = now;
                      useStore.setState((s: any) => {
                        s.savedPlans.push(plan);
                      });
                      localStorage.setItem(
                        'garden-planner-saved-plans',
                        JSON.stringify(useStore.getState().savedPlans)
                      );
                      loadSavedPlans();
                    } else {
                      alert('Invalid plan file. The file does not contain plots and monthData.');
                    }
                  } catch {
                    alert('Invalid plan file.');
                  }
                };
                reader.readAsText(file);
              }}
            />
          </label>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-stone-600 hover:text-stone-800"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
