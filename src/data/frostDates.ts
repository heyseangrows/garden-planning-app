/**
 * Frost date data for the garden planner.
 *
 * London-specific dates are maintained as the default because USDA hardiness
 * zones don't perfectly map to UK maritime climate conditions. London (zone 8b
 * equivalent) has a later last spring frost and earlier first fall frost than
 * USDA zone 8b would suggest, due to the UK's cooler maritime influence.
 *
 * When location-aware features are added, @cropgraph/core's getFrostDates()
 * and getHardinessZone() can be used for other regions.
 */

// London, UK frost dates — empirically verified averages
// Last spring frost: ~May 11
// First fall frost: ~October 15

export interface FrostDates {
  lastSpringFrost: Date;
  firstFallFrost: Date;
  frostFreeDays: number;
}

export function getLondonFrostDates(year?: number): FrostDates {
  const y = year ?? new Date().getFullYear();
  // London: last frost around May 11, first frost around Oct 15
  const lastSpringFrost = new Date(y, 4, 11); // May 11
  const firstFallFrost = new Date(y, 9, 15);  // October 15

  const diffMs = firstFallFrost.getTime() - lastSpringFrost.getTime();
  const frostFreeDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  return { lastSpringFrost, firstFallFrost, frostFreeDays };
}

import { getFrostDates as getCgFrostDates } from '@cropgraph/core';

/**
 * Get frost dates for any USDA hardiness zone using @cropgraph/core.
 * Returns null if the zone is invalid or data is unavailable.
 * For London-specific dates, use getLondonFrostDates() instead.
 */
export function getFrostDatesForZone(zone: string, year?: number): FrostDates | null {
  const result = getCgFrostDates(zone);
  if (!result.ok || !result.data) return null;

  const y = year ?? new Date().getFullYear();
  const [sMonth, sDay] = result.data.lastSpring.split('-').map(Number);
  const [fMonth, fDay] = result.data.firstFall.split('-').map(Number);

  const lastSpringFrost = new Date(y, sMonth - 1, sDay);
  const firstFallFrost = new Date(y, fMonth - 1, fDay);
  const diffMs = firstFallFrost.getTime() - lastSpringFrost.getTime();

  return {
    lastSpringFrost,
    firstFallFrost,
    frostFreeDays: Math.floor(diffMs / (1000 * 60 * 60 * 24)),
  };
}

// Monthly average soil temperature for London (approximate, at 10cm depth)
export const SOIL_TEMPS_C: Record<number, number> = {
  0: 4,   // January
  1: 4,   // February
  2: 6,   // March
  3: 9,   // April
  4: 13,  // May
  5: 16,  // June
  6: 18,  // July
  7: 18,  // August
  8: 15,  // September
  9: 11,  // October
  10: 7,  // November
  11: 5,  // December
};

export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export const MONTH_NAMES_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

/** Base year for month index 0. Month 0 = January of this year, 5 = June, 12 = January next year, -1 = December last year. */
export const BASE_YEAR = new Date().getFullYear();

/** Convert an absolute month index to a human-readable label like "June 2026". */
export function formatMonthLabel(absoluteIndex: number): string {
  const year = BASE_YEAR + Math.floor(absoluteIndex / 12);
  const m = ((absoluteIndex % 12) + 12) % 12;
  return `${MONTH_NAMES[m]} ${year}`;
}

/** Return just the year for an absolute month index. */
export function monthYear(absoluteIndex: number): number {
  return BASE_YEAR + Math.floor(absoluteIndex / 12);
}
