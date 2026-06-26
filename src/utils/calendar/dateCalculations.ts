import { addWeeks, addDays, isWithinInterval, startOfMonth, endOfMonth } from 'date-fns';
import type { VegetableVariety, CalendarAction, CalendarEntry, CalendarData, CalendarRow } from '@/types';
import type { VegetableSelection } from '@/types';
import { getLondonFrostDates, MONTH_NAMES } from '@/data/frostDates';

export interface CalendarConfig {
  useGrowLights: boolean;
  useFleece: boolean;
}

export function generateCalendarData(
  selections: VegetableSelection[],
  varieties: Map<string, VegetableVariety>,
  config: CalendarConfig,
  /** Optional map from varietyId → seasonIndex for season-aware calendar generation. */
  seasonIndexByVariety?: Map<string, number>,
  year?: number
): CalendarData {
  const frostDates = getLondonFrostDates(year);
  const months = generateMonths(frostDates.lastSpringFrost, frostDates.firstFallFrost, year);

  const rows: CalendarRow[] = [];

  for (const sel of selections) {
    if (sel.quantity <= 0) continue;
    const variety = varieties.get(sel.varietyId);
    if (!variety) continue;

    const seasonIdx = seasonIndexByVariety?.get(sel.varietyId);
    const entries = generateVarietyEntries(variety, frostDates.lastSpringFrost, config, months, seasonIdx);
    rows.push({
      varietyId: sel.varietyId,
      varietyName: variety.name,
      entries,
    });
  }

  rows.sort((a, b) => a.varietyName.localeCompare(b.varietyName));

  return { rows, months };
}

function generateMonths(lastFrost: Date, firstFrost: Date, year?: number): CalendarData['months'] {
  const y = year ?? new Date().getFullYear();
  // Start from January, go through December
  // But only show months where gardening actions might happen (Feb through Nov for London)
  const months: CalendarData['months'] = [];
  for (let m = 1; m <= 10; m++) {
    // Feb (1) through Nov (10)
    months.push({ index: m, label: MONTH_NAMES[m], year: y });
  }
  return months;
}

function generateVarietyEntries(
  variety: VegetableVariety,
  lastFrost: Date,
  config: CalendarConfig,
  months: CalendarData['months'],
  seasonIndex?: number,
): CalendarEntry[] {
  // Resolve timing from the selected season (same pattern as getVarietyTimeline)
  const season = (seasonIndex !== undefined && variety.seasons?.[seasonIndex])
    ? variety.seasons[seasonIndex]
    : null;

  const indoorSowWeeks = season !== null ? season.indoorSowWeeksBeforeLastFrost : variety.indoorSowWeeksBeforeLastFrost;
  const directSowWeeks = season !== null ? season.directSowWeeksAfterLastFrost : variety.directSowWeeksAfterLastFrost;
  const plantOutWeeks = season !== null ? season.plantOutWeeksAfterLastFrost : variety.plantOutWeeksAfterLastFrost;
  const daysToMaturity = season !== null ? season.daysToMaturity : variety.daysToMaturity;
  const harvestPeriodWeeks = season !== null ? season.harvestPeriodWeeks : variety.harvestPeriodWeeks;

  const growLightsOffset = config.useGrowLights && variety.benefitsFromGrowLights
    ? variety.growLightsExtendWeeks : 0;
  const fleeceOffset = config.useFleece && variety.benefitsFromFleece
    ? variety.fleeceExtendWeeks : 0;

  // Calculate key date ranges
  const indoorSowStart = indoorSowWeeks
    ? addWeeks(lastFrost, -(indoorSowWeeks + growLightsOffset))
    : null;
  const indoorSowEnd = indoorSowStart ? addWeeks(indoorSowStart, 3) : null;

  const directSowStart = directSowWeeks !== undefined
    ? addWeeks(lastFrost, directSowWeeks - (fleeceOffset > 0 ? Math.floor(fleeceOffset / 2) : 0))
    : null;
  const directSowEnd = directSowStart ? addWeeks(directSowStart, 4) : null;

  const plantOutStart = plantOutWeeks !== undefined
    ? addWeeks(lastFrost, Math.max(0, plantOutWeeks - (fleeceOffset > 0 ? Math.floor(fleeceOffset / 2) : 0)))
    : null;
  const plantOutEnd = plantOutStart ? addWeeks(plantOutStart, 3) : null;

  // Harvest: from plant-out + daysToMaturity (if transplanted) or from direct-sow + daysToMaturity
  const maturityDate = plantOutStart
    ? addDays(plantOutStart, daysToMaturity)
    : directSowStart
    ? addDays(directSowStart, daysToMaturity)
    : null;
  const harvestEnd = maturityDate && harvestPeriodWeeks
    ? addWeeks(maturityDate, harvestPeriodWeeks)
    : maturityDate;

  return months.map((month) => {
    const monthStart = startOfMonth(new Date(month.year, month.index, 1));
    const monthEnd = endOfMonth(new Date(month.year, month.index, 1));
    const actions: CalendarAction[] = [];

    // Indoor sow
    if (indoorSowStart && indoorSowEnd && dateRangeOverlapsMonth(indoorSowStart, indoorSowEnd, monthStart, monthEnd)) {
      actions.push({
        type: 'indoor-sow',
        startDate: indoorSowStart,
        endDate: indoorSowEnd,
        label: formatDateRange(indoorSowStart, indoorSowEnd),
        details: variety.sowDepth ? `Sow ${variety.sowDepth} in modules indoors. ${variety.germinationTemp ? `Germination: ${variety.germinationTemp}` : ''}` : 'Sow indoors in seed trays or modules.',
      });
    }

    // Direct sow
    if (directSowStart && directSowEnd && dateRangeOverlapsMonth(directSowStart, directSowEnd, monthStart, monthEnd)) {
      actions.push({
        type: 'direct-sow',
        startDate: directSowStart,
        endDate: directSowEnd,
        label: formatDateRange(directSowStart, directSowEnd),
        details: variety.sowDepth ? `Sow ${variety.sowDepth} directly in prepared soil. Keep moist until germination.` : 'Sow directly in prepared soil. Keep moist.',
      });
    }

    // Plant out
    if (plantOutStart && plantOutEnd && dateRangeOverlapsMonth(plantOutStart, plantOutEnd, monthStart, monthEnd)) {
      actions.push({
        type: 'plant-out',
        startDate: plantOutStart,
        endDate: plantOutEnd,
        label: formatDateRange(plantOutStart, plantOutEnd),
        details: `Harden off for 7-10 days before planting out. Space ${variety.spacing.betweenPlantsCm}cm between plants, ${variety.spacing.betweenRowsCm}cm between rows.`,
      });
    }

    // Harvest
    if (maturityDate && harvestEnd && dateRangeOverlapsMonth(maturityDate, harvestEnd, monthStart, monthEnd)) {
      actions.push({
        type: 'harvest',
        startDate: maturityDate,
        endDate: harvestEnd,
        label: formatDateRange(maturityDate, harvestEnd),
        details: variety.yieldDescription,
      });
    }

    return {
      varietyId: variety.id,
      monthIndex: month.index,
      year: month.year,
      actions: actions.length > 0 ? actions : [{ type: 'nothing', startDate: monthStart, endDate: monthEnd, label: '' }],
    };
  });
}

function dateRangeOverlapsMonth(
  rangeStart: Date,
  rangeEnd: Date,
  monthStart: Date,
  monthEnd: Date
): boolean {
  return rangeStart <= monthEnd && rangeEnd >= monthStart;
}

function formatDateRange(start: Date, end: Date): string {
  const startDay = start.getDate();
  const endDay = end.getDate();
  const startMonth = MONTH_NAMES[start.getMonth()].slice(0, 3);
  const endMonth = MONTH_NAMES[end.getMonth()].slice(0, 3);

  if (startMonth === endMonth) {
    return `${startMonth} ${startDay} – ${endDay}`;
  }
  return `${startMonth} ${startDay} – ${endMonth} ${endDay}`;
}

/** A single entry in the growing timeline for a variety. */
export interface TimelineEntry {
  /** Display label, e.g. "Indoor sow", "Direct sow", "Plant out", "Harvest" */
  label: string;
  /** Formatted date range, e.g. "Apr 20 – May 4", or null if not applicable */
  dateRange: string | null;
  /** Icon emoji for the entry */
  emoji: string;
}

/**
 * Compute the growing timeline dates for a single vegetable variety.
 * All dates are relative to the London last-spring-frost date (May 11).
 * When seasonIndex is provided and the variety has multiple growing seasons,
 * uses that season's timing data.
 * Returns an ordered list of {label, dateRange, emoji} entries.
 */
export function getVarietyTimeline(variety: VegetableVariety, year?: number, seasonIndex?: number): TimelineEntry[] {
  const { lastSpringFrost } = getLondonFrostDates(year);
  const entries: TimelineEntry[] = [];

  // Resolve timing data from season if available
  const season = (seasonIndex !== undefined && variety.seasons?.[seasonIndex])
    ? variety.seasons[seasonIndex]
    : null;

  // When a season is explicitly selected, use ONLY its fields — undefined within
  // that season means "not applicable" (e.g. no indoor sow for direct-sown autumn
  // crops). Do NOT fall back to the variety-level (spring) values.
  // When no season is selected, fall back to variety-level fields.
  const indoorSowWeeks = season !== null ? season.indoorSowWeeksBeforeLastFrost : variety.indoorSowWeeksBeforeLastFrost;
  const directSowWeeks = season !== null ? season.directSowWeeksAfterLastFrost : variety.directSowWeeksAfterLastFrost;
  const plantOutWeeks = season !== null ? season.plantOutWeeksAfterLastFrost : variety.plantOutWeeksAfterLastFrost;
  const daysToMaturity = season !== null ? season.daysToMaturity : variety.daysToMaturity;
  const harvestPeriodWeeks = season !== null ? season.harvestPeriodWeeks : variety.harvestPeriodWeeks;

  // Indoor sow: lastFrost - indoorSowWeeksBeforeLastFrost weeks
  if (indoorSowWeeks !== undefined) {
    const start = addWeeks(lastSpringFrost, -indoorSowWeeks);
    const end = addWeeks(start, 2);
    entries.push({
      label: 'Indoor sow',
      dateRange: formatDateRange(start, end),
      emoji: '🪴',
    });
  }

  // Direct sow: lastFrost + directSowWeeksAfterLastFrost weeks
  if (directSowWeeks !== undefined) {
    const start = addWeeks(lastSpringFrost, directSowWeeks);
    const end = addWeeks(start, 3);
    entries.push({
      label: 'Direct sow',
      dateRange: formatDateRange(start, end),
      emoji: '🌱',
    });
  }

  // Plant out: lastFrost + plantOutWeeksAfterLastFrost weeks
  if (plantOutWeeks !== undefined) {
    const start = addWeeks(lastSpringFrost, Math.max(0, plantOutWeeks));
    const end = addWeeks(start, 2);
    entries.push({
      label: 'Plant out',
      dateRange: formatDateRange(start, end),
      emoji: '🌿',
    });
  }

  // Harvest: plant out + daysToMaturity → plant out + daysToMaturity + harvestPeriodWeeks
  // (or from direct sow if no plant-out date)
  const plantOutDate = plantOutWeeks !== undefined
    ? addWeeks(lastSpringFrost, Math.max(0, plantOutWeeks))
    : directSowWeeks !== undefined
      ? addWeeks(lastSpringFrost, directSowWeeks)
      : null;

  if (plantOutDate) {
    const harvestStart = addDays(plantOutDate, daysToMaturity);
    const hw = harvestPeriodWeeks ?? 4;
    const harvestEnd = addWeeks(harvestStart, hw);
    entries.push({
      label: 'Harvest',
      dateRange: formatDateRange(harvestStart, harvestEnd),
      emoji: '🧺',
    });
  }

  return entries;
}

/** Format the sun requirement for display. */
export function formatSunRequirement(sun: string): string {
  switch (sun) {
    case 'full-sun': return 'Full sun ☀️';
    case 'partial-shade': return 'Partial shade 🌤️';
    case 'shade-tolerant': return 'Shade tolerant 🌥️';
    default: return sun;
  }
}
