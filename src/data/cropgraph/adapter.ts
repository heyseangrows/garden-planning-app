/**
 * Adapter layer: enriches existing hardcoded vegetable data with authoritative
 * growing data from @cropgraph/core (timing, companions, pests).
 *
 * The existing 43 files in src/data/vegetables/ remain the source of app-specific
 * data (cultivar names, ratings, emoji, spacing, descriptions). This adapter
 * enriches them at module load with:
 *   - Frost-anchored planting windows (from @cropgraph/core crop calendar)
 *   - Companion planting relationships (from @cropgraph/core companions)
 *   - Pest/disease associations (from @cropgraph/core pest-disease)
 *
 * Produces the same VegetableGroup[] / VegetableVariety[] types.
 */

import type { VegetableGroup, VegetableVariety, GrowingSeason } from '@/types';
import {
  getCompanions,
  getPestsByCrop,
  listCrops,
  type CropEntry,
  type CropWindow,
} from '@cropgraph/core';
import { resolveVarietySlug, resolveCropSlug, getAppIdsForCropSlug } from './slug-map';

// ---------------------------------------------------------------------------
// Module-level cache (built once at first import)
// ---------------------------------------------------------------------------

let _allVegetableGroups: VegetableGroup[] | null = null;
let _varietyMap: Map<string, VegetableVariety> | null = null;
let _groupMap: Map<string, VegetableGroup> | null = null;

// The raw (un-enriched) vegetable groups from the 43 individual data files
import { allVegetableGroups as rawGroups } from '@/data/vegetables/source';

// ---------------------------------------------------------------------------
// Enrichment
// ---------------------------------------------------------------------------

function buildIndices() {
  // Build slug → CropEntry index
  const cropIndex = new Map<string, CropEntry>();
  for (const crop of listCrops()) {
    cropIndex.set(crop.slug, crop);
  }

  // Build slug → common name for companion resolution
  const slugToCommonName = new Map<string, string>();
  for (const crop of listCrops()) {
    slugToCommonName.set(crop.slug, crop.commonName);
  }

  return { cropIndex, slugToCommonName };
}

const { cropIndex, slugToCommonName } = buildIndices();

function enrichVariety(
  variety: VegetableVariety,
  groupId: string,
): VegetableVariety {
  // Resolve the best @cropgraph/core slug for this variety
  const cropSlug = resolveVarietySlug(variety.vegetableGroupId, groupId);
  const cropEntry = cropIndex.get(cropSlug);

  // --- Compute timing from cropgraph windows ---
  const timing = computeTiming(cropEntry, variety);

  // --- Gather companion & pest data from cropgraph ---
  const goodComps = new Set(variety.goodCompanions || []);
  const badComps = new Set(variety.badCompanions || []);
  const problems = new Set(variety.commonProblems || []);

  if (cropSlug) {
    try {
      const { companions, antagonists } = getCompanions(cropSlug);
      for (const c of companions) {
        goodComps.add(slugToCommonName.get(c.companion) || c.companion);
      }
      for (const a of antagonists) {
        badComps.add(slugToCommonName.get(a.companion) || a.companion);
      }
    } catch {
      // companion data may not exist for this slug
    }

    try {
      const pests = getPestsByCrop(cropSlug);
      for (const p of pests) {
        // Format: "late-blight" → "Late blight" (no severity suffix in display name)
        const name = p.pest
          .split('-')
          .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ');
        const severity = p.severity === 'severe' || p.severity === 'high'
          ? `⚠️${name}`
          : name;

        // Deduplicate: skip if any existing hardcoded problem already mentions
        // this pest (case-insensitive substring match). This prevents e.g.
        // "Flea beetle in dry spring weather" + "Flea Beetle" duplicates.
        const normalized = name.toLowerCase();
        const isDuplicate = [...problems].some(existing =>
          existing.toLowerCase().includes(normalized),
        );
        if (!isDuplicate) {
          problems.add(severity);
        }
      }
    } catch {
      // pest data may not exist for this slug
    }
  }

  // --- Build growing instructions ---
  const sourceAttr = cropEntry?.source ? `[Source: ${cropEntry.source}]` : '';
  const cropgraphNotes = cropEntry?.notes
    ? [sourceAttr, cropEntry.notes].filter(Boolean).join(' ')
    : '';
  const growingInstructions = [variety.growingInstructions, cropgraphNotes]
    .filter(Boolean)
    .join('\n\n');

  return {
    ...variety,
    // Timing: use existing values if set, otherwise compute from cropgraph
    daysToMaturity: variety.daysToMaturity || timing.daysToMaturity,
    indoorSowWeeksBeforeLastFrost:
      variety.indoorSowWeeksBeforeLastFrost ?? timing.indoorSowWeeksBeforeLastFrost,
    directSowWeeksAfterLastFrost:
      variety.directSowWeeksAfterLastFrost ?? timing.directSowWeeksAfterLastFrost,
    plantOutWeeksAfterLastFrost:
      variety.plantOutWeeksAfterLastFrost ?? timing.plantOutWeeksAfterLastFrost,
    harvestPeriodWeeks:
      variety.harvestPeriodWeeks ?? timing.harvestPeriodWeeks,

    // Multi-season data: hardcoded seasons take precedence, else derive from cropgraph
    seasons: variety.seasons ?? (cropEntry ? extractSeasons(cropEntry, variety) : undefined),

    // Enriched companion/pest data
    goodCompanions: goodComps.size > 0 ? [...goodComps] : undefined,
    badCompanions: badComps.size > 0 ? [...badComps] : undefined,
    commonProblems: problems.size > 0 ? [...problems] : undefined,
    growingInstructions,
  };
}

// ---------------------------------------------------------------------------
// Timing computation
// ---------------------------------------------------------------------------

interface ComputedTiming {
  daysToMaturity: number;
  indoorSowWeeksBeforeLastFrost?: number;
  directSowWeeksAfterLastFrost?: number;
  plantOutWeeksAfterLastFrost?: number;
  harvestPeriodWeeks?: number;
}

function computeTiming(
  cropEntry: CropEntry | undefined,
  variety: VegetableVariety,
): ComputedTiming {
  if (!cropEntry) {
    return {
      daysToMaturity: variety.daysToMaturity,
      indoorSowWeeksBeforeLastFrost: variety.indoorSowWeeksBeforeLastFrost,
      directSowWeeksAfterLastFrost: variety.directSowWeeksAfterLastFrost,
      plantOutWeeksAfterLastFrost: variety.plantOutWeeksAfterLastFrost,
      harvestPeriodWeeks: variety.harvestPeriodWeeks,
    };
  }

  const windows = cropEntry.windows || [];

  const indoorSow = windows.find(
    (w: CropWindow) => w.action === 'start_indoors' && w.anchor === 'last_spring',
  );
  const directSow = windows.find(
    (w: CropWindow) => w.action === 'direct_sow' && w.anchor === 'last_spring',
  );
  const transplant = windows.find(
    (w: CropWindow) => w.action === 'transplant' && w.anchor === 'last_spring',
  );

  // Convert frost-relative days to weeks.
  // Use Math.round (not Math.ceil) for consistency with extractSeasons().
  // Negative fromFrostDays means "before last frost" — valid for cold-hardy
  // crops that can be direct-sown or transplanted ahead of the frost date.
  const indoorSowWeeks = indoorSow
    ? Math.round(Math.abs(Math.min(0, indoorSow.fromFrostDays)) / 7)
    : undefined;

  const directSowWeeks = directSow
    ? Math.round(directSow.fromFrostDays / 7)
    : undefined;

  const plantOutWeeks = transplant
    ? Math.round(Math.max(0, transplant.fromFrostDays) / 7)
    : undefined;

  // Harvest period: cannot be reliably computed from daysToHarvest delta.
  // daysToHarvest.min/max is the maturity spread across cultivars, not how
  // long a single sowing continues to produce. Let the ?? operator preserve
  // any hardcoded variety.harvestPeriodWeeks; consumers default to 4 weeks
  // when undefined.

  return {
    daysToMaturity: cropEntry.daysToHarvest?.min ?? variety.daysToMaturity,
    indoorSowWeeksBeforeLastFrost: variety.indoorSowWeeksBeforeLastFrost ?? indoorSowWeeks,
    directSowWeeksAfterLastFrost: variety.directSowWeeksAfterLastFrost ?? directSowWeeks,
    plantOutWeeksAfterLastFrost: variety.plantOutWeeksAfterLastFrost ?? plantOutWeeks,
    harvestPeriodWeeks: variety.harvestPeriodWeeks ?? undefined,
  };
}

// ---------------------------------------------------------------------------
// Multi-season extraction from cropgraph windows
// ---------------------------------------------------------------------------

/**
 * Convert a frosted-relative days value to weeksAfterLastFrost.
 * Positive = after last frost, negative = before last frost.
 */
function frostDaysToWeeks(fromFrostDays: number): number {
  return Math.round(fromFrostDays / 7);
}

/**
 * Extract multiple GrowingSeasons from a @cropgraph/core CropEntry's windows array.
 * Groups windows by anchor (last_spring vs first_fall) into distinct named seasons.
 * Returns undefined when there's only one logical season (all windows share the same anchor).
 */
function extractSeasons(cropEntry: CropEntry, variety: VegetableVariety): GrowingSeason[] | undefined {
  const windows = cropEntry.windows || [];
  if (windows.length === 0) return undefined;

  // Group windows by anchor
  const springWindows = windows.filter((w) => w.anchor === 'last_spring');
  const fallWindows = windows.filter((w) => w.anchor === 'first_fall');

  // Only return multiple seasons when both spring and fall are present
  if (fallWindows.length === 0) return undefined;

  const seasons: GrowingSeason[] = [];

  // --- Spring season (anchor: last_spring) ---
  const springIndoor = springWindows.find((w) => w.action === 'start_indoors');
  const springDirectSow = springWindows.find((w) => w.action === 'direct_sow');
  const springTransplant = springWindows.find((w) => w.action === 'transplant');

  // Determine daysToMaturity — for spring, use cropEntry.daysToHarvest.min
  const springDaysToMaturity = cropEntry.daysToHarvest?.min ?? 60;

  // Harvest period: use a 4-week minimum default. The daysToHarvest delta
  // reflects cultivar maturity spread, not harvest window duration.
  // When the variety has a hardcoded harvestPeriodWeeks, use it as a floor.
  const fallbackHarvestWeeks = Math.max(4, variety.harvestPeriodWeeks ?? 4);

  // Determine the "plant out" reference date: prefer transplant, else direct sow
  const springPlantOut = springTransplant ?? springDirectSow;

  if (springPlantOut || springIndoor) {
    seasons.push({
      name: 'Spring sown',
      indoorSowWeeksBeforeLastFrost: variety.indoorSowWeeksBeforeLastFrost ?? (springIndoor
        ? Math.round(Math.abs(Math.min(0, springIndoor.fromFrostDays)) / 7)
        : undefined),
      directSowWeeksAfterLastFrost: variety.directSowWeeksAfterLastFrost ?? (springDirectSow
        ? frostDaysToWeeks(springDirectSow.fromFrostDays)
        : undefined),
      // Only set plantOut when a dedicated spring transplant window exists.
      // Direct-sown spring crops don't need transplanting — falling back to
      // directSowWeeks creates a misleading "Plant out" entry at the same time
      // as "Direct sow" (consistent with autumn handling below).
      plantOutWeeksAfterLastFrost: variety.plantOutWeeksAfterLastFrost ?? (springTransplant
        ? frostDaysToWeeks(Math.max(0, springTransplant.fromFrostDays))
        : undefined),
      daysToMaturity: variety.daysToMaturity || springDaysToMaturity,
      harvestPeriodWeeks: variety.harvestPeriodWeeks || fallbackHarvestWeeks,
      isOverwintering: (variety.daysToMaturity || springDaysToMaturity) >= 200,
    });
  } else {
    // No cropgraph spring windows, but the variety may still have hardcoded
    // spring-sowing timing (e.g. mache has directSowWeeksAfterLastFrost but
    // cropgraph only provides first_fall windows). Surface these as a named
    // "Spring sown" season so users aren't forced to use the unlabelled default.
    const hasSpringData =
      variety.indoorSowWeeksBeforeLastFrost !== undefined ||
      variety.directSowWeeksAfterLastFrost !== undefined ||
      variety.plantOutWeeksAfterLastFrost !== undefined;
    if (hasSpringData) {
      seasons.push({
        name: 'Spring sown',
        indoorSowWeeksBeforeLastFrost: variety.indoorSowWeeksBeforeLastFrost,
        directSowWeeksAfterLastFrost: variety.directSowWeeksAfterLastFrost,
        plantOutWeeksAfterLastFrost: variety.plantOutWeeksAfterLastFrost,
        daysToMaturity: variety.daysToMaturity || springDaysToMaturity,
        harvestPeriodWeeks: variety.harvestPeriodWeeks || fallbackHarvestWeeks,
        isOverwintering: (variety.daysToMaturity || springDaysToMaturity) >= 200,
      });
    }
  }

  // --- Autumn / overwintering season (anchor: first_fall) ---
  // first_fall windows: negative fromFrostDays = "N days before first fall frost"
  // e.g. fromFrostDays: -84 means "sow 84 days (12 weeks) before first fall frost"
  // For UK London: first fall frost ~Oct 15. -84 days = mid-July sowing.
  // Plant out = roughly at sowing time for direct_sow; or for transplanted crops
  // the transplant window tells us.
  const fallDirectSow = fallWindows.find((w) => w.action === 'direct_sow');
  const fallTransplant = fallWindows.find((w) => w.action === 'transplant');
  const fallStartIndoors = fallWindows.find((w) => w.action === 'start_indoors');
  const fallPlantNow = fallWindows.find((w) => w.action === 'plant_now');

  // For fall-sown crops, the "plant out" is relative to first_fall frost
  // Convert to weeks relative to last_spring frost for consistency with our data model.
  // London: last spring ~May 11, first fall ~Oct 15. Gap = ~157 days = ~22 weeks.
  // A window at "first_fall - 84 days" = 157 - 84 = 73 days after last spring frost ~= 10 weeks.
  // So: weeksAfterLastFrost = 22 + (fromFrostDays / 7) where fromFrostDays is negative.
  const SPRING_TO_FALL_FROST_WEEKS = 22; // approx weeks between last spring and first fall frost for London

  /**
   * Compute indoor-sow timing from a first_fall-anchored start_indoors window.
   * Returns a negative value for indoorSowWeeksBeforeLastFrost to represent
   * "weeks AFTER last spring frost" (the field is subtracted from last frost,
   * so a negative value moves the date forward). Returns undefined when no
   * fall start_indoors window exists.
   */
  const fallIndoorSowWeeks = fallStartIndoors
    ? -(SPRING_TO_FALL_FROST_WEEKS + frostDaysToWeeks(fallStartIndoors.fromFrostDays))
    : undefined;

  // For overwintering crops: daysToMaturity from autumn sowing is typically longer
  // because growth slows over winter. Used as a floor: Math.max(variety.daysToMaturity, ...)
  // ensures the variety's hardcoded value takes precedence when larger (e.g. 250 days for
  // Purple Sprouting Broccoli vs. cropgraph's 55-day generic calabrese minimum).
  const overwinteringBonusDays = 60; // extra days for slow autumn/winter growth

  if (fallDirectSow || fallPlantNow) {
    // Long-season annuals (>=200 days, <300 days) are spring-sown only.
    // The cropgraph first_fall direct_sow window is for fast-maturing types
    // (e.g. 55-day calabrese) that produce a same-year fall harvest.
    // Applying it to 200+ day overwintering crops creates a bogus pathway
    // (e.g. PSB cannot be July-sown — it needs vernalization).
    // Biennials (>=300 days, e.g. caraway) are excluded — autumn sowing is
    // a legitimate part of their two-year cycle.
    const isLongSeasonAnnual = variety.daysToMaturity >= 200 && variety.daysToMaturity < 300;

    if (!isLongSeasonAnnual) {
      const fallFromFrost = fallDirectSow?.fromFrostDays ?? fallPlantNow?.fromFrostDays ?? 0;
      const sowWeeksAfterLastFrost = SPRING_TO_FALL_FROST_WEEKS + frostDaysToWeeks(fallFromFrost);

      // Only set plantOut when a dedicated fall transplant window exists.
      // Direct-sown autumn crops (e.g. mache) don't need transplanting —
      // falling back to sowWeeksAfterLastFrost produces a misleading
      // "Plant out" entry at the same time as "Direct sow".
      const plantOutWeeks = fallTransplant
        ? SPRING_TO_FALL_FROST_WEEKS + frostDaysToWeeks(fallTransplant.fromFrostDays)
        : undefined;

      seasons.push({
        name: 'Autumn sown (overwintered)',
        indoorSowWeeksBeforeLastFrost: fallIndoorSowWeeks,
        directSowWeeksAfterLastFrost: sowWeeksAfterLastFrost,
        plantOutWeeksAfterLastFrost: plantOutWeeks,
        daysToMaturity: Math.max(variety.daysToMaturity, (cropEntry.daysToHarvest?.min ?? 60) + overwinteringBonusDays),
        harvestPeriodWeeks: Math.max(fallbackHarvestWeeks, 4),
        isOverwintering: true,
      });
    }
  } else if (fallStartIndoors || fallTransplant) {
    // Fall-transplanted crop (e.g. brussels sprouts started indoors for fall harvest)
    const fallStart = fallStartIndoors?.fromFrostDays ?? -140;
    const fallTrans = fallTransplant?.fromFrostDays ?? -112;

    seasons.push({
      name: 'Overwintered (autumn harvest)',
      indoorSowWeeksBeforeLastFrost: fallIndoorSowWeeks,
      plantOutWeeksAfterLastFrost: SPRING_TO_FALL_FROST_WEEKS + frostDaysToWeeks(fallStart),
      directSowWeeksAfterLastFrost: SPRING_TO_FALL_FROST_WEEKS + frostDaysToWeeks(fallStart),
      daysToMaturity: Math.max(variety.daysToMaturity, cropEntry.daysToHarvest?.min ?? 90),
      harvestPeriodWeeks: Math.max(fallbackHarvestWeeks, 6),
      isOverwintering: true,
    });
  }

  return seasons.length > 0 ? seasons : undefined;
}

// ---------------------------------------------------------------------------
// Build enriched groups
// ---------------------------------------------------------------------------

function enrichAllGroups(groups: VegetableGroup[]): VegetableGroup[] {
  return groups.map((group) => ({
    ...group,
    varieties: group.varieties.map((v) => enrichVariety(v, group.id)),
  }));
}

function buildAllGroups(): VegetableGroup[] {
  if (_allVegetableGroups) return _allVegetableGroups;

  const enriched = enrichAllGroups(rawGroups);

  _allVegetableGroups = enriched;
  _varietyMap = new Map(enriched.flatMap((g) => g.varieties).map((v) => [v.id, v]));
  _groupMap = new Map(enriched.map((g) => [g.id, g]));

  return enriched;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export const allVegetableGroups: VegetableGroup[] = buildAllGroups();

export function getVarietyById(id: string): VegetableVariety | undefined {
  buildAllGroups();
  return _varietyMap?.get(id);
}

export function getAllVarieties(): VegetableVariety[] {
  buildAllGroups();
  return [...(_varietyMap?.values() ?? [])];
}

export function getGroupById(id: string): VegetableGroup | undefined {
  buildAllGroups();
  return _groupMap?.get(id);
}

export function getAllGroups(): VegetableGroup[] {
  return buildAllGroups();
}

// ---------------------------------------------------------------------------
// Reverse lookup: cropgraph slug → app varieties
// ---------------------------------------------------------------------------

let _slugToVarieties: Map<string, VegetableVariety[]> | null = null;

function buildSlugToVarieties(): Map<string, VegetableVariety[]> {
  if (_slugToVarieties) return _slugToVarieties;

  _slugToVarieties = new Map();
  for (const variety of getAllVarieties()) {
    const group = getGroupById(variety.vegetableGroupId);
    const slug = resolveVarietySlug(variety.vegetableGroupId, group?.id ?? variety.vegetableGroupId);
    const list = _slugToVarieties.get(slug) ?? [];
    list.push(variety);
    _slugToVarieties.set(slug, list);
  }
  return _slugToVarieties;
}

/**
 * Find all app varieties that correspond to a given @cropgraph/core slug.
 * Returns an empty array if no varieties match (e.g. cropgraph has "marigold"
 * but the app doesn't include it as a vegetable).
 */
export function getVarietiesByCropSlug(cropSlug: string): VegetableVariety[] {
  const map = buildSlugToVarieties();

  // Direct match
  const direct = map.get(cropSlug);
  if (direct && direct.length > 0) return direct;

  // Reverse lookup: try all app IDs that map to this cropgraph slug
  for (const appId of getAppIdsForCropSlug(cropSlug)) {
    const match = map.get(appId);
    if (match && match.length > 0) return match;
  }

  return [];
}
