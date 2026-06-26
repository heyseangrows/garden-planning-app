/**
 * Phase 1: Classify all @cropgraph/core vegetable entries against existing app data.
 * Outputs classification.json identifying new cultivars, new types, and excluded entries.
 */
import { listCrops } from '@cropgraph/core';
import { readFileSync, writeFileSync } from 'fs';

// ── Existing app coverage ──────────────────────────────────────────────────

// All group IDs imported in source.ts (the ones that map to file names)
const APP_GROUP_IDS = new Set([
  'tomato','pepper','legumes','alliums','herbs',
  'lettuce','spinach','chard','kale','rocket',
  'carrot','beetroot','radish','parsnip','turnip','swede',
  'broccoli','cabbage','cauliflower','brusselsSprouts','kohlrabi',
  'cucumber','courgette','squash','pumpkin',
  'pakChoi','chineseCabbage','choySum','mizuna','mooli','mustardGreens','kaiLan','tatsoi',
  'sweetcorn','asparagus','artichoke','celery','fennel','rhubarb','okra','sweetPotato',
  'potato','aubergine','celeriac','endive','watercress','jerusalemArtichoke',
  'collardGreens','sorrel','mache','horseradish','tomatillo',
  'summerSquash','specialtyGreens','asianGreensExpanded','unusualRoots',
  'perennialVegetables','specialtyLegumes',
]);

// Slug overrides from slug-map.ts (group-level)
const SLUG_OVERRIDES = {
  beetroot: 'beet', chard: 'swiss-chard', chilli: 'pepper-hot',
  sweetcorn: 'sweet-corn', courgette: 'zucchini', rocket: 'arugula',
  lettuce: 'lettuce-leaf', chineseCabbage: 'napa-cabbage', pakChoi: 'bok-choy',
  choySum: 'choy-sum', mooli: 'radish-korean', mustardGreens: 'mustard-greens',
  kaiLan: 'kai-lan', sweetPotato: 'sweet-potato', brusselsSprouts: 'brussels-sprouts',
  fennel: 'fennel-bulb', squash: 'winter-squash', pepper: 'pepper-sweet',
  swede: 'rutabaga', aubergine: 'eggplant', 'collardGreens': 'collards',
  'jerusalemArtichoke': 'jerusalem-artichoke', 'summerSquash': 'summer-squash',
  'specialtyGreens': 'specialty-greens', 'asianGreensExpanded': 'asian-greens-expanded',
  'unusualRoots': 'unusual-roots', 'perennialVegetables': 'perennial-vegetables',
  'specialtyLegumes': 'specialty-legumes',
};

// Variety-specific slugs from slug-map.ts (VARIETY_SPECIFIC_SLUGS)
const VARIETY_SPECIFIC_SLUGS = {
  'french-bean': 'bush-bean', 'runner-bean': 'runner-bean', 'broad-bean': 'fava-bean',
  pea: 'shelling-pea', 'mangetout-pea': 'snow-pea', 'snap-pea': 'snap-pea',
  onion: 'onion', garlic: 'garlic', leek: 'leek', shallot: 'shallot',
  basil: 'basil', coriander: 'coriander', parsley: 'parsley-flat', dill: 'dill',
  mint: 'mint-spear', thyme: 'thyme', rosemary: 'rosemary', sage: 'sage',
  oregano: 'oregano', chives: 'chive', lemongrass: 'lemongrass', chervil: 'chervil',
  pepper: 'pepper-sweet', chilli: 'pepper-hot',
  scallion: 'scallion', soybean: 'soybean', chickpea: 'chickpea', edamame: 'soybean',
  'squash-tromboncino': 'tromboncino-squash', 'squash-delicata': 'delicata-squash',
  'squash-kabocha': 'kabocha-squash', 'squash-patty-pan': 'patty-pan-squash',
  'squash-crookneck': 'yellow-crookneck',
  'greens-nz-spinach': 'new-zealand-spinach', 'greens-purslane': 'purslane',
  'greens-orach': 'orach', 'greens-amaranth': 'amaranth',
  'asian-greens-komatsuna': 'komatsuna', 'asian-greens-shanghai-bok-choy': 'shanghai-bok-choy',
  'asian-greens-yu-choy': 'yu-choy', 'asian-greens-broccoli-raab': 'broccoli-raab',
  'unusual-root-salsify': 'salsify', 'unusual-root-scorzonera': 'scorzonera',
  'unusual-root-hamburg-parsley': 'rooting-parsley', 'unusual-root-burdock': 'burdock-gobo',
  'perennial-cardoon': 'cardoon', 'perennial-ground-cherry': 'ground-cherry',
  'perennial-kale-daubenton': 'perennial-kale-daubenton',
  'legume-yard-long-bean': 'long-bean', 'legume-edamame': 'edamame',
  'summer-squash-luffa': 'luffa',
};

// Build the set of all cropgraph slugs already covered
function buildCoveredSlugs() {
  const covered = new Set();

  // Direct group ID matches
  for (const id of APP_GROUP_IDS) {
    covered.add(id);
  }

  // Slug overrides
  for (const [, cgSlug] of Object.entries(SLUG_OVERRIDES)) {
    covered.add(cgSlug);
  }

  // Variety-specific slugs
  for (const [, cgSlug] of Object.entries(VARIETY_SPECIFIC_SLUGS)) {
    covered.add(cgSlug);
  }

  // Base types that our app covers via group IDs (no overrides needed)
  const directBaseTypes = [
    'tomato','potato','okra','broccoli','cauliflower','cabbage','kale','kohlrabi',
    'cucumber','pumpkin','spinach','mizuna','endive','asparagus','rhubarb','celery',
    'carrot','parsnip','turnip','radish','artichoke','celeriac','watercress',
    'horseradish','sorrel','tomatillo','tatsoi','mache',
    // mapped via SLUG_OVERRIDES
    'beet','swiss-chard','pepper-sweet','zucchini','arugula','lettuce-leaf',
    'napa-cabbage','choy-sum','radish-korean','mustard-greens','kai-lan',
    'sweet-potato','brussels-sprouts','fennel-bulb','winter-squash',
    'rutabaga','eggplant','collards','jerusalem-artichoke','summer-squash',
    'sweet-corn','bok-choy','broccoli-raab','romanesco',
    // mapped via VARIETY_SPECIFIC_SLUGS
    'bush-bean','runner-bean','fava-bean','shelling-pea','snow-pea','snap-pea',
    'scallion','basil','coriander','parsley-flat','dill','mint-spear','thyme',
    'rosemary','sage','oregano','chive','lemongrass','chervil',
    'pepper-hot','onion','garlic','leek','shallot',
    'chickpea','soybean','edamame',
    'komatsuna','shanghai-bok-choy','yu-choy',
    'salsify','scorzonera','rooting-parsley','burdock-gobo',
    'new-zealand-spinach','purslane','orach','amaranth',
    'cardoon','ground-cherry','perennial-kale-daubenton','long-bean',
    'luffa','delicata-squash','kabocha-squash','patty-pan-squash',
    'yellow-crookneck','tromboncino-squash',
  ];
  for (const s of directBaseTypes) covered.add(s);

  return covered;
}

// ── Category detection for new types ──────────────────────────────────────
const WESTERN_VEG = new Set([
  'tomato','pepper','garlic','onion','leek','shallot','potato','carrot','beet',
  'broccoli','cabbage','cauliflower','brussels','kale','kohlrabi','spinach',
  'chard','lettuce','arugula','cucumber','zucchini','squash','pumpkin','celery',
  'asparagus','rhubarb','artichoke','sweetcorn','parsnip','turnip','radish',
  'swede','okra','eggplant','fennel','endive','radicchio','escarole','collards',
  'peas','beans','sweet-potato','watercress','sorrel','tomatillo','horseradish',
]);

const ASIAN_VEG = new Set([
  'bok-choy','pak-choi','napa-cabbage','choy-sum','kai-lan','mizuna','tatsoi',
  'mooli','mustard-greens','daikon','bitter-melon','water-spinach','edamame',
  'shiso','lemongrass','yukina','senposai','shungiku','mibuna','gobo',
  'yard-long-bean','winged-bean','luffa','chayote','winter-melon',
]);

function detectCategory(slug, commonName) {
  const lower = (slug + ' ' + commonName).toLowerCase();
  for (const w of ASIAN_VEG) {
    if (lower.includes(w)) return 'asian';
  }
  for (const w of WESTERN_VEG) {
    if (lower.includes(w)) return 'western';
  }
  // Default to western for unknown types
  return 'western';
}

// ── Parent group detection ─────────────────────────────────────────────────

function detectParentGroup(slug, commonName) {
  const lower = (slug + ' ' + commonName).toLowerCase();

  // Match by slug prefix or name content
  const patterns = [
    { group: 'tomatoes', keys: ['tomato'] },
    { group: 'peppers', keys: ['pepper', 'chilli', 'chili', 'jalapeno', 'habanero', 'poblano', 'serrano', 'cayenne', 'ghost', 'scotch-bonnet', 'aji', 'paprika', 'bell', 'pimiento', 'shishito'] },
    { group: 'legumes', keys: ['bean', 'pea', 'chickpea', 'soybean', 'lentil', 'edamame'] },
    { group: 'alliums', keys: ['onion', 'garlic', 'leek', 'shallot', 'scallion', 'chive'] },
    { group: 'lettuce', keys: ['lettuce', 'celtuce'] },
    { group: 'spinach', keys: ['spinach'] },
    { group: 'chard', keys: ['chard'] },
    { group: 'kale', keys: ['kale', 'collard'] },
    { group: 'rocket', keys: ['arugula', 'rocket'] },
    { group: 'carrot', keys: ['carrot'] },
    { group: 'beetroot', keys: ['beet'] },
    { group: 'radish', keys: ['radish', 'daikon', 'mooli'] },
    { group: 'parsnip', keys: ['parsnip'] },
    { group: 'turnip', keys: ['turnip'] },
    { group: 'swede', keys: ['swede', 'rutabaga'] },
    { group: 'broccoli', keys: ['broccoli', 'broccolini'] },
    { group: 'cabbage', keys: ['cabbage'] },
    { group: 'cauliflower', keys: ['cauliflower'] },
    { group: 'brusselsSprouts', keys: ['brussels sprout', 'brussel'] },
    { group: 'kohlrabi', keys: ['kohlrabi'] },
    { group: 'cucumber', keys: ['cucumber', 'gherkin', 'cuke'] },
    { group: 'courgette', keys: ['courgette', 'zucchini'] },
    { group: 'squash', keys: ['squash'] },
    { group: 'pumpkin', keys: ['pumpkin'] },
    { group: 'pakChoi', keys: ['pak choi', 'bok choy', 'pakchoi'] },
    { group: 'chineseCabbage', keys: ['napa', 'chinese cabbage'] },
    { group: 'choySum', keys: ['choy sum', 'choi sum'] },
    { group: 'mizuna', keys: ['mizuna'] },
    { group: 'mooli', keys: ['mooli', 'korean radish'] },
    { group: 'mustardGreens', keys: ['mustard green', 'mustard'] },
    { group: 'kaiLan', keys: ['kai lan', 'gai lan', 'chinese broccoli'] },
    { group: 'tatsoi', keys: ['tatsoi'] },
    { group: 'sweetcorn', keys: ['corn', 'sweet corn', 'maize'] },
    { group: 'asparagus', keys: ['asparagus'] },
    { group: 'artichoke', keys: ['artichoke'] },
    { group: 'celery', keys: ['celery'] },
    { group: 'fennel', keys: ['fennel'] },
    { group: 'rhubarb', keys: ['rhubarb'] },
    { group: 'okra', keys: ['okra'] },
    { group: 'sweetPotato', keys: ['sweet potato'] },
    { group: 'potato', keys: ['potato'] },
    { group: 'aubergine', keys: ['eggplant', 'aubergine'] },
    { group: 'celeriac', keys: ['celeriac', 'celery root'] },
    { group: 'endive', keys: ['endive', 'radicchio', 'escarole', 'chicory'] },
    { group: 'watercress', keys: ['watercress'] },
    { group: 'jerusalemArtichoke', keys: ['jerusalem artichoke', 'sunchoke'] },
    { group: 'collardGreens', keys: ['collard'] },
    { group: 'sorrel', keys: ['sorrel'] },
    { group: 'mache', keys: ['mache', 'corn salad', 'lamb'] },
    { group: 'horseradish', keys: ['horseradish'] },
    { group: 'tomatillo', keys: ['tomatillo'] },
    { group: 'summerSquash', keys: ['summer squash', 'patty pan', 'crookneck', 'straightneck'] },
    { group: 'specialtyGreens', keys: ['amaranth', 'purslane', 'orach', 'new zealand spinach'] },
    { group: 'asianGreensExpanded', keys: ['komatsuna', 'shanghai bok', 'yu choy', 'broccoli raab', 'mibuna', 'senposai', 'shungiku', 'yukina'] },
    { group: 'unusualRoots', keys: ['salsify', 'scorzonera', 'hamburg', 'burdock'] },
    { group: 'perennialVegetables', keys: ['cardoon', 'ground cherry', 'perennial kale'] },
    { group: 'specialtyLegumes', keys: ['yard-long', 'winged bean', 'lablab'] },
    { group: 'herbs', keys: ['basil', 'parsley', 'thyme', 'rosemary', 'mint', 'dill', 'oregano', 'sage', 'cilantro', 'coriander', 'chervil', 'lemongrass', 'shiso', 'fenugreek', 'cumin', 'caraway', 'anise', 'marjoram', 'savory', 'tarragon', 'lemon balm', 'lovage'] },
  ];

  for (const { group, keys } of patterns) {
    for (const key of keys) {
      if (lower.includes(key)) return group;
    }
  }

  return null; // genuinely new type
}

// ── Exclusion patterns ─────────────────────────────────────────────────────
function shouldExclude(slug, commonName) {
  const lower = (slug + ' ' + commonName).toLowerCase();
  const exclude = [
    'bamboo','agave','kelp','seaweed','algae','cattail','bulrush','duckweed',
    'bluegrass','bromegrass','fescue','ryegrass','grama','bluestem','buffalograss',
    'wheat','barley','oats','rye','triticale','sorghum','millet','teff','fonio',
    'elm','yucca','lily','lotus','pickerel','wapato','bog','marsh',
    'willow','oak','maple','birch','pine','fir','spruce','cedar','cypress',
    'dulse','ogonori','nori','salicornia','sea-beet','sea-kale','sea-bulrush',
    'camas','sesbania','katuk','moringa','chipilin','huazontle',
    'dandelion','lambsquarter','good-king-henry','job-tears',
    'flax','hemp','cotton','indigo','woad','madder',
    'agave','prickly-pear','nopal','buffalo-gourd',
  ];
  for (const e of exclude) {
    if (lower.includes(e)) return true;
  }
  return false;
}

// ── Main classification ────────────────────────────────────────────────────

const coveredSlugs = buildCoveredSlugs();
const allCrops = listCrops({ category: 'vegetable' });

const newCultivars = [];
const newTypes = [];
const existing = [];
const excluded = [];

for (const crop of allCrops) {
  if (shouldExclude(crop.slug, crop.commonName)) {
    excluded.push(crop.slug);
    continue;
  }

  if (coveredSlugs.has(crop.slug)) {
    existing.push(crop.slug);
    continue;
  }

  // Only check exact match or well-known base-type matches.
  // Do NOT partial-match by prefix/suffix — it incorrectly claims
  // cultivars like 'brandywine-tomato' are covered by slug 'tomato'.
  const parentGroup = detectParentGroup(crop.slug, crop.commonName);
  const category = detectCategory(crop.slug, crop.commonName);

  const entry = {
    slug: crop.slug,
    commonName: crop.commonName,
    category,
    season: crop.season || '',
    daysMin: crop.daysToHarvest?.min || 0,
    daysMax: crop.daysToHarvest?.max || 0,
    zoneMin: crop.zoneRange?.min || 0,
    zoneMax: crop.zoneRange?.max || 0,
    windowCount: crop.windows?.length || 0,
    source: crop.source || '',
    notes: crop.notes || '',
    parentGroup,
  };

  if (parentGroup) {
    newCultivars.push(entry);
  } else {
    newTypes.push(entry);
  }
}

// ── Output ──────────────────────────────────────────────────────────────────

const manifest = {
  summary: {
    totalCropgraphEntries: allCrops.length,
    alreadyCovered: existing.length,
    newCultivarsOfExistingGroups: newCultivars.length,
    newVegetableTypes: newTypes.length,
    excluded: excluded.length,
  },
  newCultivarsByGroup: {},
  newTypes,
  excludedSample: excluded.slice(0, 50),
};

// Group cultivars by parent group
for (const c of newCultivars) {
  const g = c.parentGroup;
  if (!manifest.newCultivarsByGroup[g]) manifest.newCultivarsByGroup[g] = [];
  manifest.newCultivarsByGroup[g].push(c);
}

writeFileSync('scripts/classification.json', JSON.stringify(manifest, null, 2));
console.log('=== CLASSIFICATION COMPLETE ===');
console.log(`Total cropgraph entries: ${allCrops.length}`);
console.log(`Already covered: ${existing.length}`);
console.log(`New cultivars (existing groups): ${newCultivars.length}`);
console.log(`New vegetable types: ${newTypes.length}`);
console.log(`Excluded: ${excluded.length}`);
console.log('');
console.log('New cultivars by group:');
for (const [group, cultivars] of Object.entries(manifest.newCultivarsByGroup).sort((a,b) => b[1].length - a[1].length)) {
  console.log(`  ${group}: ${cultivars.length} cultivars`);
}
console.log('');
console.log('New vegetable types:');
for (const t of newTypes) {
  console.log(`  ${t.slug} | ${t.commonName} | ${t.category}`);
}
console.log('');
console.log('Output written to scripts/classification.json');
