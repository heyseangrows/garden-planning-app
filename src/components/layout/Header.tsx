import { PlanManager } from '@/components/plan/PlanManager';
import { useStore } from '@/store';

export function Header() {
  const startNewPlan = useStore((s) => s.startNewPlan);
  const plots = useStore((s) => s.plots);
  const saveCurrentPlan = useStore((s) => s.saveCurrentPlan);

  const handleNewPlan = () => {
    if (plots.length > 0) {
      const name = prompt('Save current plan as (leave empty to skip):');
      if (name && name.trim()) {
        saveCurrentPlan(name.trim());
      }
      if (!confirm('Start a new blank plan? Any unsaved work will be lost.')) {
        return;
      }
    }
    startNewPlan();
  };

  return (
    <header className="bg-brand-800 text-white shadow-md">
      <div className="w-full px-3 lg:px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🌱</span>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Garden Planner</h1>
            <p className="text-brand-200 text-xs">Plan your perfect vegetable garden</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleNewPlan}
            className="px-3 py-1.5 text-sm font-medium rounded-lg bg-white/15 hover:bg-white/25 text-white transition-colors"
          >
            ✨ New
          </button>
          <span className="text-brand-200 text-sm">London, UK</span>
          <PlanManager />
        </div>
      </div>
    </header>
  );
}
