/**
 * CompanionSuggestions — shows beneficial companion plants for a selected
 * variety, cross-referenced against vegetables actually available in the app.
 *
 * Uses @cropgraph/core's getBestCompanions() for ranked, mechanism-aware
 * recommendations. Each suggestion is clickable to select that vegetable.
 */

import { useMemo } from 'react';
import { useStore } from '@/store';
import { getVarietiesByCropSlug, getVarietyById } from '@/data/cropgraph';
import { resolveVarietySlug } from '@/data/cropgraph';
import { getBestCompanions } from '@cropgraph/core';
import { Tooltip } from '@/components/ui/Tooltip';

interface CompanionSuggestionsProps {
  varietyId: string;
  /** Optional: the parent VegetableGroup id (e.g. 'legumes', 'herbs').
   *  If omitted, derived from the variety's vegetableGroupId. */
  groupId?: string;
}

/** Format a mechanism slug to a short, readable label */
const MECHANISM_LABELS: Record<string, string> = {
  nitrogen_fixing: 'Nitrogen fixer',
  pest_repellent: 'Pest repellent',
  trap_crop: 'Trap crop',
  pollinator_attractor: 'Pollinator magnet',
  shade_provider: 'Shade provider',
  ground_cover: 'Ground cover',
  space_efficiency: 'Space efficient',
  flavor_enhancement: 'Flavour boost',
  structural_support: 'Structural support',
  allelopathic: 'Allelopathic',
  disease_vector: 'Disease risk',
  nutrient_competition: 'Nutrient competition',
};

function formatMechanism(mechanism: string): string {
  return MECHANISM_LABELS[mechanism] || mechanism.replace(/_/g, ' ');
}

export function CompanionSuggestions({ varietyId, groupId }: CompanionSuggestionsProps) {
  const setPendingPlacementVarietyId = useStore((s) => s.setPendingPlacementVarietyId);

  /** Ranked companion suggestions with app-variety matches */
  const suggestions = useMemo(() => {
    const variety = getVarietyById(varietyId);
    if (!variety) return [];
    const parentGroupId = groupId || variety.vegetableGroupId;
    const slug = resolveVarietySlug(variety.vegetableGroupId, parentGroupId);
    const companions = getBestCompanions(slug, { minStrength: 'moderate', limit: 8 });

    // Cross-reference each companion slug against app varieties
    return companions
      .map((entry) => {
        const matchedVarieties = getVarietiesByCropSlug(entry.companion);
        return { entry, matchedVarieties };
      })
      .filter((s) => s.matchedVarieties.length > 0);
  }, [varietyId, groupId]);

  if (suggestions.length === 0) return null;

  const handlePlaceCompanion = (varietyId: string) => {
    setPendingPlacementVarietyId(varietyId);
  };

  return (
    <div className="mt-2 border-t border-stone-200 pt-2">
      <span className="font-medium text-xs text-stone-500">
        🌿 Companion suggestions (grow together):
      </span>
      <div className="flex flex-wrap gap-1.5 mt-1.5">
        {suggestions.map(({ entry, matchedVarieties }) => {
          // Take the first matching variety for the display button
          const match = matchedVarieties[0];
          const moreCount = matchedVarieties.length - 1;

          const tooltip = (
            <div className="space-y-1 text-left">
              <div className="font-medium">{match.vegetableName}</div>
              <div className="text-stone-300 text-xs">
                {formatMechanism(entry.mechanism)} · {entry.strength}
              </div>
              <div className="text-stone-400 text-xs max-w-48">{entry.description}</div>
              {moreCount > 0 && (
                <div className="text-stone-300 text-xs">
                  +{moreCount} more {match.vegetableName.toLowerCase()} varieties available
                </div>
              )}
            </div>
          );

          return (
            <Tooltip key={`${entry.crop}-${entry.companion}`} content={tooltip}>
              <button
                onClick={() => handlePlaceCompanion(match.id)}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium transition-colors bg-green-50 text-green-700 hover:bg-green-100 hover:ring-1 hover:ring-green-200"
              >
                + {match.vegetableName}
                {moreCount > 0 && (
                  <span className="text-green-400">+{moreCount}</span>
                )}
              </button>
            </Tooltip>
          );
        })}
      </div>
      <p className="text-xs text-stone-400 mt-1">
        Click to start placing this companion on the plot.
      </p>
    </div>
  );
}
