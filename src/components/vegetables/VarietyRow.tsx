import { useState } from 'react';
import { useStore } from '@/store';
import type { VegetableVariety } from '@/types';
import { RatingStars } from './RatingStars';
import { Badge } from '@/components/ui/Badge';
import { Tooltip } from '@/components/ui/Tooltip';
import { getMutedVegColor } from '@/constants/theme';
import { CompanionSuggestions } from './CompanionSuggestions';
import { getVarietyTimeline, formatSunRequirement } from '@/utils/calendar/dateCalculations';

interface VarietyRowProps {
  variety: VegetableVariety;
  peopleCount: number;
  onEditCustom?: (variety: VegetableVariety) => void;
}

export function VarietyRow({ variety, peopleCount, onEditCustom }: VarietyRowProps) {
  const removeCustomVariety = useStore((s) => s.removeCustomVariety);
  const pendingPlacementVarietyId = useStore((s) => s.pendingPlacementVarietyId);
  const setPendingPlacementVarietyId = useStore((s) => s.setPendingPlacementVarietyId);
  const pendingPlacementSeasonIndex = useStore((s) => s.pendingPlacementSeasonIndex);
  const setPendingPlacementSeasonIndex = useStore((s) => s.setPendingPlacementSeasonIndex);
  const monthData = useStore((s) => s.monthData);
  const activePlotId = useStore((s) => s.activePlotId);
  const activeMonthIndex = useStore((s) => s.activeMonthIndex);
  const [showDetail, setShowDetail] = useState(false);

  const isCustom = variety.id.startsWith('custom-');
  const maxPlants = Math.round(variety.maxPlantsPerPerson * peopleCount);
  const hasMultipleSeasons = (variety.seasons?.length ?? 0) > 1;

  // Count placements across all plots for current month
  let placementCount = 0;
  if (activePlotId && monthData[activePlotId]?.[activeMonthIndex]) {
    placementCount = monthData[activePlotId][activeMonthIndex].placements.filter(
      (p) => p.varietyId === variety.id
    ).length;
  }
  const hasPlacements = placementCount > 0;

  const isPending = pendingPlacementVarietyId === variety.id;

  const handlePlace = () => {
    if (isPending) {
      setPendingPlacementVarietyId(null);
      setPendingPlacementSeasonIndex(null);
    } else {
      setPendingPlacementVarietyId(variety.id);
      // Default to season 0 if seasons exist and none selected yet
      if (hasMultipleSeasons && pendingPlacementSeasonIndex === null) {
        setPendingPlacementSeasonIndex(0);
      }
    }
  };

  return (
    <>
      <div className="grid grid-cols-[repeat(14,minmax(0,1fr))] gap-2 px-4 py-2.5 items-center text-sm border-b border-stone-50 hover:bg-stone-50 transition-colors w-[840px]">
        {/* Variety name */}
        <div className="col-span-3">
          <button
            onClick={() => setShowDetail(!showDetail)}
            className="text-left hover:text-brand-700 transition-colors"
          >
            <span className="font-medium text-stone-800">{variety.name}</span>
            <span className="text-stone-400 text-xs ml-1">
              {showDetail ? '▲' : '▼'}
            </span>
          </button>
          {isCustom && <Badge variant="warning">✏️ Custom</Badge>}
          {variety.growingHabit && !isCustom && (
            <Badge variant="default">{variety.growingHabit}</Badge>
          )}
        </div>

        {/* Ratings */}
        <div className="col-span-2 flex justify-center">
          <Tooltip content={`Climate suitability: ${variety.climateSuitability}/5 for London`}>
            <RatingStars value={variety.climateSuitability} />
          </Tooltip>
        </div>
        <div className="col-span-2 flex justify-center">
          <Tooltip content={`Yield: ${variety.yield}/5`}>
            <RatingStars value={variety.yield} />
          </Tooltip>
        </div>
        <div className="col-span-2 flex justify-center">
          <Tooltip content={`Taste: ${variety.tastiness}/5`}>
            <RatingStars value={variety.tastiness} />
          </Tooltip>
        </div>
        <div className="col-span-2 flex justify-center">
          {variety.difficulty > 0 ? (
            <Tooltip content={`Difficulty: ${variety.difficulty}/5 (1 = easiest)`}>
              <span className={`text-xs font-medium whitespace-nowrap ${
                variety.difficulty <= 2 ? 'text-green-600' :
                variety.difficulty <= 3 ? 'text-amber-600' : 'text-red-600'
              }`}>
                {'🌱'.repeat(6 - variety.difficulty)}
              </span>
            </Tooltip>
          ) : (
            <span className="text-xs text-stone-300">—</span>
          )}
        </div>
        <div className="col-span-1 flex justify-center">
          {variety.valueForMoney > 0 ? (
            <Tooltip content={`Value for money: ${variety.valueForMoney}/5 vs supermarket`}>
              <span className={`text-xs font-medium ${
                variety.valueForMoney >= 4 ? 'text-green-600' : 'text-stone-500'
              }`}>
                {variety.valueForMoney >= 4 ? '£££' : variety.valueForMoney >= 3 ? '££' : '£'}
              </span>
            </Tooltip>
          ) : (
            <span className="text-xs text-stone-300">—</span>
          )}
        </div>

        {/* Max plants */}
        <div className="col-span-1 text-center">
          <span className="text-sm font-medium text-stone-500">
            {maxPlants > 0 ? maxPlants : <span className="text-stone-300">—</span>}
          </span>
        </div>

        {/* Place button */}
        <div className="col-span-1 flex justify-center">
          <Tooltip content={isPending ? 'Click to cancel placing' : hasPlacements ? `${placementCount} placed — click to place another` : 'Draw this vegetable on the plot'}>
            <button
              onClick={handlePlace}
              className={`px-2 py-1 text-xs rounded transition-colors flex items-center gap-1 ${
                isPending
                  ? 'bg-green-600 text-white'
                  : 'bg-brand-100 text-brand-700 hover:bg-brand-200'
              }`}
            >
              {hasPlacements ? (
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: getMutedVegColor(variety.id) }} />
              ) : (
                <span>📍</span>
              )}
              {isPending ? 'Placing...' : 'Place'}
            </button>
          </Tooltip>
        </div>
      </div>

      {/* Expandable detail */}
      {showDetail && (
        <div className="px-4 py-4 bg-stone-50 border-b border-stone-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-sm text-stone-700 mb-2">About {variety.name}</h4>
              <p className="text-sm text-stone-600 mb-2">{variety.description}</p>
              {isCustom && (
                <div className="flex gap-1 mb-2">
                  <button
                    onClick={() => onEditCustom?.(variety)}
                    className="px-2 py-1 text-xs rounded bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => removeCustomVariety(variety.id)}
                    className="px-2 py-1 text-xs rounded bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                  >
                    🗑 Delete
                  </button>
                </div>
              )}

              {/* ── Key Growing Info ── */}
              <h4 className="font-medium text-sm text-stone-700 mb-2 mt-3">Key Growing Info</h4>
              <div className="bg-white rounded-lg border border-stone-200 p-3 space-y-2 text-sm">
                {/* Sun requirement */}
                <div className="flex items-center gap-2">
                  <span className="text-stone-400 w-5 text-center">☀️</span>
                  <span className="text-stone-500 w-24 shrink-0">Sun</span>
                  <span className="font-medium text-stone-800">
                    {formatSunRequirement(variety.sunRequirement)}
                  </span>
                </div>

                {/* Spacing */}
                <div className="flex items-center gap-2">
                  <span className="text-stone-400 w-5 text-center">📏</span>
                  <span className="text-stone-500 w-24 shrink-0">Spacing</span>
                  <span className="font-medium text-stone-800">
                    {variety.spacing.betweenPlantsCm}cm plants · {variety.spacing.betweenRowsCm}cm rows
                  </span>
                </div>

                {/* Time to harvest */}
                <div className="flex items-center gap-2">
                  <span className="text-stone-400 w-5 text-center">⏱️</span>
                  <span className="text-stone-500 w-24 shrink-0">Harvest in</span>
                  <span className="font-medium text-stone-800">
                    ~{variety.daysToMaturity} days
                  </span>
                </div>

                {/* Season selector (when multiple growing seasons exist) */}
                {hasMultipleSeasons && (
                  <div className="mt-3 pt-3 border-t border-stone-200">
                    <label className="text-xs font-medium text-stone-500 block mb-2">🌱 Growing season for placement</label>
                    <div className="flex flex-wrap gap-1.5">
                      {variety.seasons!.map((season, idx) => {
                        const isActive = pendingPlacementSeasonIndex === idx;
                        const timeline = getVarietyTimeline(variety, undefined, idx);
                        const harvestEntry = timeline.find(e => e.label === 'Harvest');
                        return (
                          <button
                            key={idx}
                            onClick={() => setPendingPlacementSeasonIndex(idx)}
                            className={`px-2.5 py-1.5 text-xs rounded-lg border transition-colors text-left ${
                              isActive
                                ? 'bg-brand-100 border-brand-400 text-brand-800'
                                : 'bg-white border-stone-200 text-stone-600 hover:border-stone-300'
                            }`}
                            title={harvestEntry ? `Harvest: ~${harvestEntry.dateRange}` : ''}
                          >
                            <div className="font-medium">{season.name}</div>
                            {harvestEntry && (
                              <div className="text-[10px] text-stone-400">🧺 ~{harvestEntry.dateRange}</div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Timeline entries (indoor sow, direct sow, plant out, last harvest).
                     When no specific season is selected for placement, show all seasons
                     grouped by name so the user can compare spring vs autumn windows at a glance.
                     When a season IS selected (placement mode), show only that season. */}
                {pendingPlacementSeasonIndex === null && hasMultipleSeasons ? (
                  // Show all seasons grouped
                  variety.seasons!.map((season, idx) => {
                    const seasonTimeline = getVarietyTimeline(variety, undefined, idx);
                    return (
                      <div key={idx} className="mt-1">
                        <div className="text-xs font-medium text-stone-500 mb-1">{season.name}</div>
                        {seasonTimeline.map((entry) => (
                          <div key={entry.label} className="flex items-center gap-2 ml-1">
                            <span className="text-stone-400 w-5 text-center">{entry.emoji}</span>
                            <span className="text-stone-500 w-24 shrink-0">{entry.label}</span>
                            <span className="font-medium text-stone-800">
                              {entry.dateRange ? `~${entry.dateRange}` : '—'}
                            </span>
                          </div>
                        ))}
                      </div>
                    );
                  })
                ) : (
                  // Show single season (default or selected for placement)
                  getVarietyTimeline(variety, undefined, pendingPlacementSeasonIndex ?? undefined).map((entry) => (
                    <div key={entry.label} className="flex items-center gap-2">
                      <span className="text-stone-400 w-5 text-center">{entry.emoji}</span>
                      <span className="text-stone-500 w-24 shrink-0">{entry.label}</span>
                      <span className="font-medium text-stone-800">
                        {entry.dateRange ? `~${entry.dateRange}` : '—'}
                      </span>
                    </div>
                  ))
                )}

                {variety.isPerennial && (
                  <div className="flex items-center gap-2">
                    <span className="text-stone-400 w-5 text-center">🔄</span>
                    <span className="text-stone-500 w-24 shrink-0">Lifespan</span>
                    <span className="font-medium text-green-700">Perennial</span>
                  </div>
                )}
              </div>
            </div>
            <div>
              <h4 className="font-medium text-sm text-stone-700 mb-2">Growing Instructions</h4>
              <p className="text-sm text-stone-600 mb-2">{variety.growingInstructions}</p>
              {variety.commonProblems && variety.commonProblems.length > 0 && (
                <div className="mb-2">
                  <span className="font-medium text-xs text-stone-500">Common pests & diseases:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {variety.commonProblems.slice(0, 10).map((problem) => (
                      <Badge
                        key={problem}
                        variant={problem.startsWith('⚠️') ? 'error' : 'warning'}
                      >
                        {problem.replace('⚠️', '')}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {variety.goodCompanions && variety.goodCompanions.length > 0 && (
                <div className="text-xs text-stone-500 mt-1">
                  <span className="font-medium">Good companions:</span>{' '}
                  {variety.goodCompanions.slice(0, 15).join(', ')}
                </div>
              )}
              {variety.badCompanions && variety.badCompanions.length > 0 && (
                <div className="text-xs text-red-500/70 mt-1">
                  <span className="font-medium">Avoid planting near:</span>{' '}
                  {variety.badCompanions.slice(0, 8).join(', ')}
                </div>
              )}
              <CompanionSuggestions
                varietyId={variety.id}
                groupId={variety.vegetableGroupId}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
