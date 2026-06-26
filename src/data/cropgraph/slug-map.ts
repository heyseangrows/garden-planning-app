/**
 * Maps vegetable group/variety IDs to @cropgraph/core crop slugs.
 *
 * Most group IDs (e.g., "tomato", "carrot", "broccoli") map directly to
 * @cropgraph/core slugs. This file only contains the exceptions where the
 * app's ID differs from the cropgraph slug.
 */

/** App group/variety ID → @cropgraph/core slug overrides */
export const SLUG_OVERRIDES: Record<string, string> = {
  // App ID differs from cropgraph slug
  beetroot: 'beet',
  chard: 'swiss-chard',
  chilli: 'pepper-hot',
  sweetcorn: 'sweet-corn',
  courgette: 'zucchini',
  rocket: 'arugula',
  lettuce: 'lettuce-leaf',
  chineseCabbage: 'napa-cabbage',
  pakChoi: 'pak-choi',
  choySum: 'choy-sum',
  mooli: 'radish-korean',
  mustardGreens: 'mustard-greens',
  kaiLan: 'kai-lan',
  sweetPotato: 'sweet-potato',
  brusselsSprouts: 'brussels-sprouts',
  fennel: 'fennel-bulb',
  squash: 'winter-squash',
  pepper: 'pepper-sweet',
  swede: 'rutabaga',
  // New crops
  aubergine: 'eggplant',
  'collard-greens': 'collards',
  'jerusalem-artichoke': 'jerusalem-artichoke',
  // Database expansion 2026
  'summer-squash': 'summer-squash',
  'specialty-greens': 'specialty-greens',
  'asian-greens-expanded': 'asian-greens-expanded',
  'unusual-roots': 'unusual-roots',
  'perennial-vegetables': 'perennial-vegetables',
  'specialty-legumes': 'specialty-legumes',
  // New herb variety IDs
  'herb-summer-savory': 'savory-summer',
  'herb-winter-savory': 'savory-winter',
  'herb-garlic-chive': 'garlic-chive',
  'herb-shiso': 'shiso-green',
  'herb-fenugreek': 'fenugreek',
  'herb-lemon-basil': 'lemon-basil',
  'herb-cumin': 'cumin',
  'herb-caraway': 'caraway',
  'herb-anise': 'anise',
  'herb-anise-hyssop': 'anise-hyssop',
  'herb-lovage': 'lovage',
  'herb-tarragon': 'tarragon',
  'herb-lemon-balm': 'lemon-balm',
  'herb-marjoram': 'marjoram',
};

/**
 * Resolve an app group/variety ID to the best @cropgraph/core slug.
 * First checks explicit overrides, then falls back to the ID itself
 * (most IDs match the cropgraph slug directly).
 */
export function resolveCropSlug(appId: string): string {
  return SLUG_OVERRIDES[appId] || appId;
}

/**
 * For varieties that map to specific cropgraph entries (beyond the group-level slug).
 * Used for compound groups like legumes (bush beans, runner beans, peas)
 * and alliums (onions, garlic, leeks, shallots).
 *
 * If a variety's vegetableGroupId is in this list, we use a more specific slug
 * rather than the parent group's slug.
 */
export const VARIETY_SPECIFIC_SLUGS: Record<string, string> = {
  // Legumes — different bean/pea types
  'french-bean': 'bush-bean',
  'runner-bean': 'runner-bean',
  'broad-bean': 'fava-bean',
  pea: 'shelling-pea',
  'mangetout-pea': 'snow-pea',
  'snap-pea': 'snap-pea',

  // Alliums — specific types
  onion: 'onion',
  garlic: 'garlic',
  leek: 'leek',
  shallot: 'shallot',

  // Herbs — specific herbs
  basil: 'basil',
  coriander: 'coriander',
  parsley: 'parsley-flat',
  dill: 'dill',
  mint: 'mint-spear',
  thyme: 'thyme',
  rosemary: 'rosemary',
  sage: 'sage',
  oregano: 'oregano',
  chives: 'chive',
  lemongrass: 'lemongrass',
  chervil: 'chervil',

  // Peppers — sweet vs hot
  pepper: 'pepper-sweet',
  chilli: 'pepper-hot',

  // New types
  scallion: 'scallion',
  soybean: 'soybean',
  chickpea: 'chickpea',
  edamame: 'soybean',

  // Database expansion 2026 — specific squash varieties
  'squash-tromboncino': 'tromboncino-squash',
  'squash-delicata': 'delicata-squash',
  'squash-kabocha': 'kabocha-squash',
  'squash-patty-pan': 'patty-pan-squash',
  'squash-crookneck': 'yellow-crookneck',

  // New greens
  'greens-nz-spinach': 'new-zealand-spinach',
  'greens-purslane': 'purslane',
  'greens-orach': 'orach',
  'greens-amaranth': 'amaranth',

  // Asian greens
  'asian-greens-komatsuna': 'komatsuna',
  'asian-greens-shanghai-bok-choy': 'shanghai-bok-choy',
  'asian-greens-yu-choy': 'yu-choy',
  'asian-greens-broccoli-raab': 'broccoli-raab',

  // Unusual roots
  'unusual-root-salsify': 'salsify',
  'unusual-root-scorzonera': 'scorzonera',
  'unusual-root-hamburg-parsley': 'rooting-parsley',
  'unusual-root-burdock': 'burdock-gobo',

  // Perennial vegetables
  'perennial-cardoon': 'cardoon',
  'perennial-ground-cherry': 'ground-cherry',
  'perennial-kale-daubenton': 'perennial-kale-daubenton',

  // Specialty legumes
  'legume-yard-long-bean': 'long-bean',
  'legume-edamame': 'edamame',

  // Summer squash group
  'summer-squash-luffa': 'luffa',
};

/**
 * Get the best cropgraph slug for a variety.
 * Uses the variety's vegetableGroupId (e.g., "french-bean", "onion", "basil")
 * to determine the correct cropgraph entry, falling back to the parent group ID.
 */
export function resolveVarietySlug(varietyGroupId: string, parentGroupId: string): string {
  // First check if this variety type has a specific mapping
  if (VARIETY_SPECIFIC_SLUGS[varietyGroupId]) {
    return resolveCropSlug(VARIETY_SPECIFIC_SLUGS[varietyGroupId]);
  }
  // Then check if the varietyGroupId itself maps directly (with overrides)
  const direct = resolveCropSlug(varietyGroupId);
  if (direct !== varietyGroupId || varietyGroupId !== parentGroupId) {
    return direct;
  }
  // Fall back to the parent group ID
  return resolveCropSlug(parentGroupId);
}

/**
 * Reverse map: given a cropgraph slug (from companion data), find all
 * app IDs that could resolve to it. This handles cases like:
 *   getBestCompanions('basil') returns companion slug 'pepper-sweet'
 *   → we need to find app varieties with vegetableGroupId 'pepper'
 */
export function getAppIdsForCropSlug(cropSlug: string): string[] {
  const ids: string[] = [];

  // Check SLUG_OVERRIDES for reverse matches
  for (const [appId, cgSlug] of Object.entries(SLUG_OVERRIDES)) {
    if (cgSlug === cropSlug) ids.push(appId);
  }

  // Check VARIETY_SPECIFIC_SLUGS for reverse matches
  for (const [appId, cgSlug] of Object.entries(VARIETY_SPECIFIC_SLUGS)) {
    if (resolveCropSlug(cgSlug) === cropSlug && !ids.includes(appId)) {
      ids.push(appId);
    }
  }

  // The cropgraph slug itself might be a valid app ID
  if (ids.length === 0) {
    ids.push(cropSlug);
  }

  return ids;
}
