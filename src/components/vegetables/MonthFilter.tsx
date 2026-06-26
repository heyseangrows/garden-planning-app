import { MONTH_NAMES_SHORT } from '@/data/frostDates';
import type { MonthFilterActivity } from '@/utils/vegetables/monthFilterUtils';

interface MonthFilterProps {
  selectedActivities: MonthFilterActivity[];
  onToggleActivity: (activity: MonthFilterActivity) => void;
  selectedMonths: number[];
  onToggleMonth: (month: number) => void;
  onClearMonths: () => void;
}

const ACTIVITIES: { key: MonthFilterActivity; label: string; emoji: string }[] = [
  { key: 'sow', label: 'Sow', emoji: '🌱' },
  { key: 'plantOut', label: 'Plant Out', emoji: '🌿' },
  { key: 'harvest', label: 'Harvest', emoji: '🧺' },
];

export function MonthFilter({
  selectedActivities,
  onToggleActivity,
  selectedMonths,
  onToggleMonth,
  onClearMonths,
}: MonthFilterProps) {
  const handleActivityToggle = (activity: MonthFilterActivity) => {
    // Prevent deselecting the last activity
    if (selectedActivities.length === 1 && selectedActivities.includes(activity)) {
      return;
    }
    onToggleActivity(activity);
  };

  return (
    <div className="flex flex-col gap-2">
      {/* Activity type toggles */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs font-medium text-stone-500">Activity:</span>
        {ACTIVITIES.map(({ key, label, emoji }) => (
          <button
            key={key}
            onClick={() => handleActivityToggle(key)}
            className={`px-2.5 py-1 text-xs font-medium rounded border transition-colors ${
              selectedActivities.includes(key)
                ? 'bg-brand-100 text-brand-800 border-brand-300'
                : 'bg-white text-stone-500 border-stone-200 hover:bg-stone-50'
            }`}
          >
            {emoji} {label}
          </button>
        ))}
      </div>

      {/* Month toggle buttons */}
      <div className="flex items-center gap-1 flex-wrap">
        <span className="text-xs font-medium text-stone-500 mr-1">Months:</span>
        {MONTH_NAMES_SHORT.map((name, i) => (
          <button
            key={i}
            onClick={() => onToggleMonth(i)}
            className={`px-2 py-0.5 text-xs rounded border transition-colors ${
              selectedMonths.includes(i)
                ? 'bg-brand-600 text-white border-brand-600'
                : 'bg-white text-stone-600 border-stone-300 hover:bg-stone-50'
            }`}
          >
            {name}
          </button>
        ))}
        {selectedMonths.length > 0 && (
          <button
            onClick={onClearMonths}
            className="ml-1 px-1.5 py-0.5 text-xs rounded text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors"
          >
            clear
          </button>
        )}
      </div>
    </div>
  );
}
