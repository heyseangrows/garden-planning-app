/**
 * Phase 3: Merge generated varieties into existing TypeScript files.
 * Reads generated-varieties.json, appends varieties to existing group files,
 * creates new files for brand new types, updates slug-map.ts and source.ts.
 */
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { execSync } from 'child_process';

const gen = JSON.parse(readFileSync('scripts/generated-varieties.json', 'utf-8'));

// ── Format a single variety as TypeScript ──────────────────────────────────

function formatVariety(v, indent = '    ') {
  const i = indent;
  const arr = (a) => a && a.length > 0 ? `[${a.map(x => `'${x.replace(/'/g, "\\'")}'`).join(', ')}]` : '[]';

  return `${i}{
${i}  id: '${v.id}',
${i}  vegetableGroupId: '${v.vegetableGroupId}',
${i}  vegetableName: '${v.vegetableName}',
${i}  name: '${v.name.replace(/'/g, "\\'")}',
${i}  category: '${v.category}',
${i}  growingHabit: '${v.growingHabit}',
${i}  isPerennial: ${v.isPerennial},
${i}  height: ${v.height},
${i}  spread: ${v.spread},
${i}  climateSuitability: ${v.climateSuitability},
${i}  yield: ${v.yield},
${i}  tastiness: ${v.tastiness},
${i}  difficulty: ${v.difficulty},
${i}  valueForMoney: ${v.valueForMoney},
${i}  sunRequirement: '${v.sunRequirement}',
${i}  spacing: { betweenPlantsCm: ${v.spacing.betweenPlantsCm}, betweenRowsCm: ${v.spacing.betweenRowsCm} },
${i}  daysToMaturity: ${v.daysToMaturity},
${i}  indoorSowWeeksBeforeLastFrost: ${v.indoorSowWeeksBeforeLastFrost ?? 'undefined'},
${i}  directSowWeeksAfterLastFrost: ${v.directSowWeeksAfterLastFrost ?? 'undefined'},
${i}  plantOutWeeksAfterLastFrost: ${v.plantOutWeeksAfterLastFrost ?? 'undefined'},
${i}  harvestPeriodWeeks: ${v.harvestPeriodWeeks},
${i}  yieldDescription: '${(v.yieldDescription || '').replace(/'/g, "\\'")}',
${i}  maxPlantsPerPerson: ${v.maxPlantsPerPerson},
${i}  description: '${(v.description || '').replace(/'/g, "\\'")}',
${i}  growingInstructions: '${(v.growingInstructions || '').replace(/'/g, "\\'")}',
${i}  commonProblems: ${arr(v.commonProblems)},
${i}  goodCompanions: ${arr(v.goodCompanions)},
${i}  badCompanions: ${arr(v.badCompanions)},
${i}  benefitsFromGrowLights: ${v.benefitsFromGrowLights},
${i}  benefitsFromFleece: ${v.benefitsFromFleece},
${i}  growLightsExtendWeeks: ${v.growLightsExtendWeeks},
${i}  fleeceExtendWeeks: ${v.fleeceExtendWeeks},
${i}  sowDepth: '${v.sowDepth || '1 cm'}',
${i}  germinationTemp: '${v.germinationTemp || '15-20°C'}',
${i}  waterNeeds: '${v.waterNeeds || 'medium'}',
${i}  displayColor: '${v.displayColor}',
${i}},`;
}

// ── Merge into existing group files ────────────────────────────────────────

const groupFileMap = {
  tomatoes: 'tomatoes.ts', peppers: 'peppers.ts', alliums: 'alliums.ts',
  squash: 'squash.ts', cucumber: 'cucumber.ts', legumes: 'legumes.ts',
  lettuce: 'lettuce.ts', spinach: 'spinach.ts', kale: 'kale.ts',
  chard: 'chard.ts', broccoli: 'broccoli.ts', cabbage: 'cabbage.ts',
  cauliflower: 'cauliflower.ts', brusselsSprouts: 'brusselsSprouts.ts',
  kohlrabi: 'kohlrabi.ts', carrot: 'carrot.ts', beetroot: 'beetroot.ts',
  radish: 'radish.ts', parsnip: 'parsnip.ts', turnip: 'turnip.ts',
  swede: 'swede.ts', sweetcorn: 'sweetcorn.ts', asparagus: 'asparagus.ts',
  artichoke: 'artichoke.ts', celery: 'celery.ts', fennel: 'fennel.ts',
  rhubarb: 'rhubarb.ts', okra: 'okra.ts', sweetPotato: 'sweetPotato.ts',
  potato: 'potato.ts', aubergine: 'aubergine.ts', celeriac: 'celeriac.ts',
  endive: 'endive.ts', watercress: 'watercress.ts', courgette: 'courgette.ts',
  pumpkin: 'pumpkin.ts', rocket: 'rocket.ts', pakChoi: 'pakChoi.ts',
  chineseCabbage: 'chineseCabbage.ts', choySum: 'choySum.ts',
  mizuna: 'mizuna.ts', mooli: 'mooli.ts', mustardGreens: 'mustardGreens.ts',
  kaiLan: 'kaiLan.ts', tatsoi: 'tatsoi.ts', collardGreens: 'collardGreens.ts',
  sorrel: 'sorrel.ts', mache: 'mache.ts', horseradish: 'horseradish.ts',
  tomatillo: 'tomatillo.ts', summerSquash: 'summerSquash.ts',
  specialtyGreens: 'specialtyGreens.ts', asianGreensExpanded: 'asianGreensExpanded.ts',
  unusualRoots: 'unusualRoots.ts', perennialVegetables: 'perennialVegetables.ts',
  specialtyLegumes: 'specialtyLegumes.ts', herbs: 'herbs.ts',
};

const BASE = 'src/data/vegetables/';

let totalMerged = 0;
const mergedGroups = [];

for (const [groupId, varieties] of Object.entries(gen.generatedByGroup)) {
  const filename = groupFileMap[groupId];
  if (!filename) {
    console.warn(`WARNING: No file mapping for group "${groupId}" — skipping ${varieties.length} varieties`);
    continue;
  }
  const filepath = BASE + filename;
  if (!existsSync(filepath)) {
    console.warn(`WARNING: File not found: ${filepath} — skipping`);
    continue;
  }

  let content = readFileSync(filepath, 'utf-8');

  // Create a marker comment to indicate generated varieties
  const markerStart = '\n  // ── Generated varieties (from @cropgraph/core) ──────────────────────────';

  // Remove any previously generated block (idempotent)
  const markerIdx = content.indexOf(markerStart);
  if (markerIdx !== -1) {
    // Find the closing ]; after the marker — this is the end of the varieties array
    const afterMarker = content.indexOf('\n  ],', markerIdx);
    if (afterMarker !== -1) {
      // Remove from marker to ], (preserve the ], and everything after)
      content = content.substring(0, markerIdx) + content.substring(afterMarker);
    }
  }

  // Find the closing of the varieties array.
  // Files end with:   ],\n};
  // The closing ] of the varieties array is at 2-space indent.
  const varietiesCloseIdx = content.lastIndexOf('\n  ],');
  if (varietiesCloseIdx === -1) {
    console.warn(`WARNING: Could not find varieties array close in ${filename} — skipping`);
    continue;
  }

  // Insert the new varieties
  const varietyEntries = varieties.map(v => formatVariety(v, '    ')).join('\n');
  const newBlock = `${markerStart}\n${varietyEntries}`;

  content = content.substring(0, varietiesCloseIdx) + '\n' + newBlock + '\n  ],\n};';

  writeFileSync(filepath, content);
  console.log(`  MERGED: ${filename} — added ${varieties.length} varieties`);
  totalMerged += varieties.length;
  mergedGroups.push(groupId);
}

// ── Create new type files ──────────────────────────────────────────────────

// Blacklist: entries that are NOT garden vegetables (wild plants, grains, industrial crops)
const NEW_TYPE_BLACKLIST = new Set([
  'western-spring-beauty', 'yellow-velvetleaf-aquatic', 'water-dock-aquaticus',
  'specialty-egusi-melon', 'specialty-ethiopian-tef-ivory', 'udo-aralia-cordata',
  'taranome-aralia-elata', 'salba-chia', 'sponge-luffa',
]);

// Consolidate: map duplicate sub-types to their parent group
const CONSOLIDATE_TO = {
  'chayote-perennial': 'chayote',
  'bitter-melon-chinese': 'bitter-melon',
  'snake-gourd-edible': 'snake-gourd',
  'luffa-edible-young': 'edible-luffa',
  'agretti-saltwort-soda': 'agretti',
  'cushaw-hopi': null, // merge into squash later
};

// Entries to merge into existing groups instead of creating new files
const MERGE_INTO_EXISTING = {
  'trout-back-romaine': 'lettuce',
};

let newTypeCount = 0;
const newTypeGroupIds = [];

for (const t of gen.generatedNewTypes) {
  const groupBaseId = t.groupId;

  // Skip blacklisted
  if (NEW_TYPE_BLACKLIST.has(groupBaseId)) {
    console.log(`  SKIPPED (blacklist): ${groupBaseId} — not a garden vegetable`);
    continue;
  }

  // Handle consolidation
  if (CONSOLIDATE_TO[groupBaseId] === null) {
    console.log(`  SKIPPED (consolidate): ${groupBaseId} — merged into existing group`);
    continue;
  }

  if (CONSOLIDATE_TO[groupBaseId]) {
    console.log(`  SKIPPED (consolidate): ${groupBaseId} → ${CONSOLIDATE_TO[groupBaseId]}`);
    continue;
  }

  // Handle merge into existing
  if (MERGE_INTO_EXISTING[groupBaseId]) {
    console.log(`  SKIPPED (merge): ${groupBaseId} → ${MERGE_INTO_EXISTING[groupBaseId]}`);
    continue;
  }
  const snakeId = t.groupId.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
  const filename = `${snakeId}.ts`;
  const filepath = BASE + filename;

  const varietyBlock = t.varieties.map(v => formatVariety(v, '    ')).join('\n');

  const content = `import type { VegetableGroup } from '@/types';

export const ${snakeId}Group: VegetableGroup = {
  id: '${t.groupId}',
  name: '${t.groupName}',
  emoji: '${t.emoji}',
  description: '${t.description.replace(/'/g, "\\'")}',
  varieties: [
${varietyBlock}
  ],
};
`;

  writeFileSync(filepath, content);
  console.log(`  NEW: ${filename} — ${t.groupName}`);
  newTypeCount++;
  newTypeGroupIds.push({ id: t.groupId, importName: snakeId, filename, name: t.groupName });
}

console.log('');
console.log(`=== MERGE COMPLETE ===`);
console.log(`Varieties merged: ${totalMerged}`);
console.log(`New type files created: ${newTypeCount}`);

// ── Update slug-map.ts ─────────────────────────────────────────────────────

const slugMapPath = 'src/data/cropgraph/slug-map.ts';
let slugMapContent = readFileSync(slugMapPath, 'utf-8');

// Remove any previously generated block
const slugMarker = '  // ── Generated mappings (from scripts/generate-varieties.mjs) ──────────────';
const slugMarkerIdx = slugMapContent.indexOf(slugMarker);
if (slugMarkerIdx !== -1) {
  const afterMarker = slugMapContent.indexOf('\n};', slugMarkerIdx);
  if (afterMarker !== -1) {
    slugMapContent = slugMapContent.substring(0, slugMarkerIdx) + slugMapContent.substring(afterMarker + 4);
  }
}

// Insert new mappings into VARIETY_SPECIFIC_SLUGS (the second/larger object).
// The VARIETY_SPECIFIC_SLUGS object closes with:  };\n\n/**\n * Get the best
// Find the LAST }; in the file followed by function definitions.
const lastObjClose = slugMapContent.lastIndexOf('};\n\n/**\n * Get the best cropgraph slug');
if (lastObjClose !== -1) {
  const generatedBlock = `\n${slugMarker}\n${gen.slugMappings.join('\n')},\n`;
  slugMapContent = slugMapContent.substring(0, lastObjClose) + generatedBlock + slugMapContent.substring(lastObjClose);
}

writeFileSync(slugMapPath, slugMapContent);
console.log(`  UPDATED: slug-map.ts — added ${gen.slugMappings.length} slug mappings`);

// ── Update source.ts ───────────────────────────────────────────────────────

const sourcePath = 'src/data/vegetables/source.ts';
let sourceContent = readFileSync(sourcePath, 'utf-8');

for (const t of newTypeGroupIds) {
  const importLine = `import { ${t.importName}Group } from './${t.filename.replace('.ts', '')}';`;

  // Check if already imported
  if (sourceContent.includes(importLine)) continue;

  // Add import — find the last import from './'
  const lastImportIdx = sourceContent.lastIndexOf("import {");
  const nextLineIdx = sourceContent.indexOf('\n', lastImportIdx);
  const endOfLastImport = sourceContent.indexOf('\n', sourceContent.indexOf(';', nextLineIdx));

  sourceContent = sourceContent.substring(0, endOfLastImport + 1) + importLine + '\n' + sourceContent.substring(endOfLastImport + 1);

  // Add to the array — find the closing ];
  const arrayCloseIdx = sourceContent.lastIndexOf('];');
  if (arrayCloseIdx !== -1) {
    const indent = '  ';
    sourceContent = sourceContent.substring(0, arrayCloseIdx) +
      `${indent}${t.importName}Group,\n` +
      sourceContent.substring(arrayCloseIdx);
  }

  console.log(`  ADDED import: ${t.importName}Group`);
}

writeFileSync(sourcePath, sourceContent);
console.log(`  UPDATED: source.ts — added ${newTypeCount} new group imports`);
console.log('');
console.log('Done!');
