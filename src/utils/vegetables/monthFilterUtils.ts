import { addDays, addWeeks } from 'date-fns';
import { getLondonFrostDates, BASE_YEAR } from '@/data/frostDates';
import type { VegetableVariety, GrowingSeason } from '@/types';

export type MonthFilterActivity = 'sow' | 'plantOut' | 'harvest';

export interface VarietyMonthSets {
  sow: number[];
  plantOut: number[];
  harvest: number[];
}

/** Convert a date range to the set of calendar months (0-11) it overlaps. */
function addMonthsInRange(set: Set<number>, start: Date, end: Date): void {
  const cursor = new Date(start.getFullYear(), start.getMonth(), 1);
  while (cursor <= end) {
    set.add(cursor.getMonth());
    cursor.setMonth(cursor.getMonth() + 1);
  }
}

/**
 * Compute month indices for one "season config" — may be the variety-level
 * defaults or a single GrowingSeason entry.
 */
function computeSeasonMonthSets(
  season: GrowingSeason | null,
  variety: VegetableVariety,
): { sow: Set<number>; plantOut: Set<number>; harvest: Set<number> } {
  const frostDates = getLondonFrostDates();
  const lastFrost = frostDates.lastSpringFrost;

  // Resolve timing: use season fields when provided, otherwise variety-level
  const indoorSowWeeks =
    season !== null ? season.indoorSowWeeksBeforeLastFrost : variety.indoorSowWeeksBeforeLastFrost;
  const directSowWeeks =
    season !== null ? season.directSowWeeksAfterLastFrost : variety.directSowWeeksAfterLastFrost;
  const plantOutWeeks =
    season !== null ? season.plantOutWeeksAfterLastFrost : variety.plantOutWeeksAfterLastFrost;
  const daysToMaturity =
    season !== null ? season.daysToMaturity : variety.daysToMaturity;
  const harvestPeriodWeeks =
    season !== null ? season.harvestPeriodWeeks : variety.harvestPeriodWeeks;

  const sowMonths = new Set<number>();
  const plantOutMonths = new Set<number>();
  const harvestMonths = new Set<number>();

  // Indoor sow: lastFrost - indoorSowWeeks → +2 week window
  // (window width matches getVarietyTimeline for consistent display/filter behaviour)
  if (indoorSowWeeks !== undefined) {
    const start = addWeeks(lastFrost, -indoorSowWeeks);
    const end = addWeeks(start, 2);
    addMonthsInRange(sowMonths, start, end);
  }

  // Direct sow: lastFrost + directSowWeeks → +3 week window
  // (window width matches getVarietyTimeline for consistent display/filter behaviour)
  if (directSowWeeks !== undefined) {
    const start = addWeeks(lastFrost, directSowWeeks);
    const end = addWeeks(start, 3);
    addMonthsInRange(sowMonths, start, end);
  }

  // Effective plant-out date: plantOutWeeks > directSowWeeks > indoorSow + 6w approx
  let effectivePlantOutWeeks: number | undefined = plantOutWeeks;
  if (effectivePlantOutWeeks === undefined) {
    effectivePlantOutWeeks = directSowWeeks;
  }
  if (effectivePlantOutWeeks === undefined && indoorSowWeeks !== undefined) {
    // Approximate: indoor sow + 6 weeks (matches computeActiveMonths in store)
    effectivePlantOutWeeks = -(indoorSowWeeks - 6);
  }

  // Plant out: effective plant-out date → +2 week window
  // (window width matches getVarietyTimeline for consistent display/filter behaviour)
  // Math.max(0, …) floors negative values (e.g. from cropgraph direct_sow
  // fallback) to the last-frost date, matching getVarietyTimeline behaviour
  if (plantOutWeeks !== undefined) {
    const start = addWeeks(lastFrost, Math.max(0, plantOutWeeks));
    const end = addWeeks(start, 2);
    addMonthsInRange(plantOutMonths, start, end);
  } else if (season === null && directSowWeeks !== undefined) {
    // Direct-sown crops (default season only): use direct sow as effective
    // plant-out. For named seasons the adapter explicitly sets plantOut only
    // when a transplant window exists — don't fall back to directSow here,
    // as autumn-sown seasons can have mid-summer direct-sow dates that would
    // incorrectly populate plantOutMonths.
    const start = addWeeks(lastFrost, directSowWeeks);
    const end = addWeeks(start, 2);
    addMonthsInRange(plantOutMonths, start, end);
  } else if (season === null && indoorSowWeeks !== undefined) {
    // Approximate from indoor sow (default season only — same rationale as above)
    const start = addWeeks(lastFrost, -(indoorSowWeeks - 6));
    const end = addWeeks(start, 2);
    addMonthsInRange(plantOutMonths, start, end);
  }

  // Harvest: effective plant date + daysToMaturity → + harvestPeriodWeeks
  if (effectivePlantOutWeeks !== undefined) {
    const plantOutDate = addWeeks(lastFrost, effectivePlantOutWeeks);
    const harvestStart = addDays(plantOutDate, daysToMaturity);
    const hw = harvestPeriodWeeks ?? 4;
    const harvestEnd = addWeeks(harvestStart, hw);
    addMonthsInRange(harvestMonths, harvestStart, harvestEnd);
  }

  return { sow: sowMonths, plantOut: plantOutMonths, harvest: harvestMonths };
}

/**
 * Compute the set of calendar months (0 = Jan, 11 = Dec) during which a variety
 * can be sown, planted out, or harvested. Considers all growing seasons
 * (top-level defaults + `seasons[]` array). When no timing data is available,
 * returns empty arrays (the variety won't match any month filter).
 */
export function computeVarietyMonthSets(variety: VegetableVariety): VarietyMonthSets {
  const sowMonths = new Set<number>();
  const plantOutMonths = new Set<number>();
  const harvestMonths = new Set<number>();

  // Top-level / default season
  const defaults = computeSeasonMonthSets(null, variety);
  defaults.sow.forEach((m) => sowMonths.add(m));
  defaults.plantOut.forEach((m) => plantOutMonths.add(m));
  defaults.harvest.forEach((m) => harvestMonths.add(m));

  // Additional named seasons (e.g. autumn-sown, spring-sown)
  if (variety.seasons) {
    for (const season of variety.seasons) {
      const s = computeSeasonMonthSets(season, variety);
      s.sow.forEach((m) => sowMonths.add(m));
      s.plantOut.forEach((m) => plantOutMonths.add(m));
      s.harvest.forEach((m) => harvestMonths.add(m));
    }
  }

  return {
    sow: [...sowMonths].sort((a, b) => a - b),
    plantOut: [...plantOutMonths].sort((a, b) => a - b),
    harvest: [...harvestMonths].sort((a, b) => a - b),
  };
}

/**
 * Determine whether a given absolute month index falls within the harvest window
 * for a vegetable variety. Uses the same timing resolution pattern as
 * `computeActiveMonths` in the store: season-specific fields when a seasonIndex
 * is provided, otherwise variety-level defaults.
 *
 * @param variety            The vegetable variety to check
 * @param absoluteMonthIndex Unbounded month index (0 = January of BASE_YEAR)
 * @param seasonIndex        Optional index into variety.seasons[] for multi-season crops
 * @returns true when the variety can be harvested in that month
 */
export function isHarvestMonth(
  variety: VegetableVariety,
  absoluteMonthIndex: number,
  seasonIndex?: number,
): boolean {
  // Resolve timing data: season-specific when available, otherwise variety-level
  let plantOutWeeks: number | undefined;
  let directSowWeeks: number | undefined;
  let indoorSowWeeks: number | undefined;
  let daysToMaturity: number;
  let harvestPeriodWeeks: number | undefined;

  const season =
    seasonIndex !== undefined && variety.seasons?.[seasonIndex]
      ? variety.seasons[seasonIndex]
      : null;

  if (season) {
    indoorSowWeeks = season.indoorSowWeeksBeforeLastFrost;
    directSowWeeks = season.directSowWeeksAfterLastFrost;
    plantOutWeeks =
      season.plantOutWeeksAfterLastFrost ?? season.directSowWeeksAfterLastFrost;
    daysToMaturity = season.daysToMaturity;
    harvestPeriodWeeks = season.harvestPeriodWeeks;
  } else {
    indoorSowWeeks = variety.indoorSowWeeksBeforeLastFrost;
    directSowWeeks = variety.directSowWeeksAfterLastFrost;
    plantOutWeeks = variety.plantOutWeeksAfterLastFrost;
    daysToMaturity = variety.daysToMaturity;
    harvestPeriodWeeks = variety.harvestPeriodWeeks;
  }

  const frostDates = getLondonFrostDates();

  // Determine the effective plant-out date
  let plantOutDate: Date;
  if (plantOutWeeks !== undefined) {
    plantOutDate = new Date(frostDates.lastSpringFrost);
    plantOutDate.setDate(plantOutDate.getDate() + plantOutWeeks * 7);
  } else if (directSowWeeks !== undefined) {
    plantOutDate = new Date(frostDates.lastSpringFrost);
    plantOutDate.setDate(plantOutDate.getDate() + directSowWeeks * 7);
  } else if (indoorSowWeeks !== undefined) {
    // Approximate: indoor sow + 6 weeks
    plantOutDate = new Date(frostDates.lastSpringFrost);
    plantOutDate.setDate(plantOutDate.getDate() + indoorSowWeeks * 7 + 42);
  } else {
    // No timing data available — can't determine harvest
    return false;
  }

  // Compute harvest window
  const harvestStart = new Date(plantOutDate);
  harvestStart.setDate(harvestStart.getDate() + daysToMaturity);
  const harvestWeeks = harvestPeriodWeeks ?? 4;
  const harvestEnd = new Date(harvestStart);
  harvestEnd.setDate(harvestEnd.getDate() + harvestWeeks * 7);

  // Convert to absolute month indices (same coordinate system as activeMonthIndex)
  const harvestStartMonth =
    (harvestStart.getFullYear() - BASE_YEAR) * 12 + harvestStart.getMonth();
  const harvestEndMonth =
    (harvestEnd.getFullYear() - BASE_YEAR) * 12 + harvestEnd.getMonth();

  return (
    absoluteMonthIndex >= harvestStartMonth &&
    absoluteMonthIndex <= harvestEndMonth
  );
}
