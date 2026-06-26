import { useState, useMemo } from 'react';
import { useStore } from '@/store';
import { allVegetableGroups, getVarietyById, getGroupById } from '@/data/vegetables';
import { getMutedVegColor } from '@/constants/theme';
import { MONTH_NAMES_SHORT, BASE_YEAR } from '@/data/frostDates';
import { getLondonFrostDates } from '@/data/frostDates';
import type { VegetableGroup, VegetablePlacement, VegetableVariety } from '@/types';
import { VegetableCard } from './VegetableCard';
import { FilterBar } from './FilterBar';
import { SearchBar } from './SearchBar';
import { MonthFilter } from './MonthFilter';
import { EmptyState } from '@/components/ui/EmptyState';
import { computeVarietyMonthSets, type MonthFilterActivity } from '@/utils/vegetables/monthFilterUtils';

/** Compute first plant-out month index for a variety, optionally for a specific season.
 * Returns null if no timing data is available. */
function firstPlantOutMonth(variety: VegetableVariety | undefined, seasonIndex?: number): number | null {
  if (!variety) return null;

  const season = (seasonIndex !== undefined && variety.seasons?.[seasonIndex])
    ? variety.seasons[seasonIndex]
    : null;

  // When a season is selected, use only its fields (undefined = not applicable for this season)
  const plantOutWeeks = season !== null ? season.plantOutWeeksAfterLastFrost : variety.plantOutWeeksAfterLastFrost;
  const directSowWeeks = season !== null ? season.directSowWeeksAfterLastFrost : variety.directSowWeeksAfterLastFrost;

  const frostDates = getLondonFrostDates();
  let plantOutDate: Date;
  if (plantOutWeeks !== undefined) {
    plantOutDate = new Date(frostDates.lastSpringFrost);
    plantOutDate.setDate(plantOutDate.getDate() + plantOutWeeks * 7);
  } else if (directSowWeeks !== undefined) {
    plantOutDate = new Date(frostDates.lastSpringFrost);
    plantOutDate.setDate(plantOutDate.getDate() + directSowWeeks * 7);
  } else {
    return null; // no timing data
  }
  // Return absolute month index (0 = Jan of BASE_YEAR)
  const monthsFromBase = (plantOutDate.getFullYear() - BASE_YEAR) * 12 + plantOutDate.getMonth();
  return monthsFromBase;
}

function mergeCustomGroups(
  groups: VegetableGroup[],
  customVarieties: VegetableGroup['varieties'],
): VegetableGroup[] {
  // Sort alphabetically by name
  const sorted = [...groups].sort((a, b) => a.name.localeCompare(b.name));
  if (customVarieties.length === 0) return sorted;
  const customGroup: VegetableGroup = {
    id: 'custom',
    name: 'Custom Crops',
    emoji: '✏️',
    description: 'Crops you have added yourself.',
    varieties: customVarieties,
  };
  // Custom crops at the top, then alphabetical
  return [customGroup, ...sorted];
}

export function VegetableBrowserPage() {
  const peopleCount = useStore((s) => s.peopleCount);
  const categoryFilter = useStore((s) => s.categoryFilter);
  const setCategoryFilter = useStore((s) => s.setCategoryFilter);
  const customVarieties = useStore((s) => s.customVarieties);
  const addCustomVariety = useStore((s) => s.addCustomVariety);
  const updateCustomVariety = useStore((s) => s.updateCustomVariety);
  const activePlotId = useStore((s) => s.activePlotId);
  const activeMonthIndex = useStore((s) => s.activeMonthIndex);
  const monthData = useStore((s) => s.monthData);
  const plots = useStore((s) => s.plots);
  const removePlacementFromAllMonths = useStore((s) => s.removePlacementFromAllMonths);
  const replicatePlacementToAllMonths = useStore((s) => s.replicatePlacementToAllMonths);
  const replicateAllPlacementsToAllMonths = useStore((s) => s.replicateAllPlacementsToAllMonths);
  const selectPlacement = useStore((s) => s.selectPlacement);
  const setActiveMonth = useStore((s) => s.setActiveMonth);
  const selectedPlacementIds = useStore((s) => s.selectedPlacementIds);
  const multiMonthPlacement = useStore((s) => s.multiMonthPlacement);
  const toggleMultiMonthPlacement = useStore((s) => s.toggleMultiMonthPlacement);

  const [searchQuery, setSearchQuery] = useState('');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customCropName, setCustomCropName] = useState('');
  const [customVarietyName, setCustomVarietyName] = useState('');
  const [customClimate, setCustomClimate] = useState(3);
  const [customYield, setCustomYield] = useState(3);
  const [customTaste, setCustomTaste] = useState(3);
  const [customEase, setCustomEase] = useState(3);
  const [customValue, setCustomValue] = useState(3);
  const [customMaxPlants, setCustomMaxPlants] = useState(4);
  const [customPlantOutMonth, setCustomPlantOutMonth] = useState(5); // May default
  const [customHarvestMonths, setCustomHarvestMonths] = useState(3);
  const [editingVarietyId, setEditingVarietyId] = useState<string | null>(null);
  const [selectedActivities, setSelectedActivities] = useState<MonthFilterActivity[]>(['sow', 'plantOut', 'harvest']);
  const [selectedMonths, setSelectedMonths] = useState<number[]>([]);

  const handleToggleActivity = (activity: MonthFilterActivity) => {
    setSelectedActivities((prev) =>
      prev.includes(activity) ? prev.filter((a) => a !== activity) : [...prev, activity]
    );
  };

  const handleToggleMonth = (month: number) => {
    setSelectedMonths((prev) =>
      prev.includes(month) ? prev.filter((m) => m !== month) : [...prev, month]
    );
  };

  // Gather all unique placements across ALL months and ALL plots (unbounded keys)
  const allPlacements = useMemo(() => {
    const map = new Map<string, { placement: VegetablePlacement; months: number[]; seasonYear: number; plotId: string }>();
    for (const plot of plots) {
      const plotMonths = monthData[plot.id];
      if (!plotMonths) continue;
      const monthKeys = Object.keys(plotMonths).map(Number).sort((a, b) => a - b);
      for (const m of monthKeys) {
        const md = plotMonths[m];
        if (!md) continue;
        for (const p of md.placements) {
          const key = `${plot.id}:${p.id}`;
          const entry = map.get(key);
          if (entry) {
            entry.months.push(m);
          } else {
            // Determine the season year from the actual month the placement lives in.
            // Since months are iterated in ascending order, the first encounter is
            // the earliest month (typically the plant-out month). This correctly
            // places future-year placements in their target year instead of always
            // defaulting to BASE_YEAR.
            const seasonYear = BASE_YEAR + Math.floor(m / 12);
            map.set(key, { placement: p, months: [m], seasonYear, plotId: plot.id });
          }
        }
      }
    }
    return map;
  }, [plots, monthData, customVarieties]);

  const toggleGroup = (groupId: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) next.delete(groupId);
      else next.add(groupId);
      return next;
    });
  };

  const handleEditCustom = (variety: VegetableVariety) => {
    setEditingVarietyId(variety.id);
    setCustomCropName(variety.vegetableName);
    setCustomVarietyName(variety.name);
    setCustomClimate(variety.climateSuitability);
    setCustomYield(variety.yield);
    setCustomTaste(variety.tastiness);
    setCustomEase(variety.difficulty);
    setCustomValue(variety.valueForMoney);
    setCustomMaxPlants(variety.maxPlantsPerPerson);
    // Reverse-compute plantOutMonth from plantOutWeeksAfterLastFrost
    if (variety.plantOutWeeksAfterLastFrost !== undefined) {
      const frostDates = getLondonFrostDates();
      const plantOutDate = new Date(frostDates.lastSpringFrost);
      plantOutDate.setDate(plantOutDate.getDate() + variety.plantOutWeeksAfterLastFrost * 7);
      setCustomPlantOutMonth(plantOutDate.getMonth() + 1);
    }
    setCustomHarvestMonths(Math.max(1, Math.round((variety.harvestPeriodWeeks ?? 12) / 4)));
    setShowCustomForm(true);
    setExpandedGroups((prev) => new Set(prev).add('custom'));
  };

  const handleSubmitCustom = () => {
    const crop = customCropName.trim();
    const name = customVarietyName.trim();
    if (!crop || !name) return;
    if (editingVarietyId) {
      updateCustomVariety(editingVarietyId, {
        vegetableName: crop,
        name,
        climate: customClimate,
        yield: customYield,
        taste: customTaste,
        ease: customEase,
        value: customValue,
        maxPlants: customMaxPlants,
        plantOutMonth: customPlantOutMonth,
        harvestMonths: customHarvestMonths,
      });
    } else {
      addCustomVariety(crop, name, {
        climate: customClimate,
        yield: customYield,
        taste: customTaste,
        ease: customEase,
        value: customValue,
        maxPlants: customMaxPlants,
        plantOutMonth: customPlantOutMonth,
        harvestMonths: customHarvestMonths,
      });
    }
    setCustomCropName('');
    setCustomVarietyName('');
    setEditingVarietyId(null);
    setShowCustomForm(false);
  };

  const handleCancelCustom = () => {
    setShowCustomForm(false);
    setEditingVarietyId(null);
    setCustomCropName('');
    setCustomVarietyName('');
  };

  const allGroups = useMemo(
    () => mergeCustomGroups(allVegetableGroups, customVarieties),
    [customVarieties],
  );

  // Precompute month sets for every variety (memoized — only recomputes when custom varieties change)
  const varietyMonthSets = useMemo(() => {
    const map = new Map<string, ReturnType<typeof computeVarietyMonthSets>>();
    for (const group of allGroups) {
      for (const v of group.varieties) {
        map.set(v.id, computeVarietyMonthSets(v));
      }
    }
    return map;
  }, [allGroups]);

  const filteredGroups = useMemo(() => {
    let groups = allGroups;
    if (categoryFilter !== 'all') {
      groups = groups
        .map((g) => ({
          ...g,
          varieties: g.varieties.filter((v) => v.category === categoryFilter),
        }))
        .filter((g) => g.varieties.length > 0);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      groups = groups
        .map((g) => ({
          ...g,
          varieties: g.varieties.filter(
            (v) =>
              v.name.toLowerCase().includes(q) ||
              v.vegetableName.toLowerCase().includes(q) ||
              v.description.toLowerCase().includes(q)
          ),
        }))
        .filter((g) => g.varieties.length > 0);
    }
    // Month filter — only active when at least one month is selected
    if (selectedMonths.length > 0) {
      groups = groups
        .map((g) => ({
          ...g,
          varieties: g.varieties.filter((v) => {
            const sets = varietyMonthSets.get(v.id);
            if (!sets) return false;
            return selectedActivities.some((activity) =>
              sets[activity].some((m) => selectedMonths.includes(m))
            );
          }),
        }))
        .filter((g) => g.varieties.length > 0);
    }
    return groups;
  }, [allGroups, categoryFilter, searchQuery, selectedActivities, selectedMonths, varietyMonthSets]);

  const totalVarieties = allGroups.reduce((s, g) => s + g.varieties.length, 0);
  const filteredCount = filteredGroups.reduce((s, g) => s + g.varieties.length, 0);

  const getVariety = (id: string) => {
    return getVarietyById(id) ?? customVarieties.find((v) => v.id === id);
  };

  // Group placements by plot, then by growing season year, sorted alphabetically
  const groupedByPlotAndSeason = useMemo(() => {
    const plotGroups = new Map<string, Map<number, { placement: VegetablePlacement; months: number[] }[]>>();
    for (const entry of allPlacements.values()) {
      const plotMap = plotGroups.get(entry.plotId) ?? new Map<number, { placement: VegetablePlacement; months: number[] }[]>();
      const list = plotMap.get(entry.seasonYear) ?? [];
      list.push({ placement: entry.placement, months: entry.months });
      plotMap.set(entry.seasonYear, list);
      plotGroups.set(entry.plotId, plotMap);
    }
    // Build sorted result: plots in order, years within each plot sorted, items within each year sorted alphabetically
    const result: { plotId: string; plotName: string; years: { year: number; items: { placement: VegetablePlacement; months: number[] }[] }[] }[] = [];
    for (const plot of plots) {
      const yearMap = plotGroups.get(plot.id);
      if (!yearMap || yearMap.size === 0) continue;
      const years = [...yearMap.entries()]
        .sort(([a], [b]) => a - b)
        .map(([year, items]) => ({
          year,
          items: items.sort((a, b) => {
            const va = getVariety(a.placement.varietyId);
            const vb = getVariety(b.placement.varietyId);
            const nameA = va?.vegetableName ?? a.placement.varietyId;
            const nameB = vb?.vegetableName ?? b.placement.varietyId;
            return nameA.localeCompare(nameB);
          }),
        }));
      result.push({ plotId: plot.id, plotName: plot.name, years });
    }
    return result;
  }, [allPlacements, plots]);

  const totalPlacementCount = [...allPlacements.values()].length;

  /** Format month range as shortened names e.g. "Mar 2026 – Nov 2026" */
  function formatMonthRange(months: number[]): string {
    if (months.length === 0) return '';
    const sorted = [...months].sort((a, b) => a - b);
    const first = sorted[0];
    const last = sorted[sorted.length - 1];
    const firstYear = BASE_YEAR + Math.floor(first / 12);
    const firstMonth = ((first % 12) + 12) % 12;
    const lastYear = BASE_YEAR + Math.floor(last / 12);
    const lastMonth = ((last % 12) + 12) % 12;
    if (first === last) {
      return `${MONTH_NAMES_SHORT[firstMonth]} ${firstYear}`;
    }
    return `${MONTH_NAMES_SHORT[firstMonth]} ${firstYear} – ${MONTH_NAMES_SHORT[lastMonth]} ${lastYear}`;
  }

  /** Return a sowing season label from the placement's seasonIndex, or null */
  function getSeasonLabel(placement: VegetablePlacement): string | null {
    const variety = getVariety(placement.varietyId);
    if (placement.seasonIndex === undefined || !variety?.seasons?.[placement.seasonIndex]) return null;
    const name = variety.seasons[placement.seasonIndex].name;
    if (name.toLowerCase().includes('spring')) return '🌱 Spring';
    if (name.toLowerCase().includes('autumn')) return '🍂 Autumn';
    return name;
  }

  // Count placements in current month across all plots
  const currentMonthCount = plots.reduce((sum, plot) => {
    return sum + (monthData[plot.id]?.[activeMonthIndex]?.placements?.length ?? 0);
  }, 0);

  return (
    <div className="flex flex-col gap-4">
      {/* Placed vegetables — grouped by plot, then by growing season */}
      {totalPlacementCount > 0 && (
        <div className="p-3 bg-brand-50 rounded-lg border border-brand-200">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-sm font-semibold text-brand-800">
                🌱 Placed vegetables ({totalPlacementCount})
              </h3>
              <p className="text-xs text-brand-500">
                {currentMonthCount} in this month · grouped by plot & season
              </p>
            </div>
            {activePlotId && currentMonthCount > 0 && (
              <button
                onClick={() => replicateAllPlacementsToAllMonths(activePlotId)}
                className="px-2 py-1 text-xs font-medium rounded bg-brand-600 text-white hover:bg-brand-700 transition-colors"
                title="Replicate each vegetable to the months it's actually growing (plant-out → harvest)"
              >
                📋 Auto-place by season
              </button>
            )}
          </div>
          <div className="space-y-2 max-h-72 overflow-y-auto">
            {groupedByPlotAndSeason.map(({ plotId, plotName, years }) => (
              <div key={plotId}>
                <div className="text-xs font-bold text-brand-800 mb-1 px-1 uppercase tracking-wide">
                  📍 {plotName}
                </div>
                {years.map(({ year, items }) => (
                  <div key={`${plotId}-${year}`} className="ml-2 mb-2">
                    <div className="text-xs font-semibold text-brand-700 mb-1 px-1">
                      🌱 {year} season ({items.length})
                    </div>
                    <div className="space-y-1">
                      {items.map(({ placement, months }) => {
                        const variety = getVariety(placement.varietyId);
                        const group = variety ? getGroupById(variety.vegetableGroupId) : undefined;
                        const color = getMutedVegColor(placement.varietyId);
                        const monthRange = formatMonthRange(months);
                        const seasonLabel = getSeasonLabel(placement);
                        const isSelected = selectedPlacementIds.includes(placement.id);

                        const handleClick = () => {
                          if (months.length > 0) {
                            setActiveMonth(months[0]);
                          }
                          if (activePlotId !== plotId) {
                            useStore.getState().setActivePlot(plotId);
                          }
                          selectPlacement(placement.id, false);
                        };

                        return (
                          <button
                            key={placement.id}
                            onClick={handleClick}
                            className={`flex items-center justify-between px-2 py-1.5 rounded text-xs bg-white border w-full text-left transition-colors ${
                              isSelected
                                ? 'border-blue-400 ring-2 ring-blue-200'
                                : 'border-brand-100 hover:border-brand-300 hover:bg-brand-50'
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                              <div className="min-w-0 flex items-center gap-1.5 flex-wrap">
                                <span className="font-medium whitespace-nowrap">
                                  {group?.emoji} {variety?.vegetableName ?? placement.varietyId}
                                </span>
                                {variety?.name && (
                                  <span className="text-stone-400">{variety.name}</span>
                                )}
                                {seasonLabel && (
                                  <span className={`text-[10px] px-1 py-0.5 rounded-full font-medium ${
                                    seasonLabel.includes('Spring') ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                                  }`}>
                                    {seasonLabel}
                                  </span>
                                )}
                              </div>
                              <span className="text-stone-400 shrink-0 ml-auto text-[10px] whitespace-nowrap">
                                {monthRange}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 ml-2 shrink-0">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  replicatePlacementToAllMonths(plotId, placement.id);
                                }}
                                className="px-1.5 py-0.5 rounded text-brand-600 hover:bg-brand-100 transition-colors"
                                title="Copy this placement to all months in its growing season"
                              >
                                📋
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removePlacementFromAllMonths(plotId, placement.id);
                                }}
                                className="px-1.5 py-0.5 rounded text-stone-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                                title="Remove from all months"
                              >
                                ✕
                              </button>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ))}
            {groupedByPlotAndSeason.length === 0 && (
              <p className="text-xs text-stone-400 text-center py-2">No vegetables placed yet.</p>
            )}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">Vegetable Browser</h2>
          <p className="text-sm text-stone-500">
            {totalVarieties} varieties available — click Place to add to your plot
          </p>
        </div>
      </div>

      {/* Filters & search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <FilterBar value={categoryFilter} onChange={setCategoryFilter} />
        <SearchBar value={searchQuery} onChange={setSearchQuery} />
      </div>

      {/* Month filter */}
      <MonthFilter
        selectedActivities={selectedActivities}
        onToggleActivity={handleToggleActivity}
        selectedMonths={selectedMonths}
        onToggleMonth={handleToggleMonth}
        onClearMonths={() => setSelectedMonths([])}
      />

      {/* Status bar */}
      <div className="flex items-center gap-3 text-sm">
        <span className="text-stone-500">
          Showing {filteredCount} of {totalVarieties} varieties
          {selectedMonths.length > 0 && (
            <span className="ml-1 text-brand-600">· month filter active</span>
          )}
        </span>
        <button
          onClick={toggleMultiMonthPlacement}
          className={`ml-auto px-2.5 py-1 text-xs rounded-lg border transition-colors ${
            multiMonthPlacement
              ? 'bg-amber-100 border-amber-400 text-amber-800'
              : 'border-stone-300 text-stone-500 hover:bg-stone-100'
          }`}
          title={
            multiMonthPlacement
              ? 'Place across full growing season (plant-out → harvest)'
              : 'Place only in the current month'
          }
        >
          📅 {multiMonthPlacement ? 'Full season' : 'This month'}
        </button>
        <button
          onClick={() => setShowCustomForm(!showCustomForm)}
          className="px-3 py-1 text-xs rounded-lg border border-stone-300 text-stone-600 hover:bg-stone-100 transition-colors"
        >
          ✏️ Custom
        </button>
      </div>

      {/* Custom crop form */}
      {showCustomForm && (
        <div className="p-4 bg-stone-50 rounded-lg border border-stone-200 space-y-3">
          <h3 className="text-sm font-semibold text-stone-700">
            {editingVarietyId ? `✏️ Edit "${customVarietyName || customCropName}"` : '➕ New Custom Crop'}
          </h3>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-xs text-stone-500 mb-1">Crop name</label>
              <input type="text" value={customCropName} onChange={(e) => setCustomCropName(e.target.value)} placeholder="e.g. Oca" className="w-full px-2 py-1.5 text-sm border border-stone-300 rounded focus:ring-2 focus:ring-brand-500 outline-none" />
            </div>
            <div className="flex-1">
              <label className="block text-xs text-stone-500 mb-1">Variety name</label>
              <input type="text" value={customVarietyName} onChange={(e) => setCustomVarietyName(e.target.value)} placeholder="e.g. New Zealand Red" className="w-full px-2 py-1.5 text-sm border border-stone-300 rounded focus:ring-2 focus:ring-brand-500 outline-none" />
            </div>
          </div>

          <div className="flex gap-2">
            {[
              ['Climate', customClimate, setCustomClimate] as const,
              ['Yield', customYield, setCustomYield] as const,
              ['Taste', customTaste, setCustomTaste] as const,
              ['Ease', customEase, setCustomEase] as const,
              ['Value', customValue, setCustomValue] as const,
            ].map(([label, val, setter]) => (
              <div key={label} className="flex-1">
                <label className="block text-[10px] text-stone-400 mb-0.5 text-center">{label}</label>
                <select value={val} onChange={(e) => setter(Number(e.target.value))} className="w-full px-1 py-1.5 text-xs border border-stone-300 rounded focus:ring-2 focus:ring-brand-500 outline-none text-center">
                  {[0,1,2,3,4,5].map((n) => <option key={n} value={n}>{n || '—'}</option>)}
                </select>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-xs text-stone-500 mb-1">Max plants / person</label>
              <input type="number" value={customMaxPlants} onChange={(e) => setCustomMaxPlants(Number(e.target.value))} min={0} max={50} className="w-full px-2 py-1.5 text-sm border border-stone-300 rounded focus:ring-2 focus:ring-brand-500 outline-none" />
            </div>
            <div className="flex-1">
              <label className="block text-xs text-stone-500 mb-1">Plant out month</label>
              <select value={customPlantOutMonth} onChange={(e) => setCustomPlantOutMonth(Number(e.target.value))} className="w-full px-2 py-1.5 text-sm border border-stone-300 rounded focus:ring-2 focus:ring-brand-500 outline-none">
                {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map((m, i) => <option key={m} value={i+1}>{m}</option>)}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-xs text-stone-500 mb-1">Harvest (months)</label>
              <input type="number" value={customHarvestMonths} onChange={(e) => setCustomHarvestMonths(Number(e.target.value))} min={1} max={12} className="w-full px-2 py-1.5 text-sm border border-stone-300 rounded focus:ring-2 focus:ring-brand-500 outline-none" />
            </div>
          </div>

          <div className="flex gap-2">
            <button onClick={handleCancelCustom} className="flex-1 px-3 py-2 text-sm rounded-lg border border-stone-300 text-stone-600 hover:bg-stone-100 transition-colors">Cancel</button>
            <button onClick={handleSubmitCustom} disabled={!customCropName.trim() || !customVarietyName.trim()} className="flex-1 px-3 py-2 text-sm rounded-lg bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
              {editingVarietyId ? 'Update Crop' : 'Add Crop'}
            </button>
          </div>
        </div>
      )}

      {/* Vegetable list */}
      {filteredGroups.length === 0 ? (
        <EmptyState
          icon="🔍"
          title="No vegetables found"
          description="Try adjusting your filters or search terms."
        />
      ) : (
        <div className="space-y-3">
          {filteredGroups.map((group) => (
            <VegetableCard
              key={group.id}
              group={group}
              isExpanded={expandedGroups.has(group.id)}
              onToggle={() => toggleGroup(group.id)}
              peopleCount={peopleCount}
              onEditCustom={handleEditCustom}
            />
          ))}
        </div>
      )}
    </div>
  );
}
