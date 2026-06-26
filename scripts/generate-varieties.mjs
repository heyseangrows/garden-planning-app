/**
 * Phase 2: Generate VegetableVariety data for all new cultivars.
 * Reads classification.json, queries @cropgraph/core for timing data,
 * and outputs a JSON manifest of variety entries ready to insert into TypeScript files.
 */
import { listCrops } from '@cropgraph/core';
import { readFileSync, writeFileSync } from 'fs';

const manifest = JSON.parse(readFileSync('scripts/classification.json', 'utf-8'));
const allCrops = listCrops({ category: 'vegetable' });
const cropIndex = new Map(allCrops.map(c => [c.slug, c]));

// ── Rating heuristics ─────────────────────────────────────────────────────

function rateClimateSuitability(crop, category) {
  // UK-focused: cool-season crops do well, warm-season need protection
  const season = crop?.season || 'warm';
  const zoneMin = crop?.zoneRange?.min || 5;
  if (season === 'cool') return 4 + Math.random() * 1; // 4-5
  if (season === 'warm' && zoneMin <= 4) return 3 + Math.random() * 2; // 3-5
  if (season === 'warm' && zoneMin >= 6) return 2 + Math.random() * 2; // 2-4
  if (season === 'perennial') return 4 + Math.random() * 1;
  return 3;
}

function rateYield(crop, category) {
  const daysMin = crop?.daysToHarvest?.min || 60;
  if (daysMin <= 50) return 3 + Math.random() * 2; // quick crops 3-5
  if (daysMin <= 80) return 3 + Math.random() * 2;
  return 2 + Math.random() * 3;
}

function rateTastiness(crop) {
  // Default to moderate - research will upgrade
  return 3 + Math.random() * 2;
}

function rateDifficulty(crop) {
  const season = crop?.season || 'warm';
  const daysMax = crop?.daysToHarvest?.max || 80;
  if (season === 'cool') return 1 + Math.random() * 2; // 1-3
  if (season === 'warm' && daysMax > 100) return 3 + Math.random() * 2; // 3-5
  return 2 + Math.random() * 2; // 2-4
}

function rateValue(crop) {
  const difficulty = rateDifficulty(crop);
  const yield_ = rateYield(crop);
  // Good value = easy + high yield
  return Math.round((6 - difficulty + yield_) / 2);
}

// ── Display color palette ──────────────────────────────────────────────────

const COLOR_PALETTES = {
  tomatoes: ['#E53935','#D32F2F','#C62828','#B71C1C','#FF1744','#FF5252','#FF8A80','#EF5350','#F44336','#E57373','#EF9A9A','#FFCDD2','#E65100','#BF360C','#FF6D00'],
  peppers: ['#C62828','#DC143C','#4CAF50','#FFD600','#7B1FA2','#BF360C','#FF6D00','#E53935','#B71C1C','#FF8F00','#F9A825','#558B2F','#33691E','#1B5E20','#4A148C'],
  alliums: ['#FFF8E1','#FFECB3','#FFE082','#FFD54F','#FFCA28','#FFC107','#FFB300','#FFA000','#FF8F00','#E65100','#F9A825','#F57F17','#EF6C00','#E0E0E0','#BDBDBD'],
  squash: ['#FF8F00','#F9A825','#F57F17','#EF6C00','#E65100','#FFB300','#FFA000','#FB8C00','#FF6F00','#FFD54F','#FFCA28','#FFC107','#4E342E','#795548','#8D6E63'],
  lettuce: ['#4CAF50','#8BC34A','#AED581','#C5E1A5','#558B2F','#33691E','#689F38','#7CB342','#9CCC65','#2E7D32','#388E3C','#43A047','#66BB6A','#81C784','#A5D6A7'],
  cucumber: ['#2E7D32','#388E3C','#43A047','#4CAF50','#66BB6A','#81C784','#A5D6A7','#1B5E20','#558B2F','#33691E'],
  herbs: ['#4CAF50','#66BB6A','#81C784','#388E3C','#43A047','#2E7D32','#1B5E20','#558B2F','#689F38','#7CB342'],
  brassicas: ['#2E7D32','#388E3C','#43A047','#4CAF50','#66BB6A','#33691E','#1B5E20','#558B2F','#689F38','#7CB342'],
  roots: ['#E65100','#EF6C00','#F57F17','#FB8C00','#FF8F00','#BF360C','#DD2C00','#FF6D00','#FFAB00','#FFD600'],
  default: ['#607D8B','#546E7A','#455A64','#37474F','#78909C','#90A4AE','#B0BEC5','#CFD8DC','#ECEFF1','#9E9E9E'],
};

function getColorPalette(groupId) {
  for (const [key, palette] of Object.entries(COLOR_PALETTES)) {
    if (groupId.toLowerCase().includes(key.toLowerCase())) return palette;
  }
  return COLOR_PALETTES.default;
}

function getDisplayColor(groupId, index) {
  const palette = getColorPalette(groupId);
  return palette[index % palette.length];
}

// ── Growing habit defaults ──────────────────────────────────────────────────
const HABIT_DEFAULTS = {
  tomatoes: 'climbing', peppers: 'bush', alliums: 'upright', squash: 'sprawling',
  cucumber: 'climbing', legumes: 'climbing', lettuce: 'rosette', spinach: 'rosette',
  kale: 'upright', chard: 'upright', broccoli: 'upright', cabbage: 'rosette',
  cauliflower: 'rosette', brusselsSprouts: 'upright', kohlrabi: 'upright',
  carrot: 'upright', beetroot: 'upright', radish: 'upright', parsnip: 'upright',
  turnip: 'upright', swede: 'upright', sweetcorn: 'upright', asparagus: 'upright',
  artichoke: 'upright', celery: 'upright', fennel: 'upright', rhubarb: 'upright',
  okra: 'bush', sweetPotato: 'sprawling', potato: 'bush', aubergine: 'bush',
  celeriac: 'upright', endive: 'rosette', watercress: 'sprawling',
  courgette: 'bush', pumpkin: 'sprawling', rocket: 'rosette',
  pakChoi: 'rosette', chineseCabbage: 'rosette', choySum: 'upright',
  mizuna: 'rosette', mooli: 'upright', mustardGreens: 'rosette',
  kaiLan: 'upright', tatsoi: 'rosette', collardGreens: 'upright',
  sorrel: 'rosette', mache: 'rosette', horseradish: 'upright', tomatillo: 'bush',
  summerSquash: 'bush', specialtyGreens: 'bush',
};

const HEIGHT_SPREAD_DEFAULTS = {
  tomatoes: { h: 150, s: 50 }, peppers: { h: 60, s: 50 }, alliums: { h: 40, s: 15 },
  squash: { h: 60, s: 150 }, cucumber: { h: 200, s: 60 }, legumes: { h: 150, s: 40 },
  lettuce: { h: 25, s: 25 }, spinach: { h: 20, s: 20 }, kale: { h: 60, s: 45 },
  chard: { h: 45, s: 35 }, broccoli: { h: 60, s: 60 }, cabbage: { h: 40, s: 50 },
  cauliflower: { h: 50, s: 60 }, brusselsSprouts: { h: 80, s: 60 }, kohlrabi: { h: 40, s: 30 },
  carrot: { h: 30, s: 15 }, beetroot: { h: 30, s: 15 }, radish: { h: 15, s: 10 },
  parsnip: { h: 40, s: 20 }, turnip: { h: 30, s: 20 }, swede: { h: 40, s: 30 },
  sweetcorn: { h: 180, s: 40 }, asparagus: { h: 150, s: 45 }, artichoke: { h: 150, s: 100 },
  celery: { h: 40, s: 30 }, fennel: { h: 60, s: 40 }, rhubarb: { h: 60, s: 90 },
  okra: { h: 120, s: 60 }, sweetPotato: { h: 30, s: 150 }, potato: { h: 60, s: 45 },
  aubergine: { h: 70, s: 60 }, celeriac: { h: 40, s: 35 }, endive: { h: 30, s: 35 },
  watercress: { h: 15, s: 30 }, courgette: { h: 50, s: 90 }, pumpkin: { h: 50, s: 300 },
  rocket: { h: 20, s: 20 }, pakChoi: { h: 30, s: 30 },
};
function getHabit(groupId) {
  for (const [key, val] of Object.entries(HABIT_DEFAULTS)) {
    if (groupId.toLowerCase().includes(key.toLowerCase())) return val;
  }
  return 'bush';
}
function getHeight(groupId) {
  for (const [key, val] of Object.entries(HEIGHT_SPREAD_DEFAULTS)) {
    if (groupId.toLowerCase().includes(key.toLowerCase())) return val.h;
  }
  return 40;
}
function getSpread(groupId) {
  for (const [key, val] of Object.entries(HEIGHT_SPREAD_DEFAULTS)) {
    if (groupId.toLowerCase().includes(key.toLowerCase())) return val.s;
  }
  return 30;
}

// ── Existing variety names to avoid duplicates ────────────────────────────
// Read the existing files to check for already-present varieties by name
function slugToVarietyName(slug) {
  return slug.split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
    .replace(/Tomato$/, '').trim();
}

// ── Generate a single variety entry ────────────────────────────────────────

function generateVariety(cropEntry, groupId, indexInGroup) {
  const slug = cropEntry.slug;
  const commonName = cropEntry.commonName;
  const category = cropEntry._category || 'western';

  // Derive a clean variety name from the cropgraph commonName
  let varietyName = commonName;
  // Remove redundant suffixes
  varietyName = varietyName.replace(/\s+(Tomato|Pepper|Squash|Lettuce|Onion|Garlic|Cucumber|Eggplant|Pumpkin|Bean|Pea|Kale|Spinach|Chard|Beet|Radish|Carrot|Parsnip|Turnip|Broccoli|Cabbage|Cauliflower|Okra|Rhubarb|Asparagus|Artichoke|Corn|Potato|Celery|Fennel|Watercress|Collards|Kohlrabi|Gourd|Melon|Mustard|Greens|Choy|Choi)$/i, '').trim();

  const id = `${groupId}-${slug.replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')}`;
  const vegetableName = getVegetableBaseName(groupId);
  const habit = getHabit(groupId);
  const isPeren = (cropEntry.season === 'perennial');
  const height = getHeight(groupId);
  const spread = getSpread(groupId);
  const climate = Math.min(5, Math.max(1, Math.round(rateClimateSuitability(cropEntry, category))));
  const yld = Math.min(5, Math.max(1, Math.round(rateYield(cropEntry, category))));
  const taste = Math.min(5, Math.max(1, Math.round(rateTastiness(cropEntry))));
  const diff = Math.min(5, Math.max(1, Math.round(rateDifficulty(cropEntry))));
  const value = Math.min(5, Math.max(1, Math.round(rateValue(cropEntry))));
  const color = getDisplayColor(groupId, indexInGroup);
  const daysToMaturity = cropEntry.daysToHarvest?.min || 60;
  const harvestWeeks = Math.max(4, Math.round((cropEntry.daysToHarvest?.max - cropEntry.daysToHarvest?.min) / 7) || 6);

  // Extract timing from cropgraph windows
  let indoorSowWeeks, directSowWeeks, plantOutWeeks;
  const windows = cropEntry.windows || [];
  for (const w of windows) {
    if (w.action === 'start_indoors') {
      indoorSowWeeks = Math.round(Math.abs(Math.min(0, w.fromFrostDays)) / 7);
    }
    if (w.action === 'direct_sow') {
      directSowWeeks = Math.round(w.fromFrostDays / 7);
    }
    if (w.action === 'transplant') {
      plantOutWeeks = Math.round(Math.max(0, w.fromFrostDays) / 7);
    }
  }

  // Build a useful description from cropgraph data
  const sourceNote = cropEntry.source ? ` [Source: ${cropEntry.source}]` : '';
  const cropNote = cropEntry.notes ? ` ${cropEntry.notes}` : '';
  const seasonLabel = cropEntry.season === 'cool' ? 'cool-season' : cropEntry.season === 'warm' ? 'warm-season' : 'perennial';
  const description = `${commonName} is a ${seasonLabel} ${vegetableName.toLowerCase()} variety. Matures in ${daysToMaturity} days.${cropNote}${sourceNote} EXPAND-ME: Add UK-specific growing context and flavour notes.`;

  const growingInstructions = `Sow${indoorSowWeeks ? ` indoors ${indoorSowWeeks} weeks before last frost` : ''}${directSowWeeks !== undefined ? `${indoorSowWeeks ? ' or' : ''} direct sow ${directSowWeeks} weeks after last frost` : ''}.${plantOutWeeks !== undefined ? ` Transplant ${plantOutWeeks} weeks after last frost.` : ''} EXPAND-ME: Add detailed UK-specific growing advice.`;

  return {
    id,
    vegetableGroupId: groupId,
    vegetableName,
    name: varietyName,
    category,
    growingHabit: habit,
    isPerennial: isPeren,
    height,
    spread,
    climateSuitability: climate,
    yield: yld,
    tastiness: taste,
    difficulty: diff,
    valueForMoney: value,
    sunRequirement: 'full-sun',
    spacing: { betweenPlantsCm: spread + 10, betweenRowsCm: spread + 25 },
    daysToMaturity,
    indoorSowWeeksBeforeLastFrost: indoorSowWeeks,
    directSowWeeksAfterLastFrost: directSowWeeks,
    plantOutWeeksAfterLastFrost: plantOutWeeks,
    harvestPeriodWeeks: harvestWeeks,
    yieldDescription: `Moderate to good yields of ${varietyName.toLowerCase()}. EXPAND-ME: Add yield details.`,
    maxPlantsPerPerson: 2,
    description,
    growingInstructions,
    commonProblems: ['Aphids', 'Slugs'],
    goodCompanions: [],
    badCompanions: [],
    benefitsFromGrowLights: cropEntry.season === 'warm',
    benefitsFromFleece: cropEntry.season === 'warm' || cropEntry.season === 'cool',
    growLightsExtendWeeks: 0,
    fleeceExtendWeeks: 0,
    sowDepth: '1 cm',
    germinationTemp: cropEntry.season === 'warm' ? '18-24°C' : '10-18°C',
    waterNeeds: 'medium',
    displayColor: color,
    _cropgraphSlug: slug,
  };
}

function getVegetableBaseName(groupId) {
  const names = {
    tomatoes: 'Tomato', peppers: 'Pepper', alliums: 'Allium', squash: 'Squash',
    cucumber: 'Cucumber', legumes: 'Bean', lettuce: 'Lettuce', spinach: 'Spinach',
    kale: 'Kale', chard: 'Chard', broccoli: 'Broccoli', cabbage: 'Cabbage',
    cauliflower: 'Cauliflower', brusselsSprouts: 'Brussels Sprout', kohlrabi: 'Kohlrabi',
    carrot: 'Carrot', beetroot: 'Beetroot', radish: 'Radish', parsnip: 'Parsnip',
    turnip: 'Turnip', swede: 'Swede', sweetcorn: 'Sweetcorn', asparagus: 'Asparagus',
    artichoke: 'Artichoke', celery: 'Celery', fennel: 'Fennel', rhubarb: 'Rhubarb',
    okra: 'Okra', sweetPotato: 'Sweet Potato', potato: 'Potato', aubergine: 'Aubergine',
    celeriac: 'Celeriac', endive: 'Endive', watercress: 'Watercress',
    courgette: 'Courgette', pumpkin: 'Pumpkin', rocket: 'Rocket',
    pakChoi: 'Pak Choi', chineseCabbage: 'Chinese Cabbage', choySum: 'Choy Sum',
    mizuna: 'Mizuna', mooli: 'Mooli', mustardGreens: 'Mustard Green',
    kaiLan: 'Kai Lan', tatsoi: 'Tatsoi', collardGreens: 'Collard',
    sorrel: 'Sorrel', mache: 'Mache', horseradish: 'Horseradish', tomatillo: 'Tomatillo',
    summerSquash: 'Summer Squash', specialtyGreens: 'Leafy Green',
    asianGreensExpanded: 'Asian Green', unusualRoots: 'Root Vegetable',
    perennialVegetables: 'Perennial Vegetable', specialtyLegumes: 'Legume',
    herbs: 'Herb',
  };
  return names[groupId] || 'Vegetable';
}

// ── Main generation ────────────────────────────────────────────────────────

const generatedByGroup = {};
const generatedNewTypes = [];
const slugMappings = []; // entries for slug-map.ts

for (const [groupId, cultivars] of Object.entries(manifest.newCultivarsByGroup)) {
  const entries = [];
  for (let i = 0; i < cultivars.length; i++) {
    const c = cultivars[i];
    const cropEntry = cropIndex.get(c.slug);
    if (!cropEntry) {
      console.warn(`  WARNING: cropgraph entry not found for slug "${c.slug}"`);
      continue;
    }
    // Tag with category from classification
    cropEntry._category = c.category;
    const variety = generateVariety(cropEntry, groupId, i);
    entries.push(variety);
    // Record slug mapping
    slugMappings.push(`  '${variety.id}': '${c.slug}',  // ${variety.name} (${variety.vegetableName})`);
  }
  if (entries.length > 0) {
    generatedByGroup[groupId] = entries;
  }
}

for (const t of manifest.newTypes) {
  const cropEntry = cropIndex.get(t.slug);
  if (!cropEntry) continue;
  cropEntry._category = t.category;

  // Determine a group ID for this new type
  const groupId = t.slug.replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  const variety = generateVariety(cropEntry, groupId, 0);
  variety.vegetableGroupId = groupId;
  variety.vegetableName = t.commonName;
  generatedNewTypes.push({
    groupId,
    groupName: t.commonName,
    emoji: '🌱',
    description: `${t.commonName} — a unique vegetable variety. EXPAND-ME: Add group description.`,
    category: t.category,
    varieties: [variety],
  });
  slugMappings.push(`  '${variety.id}': '${t.slug}',  // ${variety.name} (new type)`);
}

// ── Output ──────────────────────────────────────────────────────────────────

const output = { generatedByGroup, generatedNewTypes, slugMappings };
writeFileSync('scripts/generated-varieties.json', JSON.stringify(output, null, 2));

console.log('=== GENERATION COMPLETE ===');
let totalVarieties = 0;
for (const [group, varieties] of Object.entries(generatedByGroup)) {
  console.log(`  ${group}: ${varieties.length} varieties`);
  totalVarieties += varieties.length;
}
console.log(`  NEW TYPES: ${generatedNewTypes.length} groups`);
console.log(`Total varieties generated: ${totalVarieties}`);
console.log(`Slug mappings: ${slugMappings.length}`);
console.log('');
console.log('Output written to scripts/generated-varieties.json');
