/**
 * Compatibility panel — checks planted vegetables for companion/antagonist
 * relationships using @cropgraph/core's checkBedCompatibility().
 *
 * Shows ALL beneficial pairings (green) and conflict warnings (red) for
 * vegetables placed together on the plot. Hover over any badge to see
 * the mechanism and explanation.
 */

import { useMemo } from 'react';
import { useStore } from '@/store';
import { getVarietyById } from '@/data/vegetables';
import { resolveVarietySlug, getVarietiesByCropSlug } from '@/data/cropgraph';
import { checkBedCompatibility, getBestCompanions } from '@cropgraph/core';
import type { CompanionEntry } from '@cropgraph/core';
import { Badge } from '@/components/ui/Badge';
import { Tooltip } from '@/components/ui/Tooltip';

/** Format a mechanism slug like "pest_repellent" → "Pest Repellent" */
function formatMechanism(mechanism: string): string {
  return mechanism
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function CompanionBadge({
  entry,
  cropName,
  compName,
  variant,
}: {
  entry: CompanionEntry;
  cropName: string;
  compName: string;
  variant: 'success' | 'error';
}) {
  const tooltip = (
    <div className="space-y-1 text-left">
      <div className="font-medium">
        {cropName} {variant === 'success' ? '+' : '✕'} {compName}
      </div>
      <div>
        <span className="text-stone-400">Mechanism:</span>{' '}
        {formatMechanism(entry.mechanism)}
      </div>
      <div>
        <span className="text-stone-400">Strength:</span>{' '}
        {entry.strength.charAt(0).toUpperCase() + entry.strength.slice(1)}
      </div>
      <div className="max-w-48">{entry.description}</div>
    </div>
  );

  return (
    <Tooltip content={tooltip}>
      <Badge variant={variant}>
        {cropName} {variant === 'success' ? '+' : '✕'} {compName}
      </Badge>
    </Tooltip>
  );
}

function PlacedCompanionSuggestions({ names }: { names: Map<string, string> }) {
  const setPendingPlacementVarietyId = useStore((s) => s.setPendingPlacementVarietyId);

  const suggestions = useMemo(() => {
    const placedSlugs = new Set(names.keys());
    const results: { cropName: string; cropSlug: string; suggestion: { entry: CompanionEntry; match: ReturnType<typeof getVarietiesByCropSlug>[0] } }[] = [];

    for (const [slug, cropName] of names) {
      const companions = getBestCompanions(slug, { minStrength: 'moderate', limit: 5 });
      for (const entry of companions) {
        // Skip if already placed
        if (placedSlugs.has(entry.companion)) continue;
        const matches = getVarietiesByCropSlug(entry.companion);
        if (matches.length > 0) {
          results.push({ cropName, cropSlug: slug, suggestion: { entry, match: matches[0] } });
        }
      }
    }
    // Deduplicate by companion slug
    const seen = new Set<string>();
    return results.filter((r) => {
      const key = r.suggestion.entry.companion;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }).slice(0, 10);
  }, [names]);

  if (suggestions.length === 0) return null;

  const handlePlaceCompanion = (varietyId: string) => {
    setPendingPlacementVarietyId(varietyId);
  };

  return (
    <div className="border-t border-stone-200 pt-2">
      <span className="text-xs text-stone-500 font-medium">
        🌿 Suggested companions to add:
      </span>
      <div className="flex flex-wrap gap-1 mt-1">
        {suggestions.map(({ cropName, suggestion: { entry, match } }) => {
          return (
            <Tooltip
              key={`${cropName}-${entry.companion}`}
              content={
                <div className="space-y-1 text-left">
                  <div className="font-medium">{match.vegetableName}</div>
                  <div className="text-stone-300 text-xs">
                    {formatMechanism(entry.mechanism)} · {entry.strength}
                  </div>
                  <div className="text-stone-400 text-xs max-w-48">
                    Grows well with {cropName}. {entry.description}
                  </div>
                </div>
              }
            >
              <button
                onClick={() => handlePlaceCompanion(match.id)}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium transition-colors bg-green-50 text-green-700 hover:bg-green-100 hover:ring-1 hover:ring-green-200"
              >
                + {match.vegetableName}
              </button>
            </Tooltip>
          );
        })}
      </div>
      <p className="text-xs text-stone-400 mt-1">
        Click to start placing on the plot.
      </p>
    </div>
  );
}

export function CompatibilityPanel() {
  const activePlotId = useStore((s) => s.activePlotId);
  const activeMonthIndex = useStore((s) => s.activeMonthIndex);
  const monthData = useStore((s) => s.monthData);
  const customVarieties = useStore((s) => s.customVarieties);

  const placements = activePlotId
    ? monthData[activePlotId]?.[activeMonthIndex]?.placements ?? []
    : [];

  const getVariety = (id: string) => {
    return getVarietyById(id) ?? customVarieties.find((v) => v.id === id);
  };

  const report = useMemo(() => {
    if (placements.length < 2) return null;

    // Resolve unique cropgraph slugs from placed vegetables
    const slugs = new Map<string, string>(); // slug → display name
    for (const p of placements) {
      const variety = getVariety(p.varietyId);
      if (!variety) continue;
      const slug = resolveVarietySlug(variety.vegetableGroupId, variety.vegetableGroupId);
      if (!slugs.has(slug)) {
        slugs.set(slug, variety.vegetableName || variety.name);
      }
    }

    const slugList = [...slugs.keys()];
    if (slugList.length < 2) return null;

    try {
      return { result: checkBedCompatibility(slugList), names: slugs };
    } catch {
      return null;
    }
  }, [placements]);

  if (!report || placements.length < 2) return null;

  const { result, names } = report;

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-stone-700">
        🌱 Companion Compatibility
      </label>

      {/* Warnings */}
      {result.warnings.length > 0 && (
        <div className="space-y-1">
          {result.warnings.map((warning, i) => (
            <div
              key={i}
              className="px-3 py-2 rounded-lg text-xs bg-red-50 border border-red-200 text-red-800"
            >
              ⚠️ {warning}
            </div>
          ))}
        </div>
      )}

      {/* Beneficial pairings — show ALL */}
      {result.beneficial.length > 0 && (
        <div className="space-y-1">
          <span className="text-xs text-green-700 font-medium">
            Beneficial pairings ({result.beneficial.length}):
          </span>
          <div className="flex flex-wrap gap-1">
            {result.beneficial.map((entry, i) => {
              const cropName = names.get(entry.crop) || entry.crop;
              const compName = names.get(entry.companion) || entry.companion;
              return (
                <CompanionBadge
                  key={i}
                  entry={entry}
                  cropName={cropName}
                  compName={compName}
                  variant="success"
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Antagonist pairings — show ALL */}
      {result.antagonist.length > 0 && (
        <div className="space-y-1">
          <span className="text-xs text-red-700 font-medium">
            Conflicts ({result.antagonist.length}):
          </span>
          <div className="flex flex-wrap gap-1">
            {result.antagonist.map((entry, i) => {
              const cropName = names.get(entry.crop) || entry.crop;
              const compName = names.get(entry.companion) || entry.companion;
              return (
                <CompanionBadge
                  key={i}
                  entry={entry}
                  cropName={cropName}
                  compName={compName}
                  variant="error"
                />
              );
            })}
          </div>
        </div>
      )}

      {/* All clear */}
      {result.warnings.length === 0 &&
        result.antagonist.length === 0 &&
        result.beneficial.length === 0 && (
          <p className="text-xs text-stone-400">
            No known companion data for these crops.
          </p>
        )}

      {result.warnings.length === 0 && result.antagonist.length === 0 && result.beneficial.length > 0 && (
        <p className="text-xs text-green-600">All compatible! ✅</p>
      )}

      {/* Companion suggestions: what else could grow with these? */}
      <PlacedCompanionSuggestions names={names} />
    </div>
  );
}
