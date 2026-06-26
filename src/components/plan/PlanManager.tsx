import { useState } from 'react';
import { useStore } from '@/store';
import { SavePlanDialog } from './SavePlanDialog';
import { LoadPlanDialog } from './LoadPlanDialog';

export function PlanManager() {
  const [showSave, setShowSave] = useState(false);
  const [showLoad, setShowLoad] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleExportCurrent = () => {
    const state = useStore.getState();
    const plan = {
      planName: state.planName || 'Garden Plan',
      plots: state.plots,
      monthData: state.monthData,
      peopleCount: state.peopleCount,
      useGrowLights: state.useGrowLights,
      useFleece: state.useFleece,
      categoryFilter: state.categoryFilter,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(plan, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'garden_plan.json';
    a.click();
    URL.revokeObjectURL(url);
    setMenuOpen(false);
  };

  return (
    <>
      <div className="relative">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-stone-600 hover:text-stone-800 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors"
          title="Plan management"
        >
          💾 Plan
        </button>

        {menuOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
            <div className="absolute right-0 top-full mt-1 z-20 bg-white rounded-lg shadow-lg border border-stone-200 py-1 w-44">
              <button
                onClick={() => { setShowSave(true); setMenuOpen(false); }}
                className="w-full text-left px-3 py-2 text-sm text-stone-700 hover:bg-stone-50"
              >
                💾 Save Plan
              </button>
              <button
                onClick={() => { setShowLoad(true); setMenuOpen(false); }}
                className="w-full text-left px-3 py-2 text-sm text-stone-700 hover:bg-stone-50"
              >
                📂 Load Plan
              </button>
              <button
                onClick={handleExportCurrent}
                className="w-full text-left px-3 py-2 text-sm text-stone-700 hover:bg-stone-50"
              >
                📥 Export Current
              </button>
            </div>
          </>
        )}
      </div>

      <SavePlanDialog open={showSave} onClose={() => setShowSave(false)} />
      <LoadPlanDialog open={showLoad} onClose={() => setShowLoad(false)} />
    </>
  );
}
