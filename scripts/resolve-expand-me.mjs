/**
 * Phase 5: Replace all EXPAND-ME markers with cropgraph-sourced descriptions.
 * Uses @cropgraph/core data (source, notes, season, timing, windows) to build
 * UK-specific growing context for every generated variety.
 */
import { listCrops } from '@cropgraph/core';
import { readFileSync, writeFileSync } from 'fs';

// Build crop index
const allCrops = listCrops();
const cropIndex = new Map(allCrops.map(c => [c.slug, c]));

// ── Helper: build a UK-specific description from cropgraph data ────────────

function buildDescription(cropEntry, varietyName, vegetableName) {
  if (!cropEntry) return `${varietyName} is a ${vegetableName.toLowerCase()} variety. [No cropgraph data available for this variety.]`;

  const season = cropEntry.season || 'warm';
  const seasonLabel = season === 'cool' ? 'cool-season' : season === 'warm' ? 'warm-season' : 'perennial';
  const daysMin = cropEntry.daysToHarvest?.min || 60;
  const daysMax = cropEntry.daysToHarvest?.max || 90;
  const zoneMin = cropEntry.zoneRange?.min || 3;
  const zoneMax = cropEntry.zoneRange?.max || 11;

  let desc = `${varietyName} is a ${seasonLabel} ${vegetableName.toLowerCase()} variety, maturing in ${daysMin}–${daysMax} days. `;

  // Climate suitability for UK
  if (season === 'cool') {
    desc += `As a cool-season crop it is well-suited to UK conditions and can be grown spring through autumn. `;
  } else if (season === 'warm') {
    if (zoneMin <= 4) {
      desc += `Adapted to cooler climates (zones ${zoneMin}–${zoneMax}), it performs well outdoors in the UK in a sunny sheltered spot. `;
    } else if (zoneMin <= 6) {
      desc += `It benefits from a greenhouse, polytunnel, or very warm sheltered position in the UK to reach its full potential. `;
    } else {
      desc += `A warmth-loving variety that needs greenhouse or polytunnel cultivation to crop reliably in the UK. `;
    }
  } else if (season === 'perennial') {
    desc += `A perennial crop that establishes over the first year and returns annually. `;
  }

  // Add cropgraph source/notes if available
  if (cropEntry.notes) {
    const note = cropEntry.notes.trim();
    if (note.length > 10) {
      desc += `${note}`;
      if (!note.endsWith('.')) desc += '. ';
    }
  }
  if (cropEntry.source) {
    desc += ` [Source: ${cropEntry.source}]`;
  }

  return desc;
}

function buildGrowingInstructions(cropEntry, varietyName) {
  if (!cropEntry) return `Sow and grow according to standard ${varietyName.toLowerCase()} practice.`;

  const windows = cropEntry.windows || [];
  const season = cropEntry.season || 'warm';

  // Extract timing from windows
  const indoor = windows.find(w => w.action === 'start_indoors' && w.anchor === 'last_spring');
  const direct = windows.find(w => w.action === 'direct_sow' && w.anchor === 'last_spring');
  const transplant = windows.find(w => w.action === 'transplant' && w.anchor === 'last_spring');
  const fallDirect = windows.find(w => w.action === 'direct_sow' && w.anchor === 'first_fall');

  let instructions = '';

  // Indoor sowing
  if (indoor) {
    const weeks = Math.round(Math.abs(Math.min(0, indoor.fromFrostDays)) / 7);
    const months = weeks >= 10 ? 'January–February' : weeks >= 8 ? 'February–March' : weeks >= 6 ? 'March' : 'March–April';
    instructions += `Sow indoors ${weeks} weeks before last frost (${months}) at 18–24°C in seed compost. Prick out into individual pots once true leaves appear. `;
  } else if (season === 'warm') {
    instructions += `Sow indoors March–April at 18–24°C in seed compost. Prick out into individual pots once true leaves appear. `;
  }

  // Direct sowing
  if (direct) {
    const weeks = Math.round(direct.fromFrostDays / 7);
    const when = weeks <= 0 ? `${Math.abs(weeks)} weeks before last frost` : `${weeks} weeks after last frost`;
    instructions += `Or direct sow ${when} in prepared soil. `;
  } else if (fallDirect) {
    const weeks = Math.round(Math.abs(Math.min(0, fallDirect.fromFrostDays)) / 7);
    instructions += `Can also be direct sown in late summer (${weeks} weeks before first autumn frost) for an overwintered crop. `;
  } else if (season === 'cool' && !indoor) {
    instructions += `Direct sow March–August in shallow drills. `;
  }

  // Transplanting
  if (transplant) {
    const weeks = Math.round(Math.max(0, transplant.fromFrostDays) / 7);
    instructions += `Harden off and transplant ${weeks} weeks after last frost (typically late May to early June) into fertile, well-drained soil. `;
  } else if (indoor && !transplant) {
    instructions += `Harden off gradually and plant out after all risk of frost has passed. `;
  }

  if (season === 'perennial') {
    instructions += `As a perennial, choose a permanent position. Mulch well in autumn. `;
  }

  // Harvest info
  const days = cropEntry.daysToHarvest?.min || 60;
  instructions += `Harvest approximately ${days} days from sowing. `;

  // Water and feeding
  instructions += `Water consistently during dry spells. `;
  if (season === 'warm') {
    instructions += `Apply a high-potash liquid feed every 10–14 days once flowering begins to maximise cropping. `;
  }

  return instructions.trim();
}

function buildYieldDescription(cropEntry, varietyName, vegetableName) {
  if (!cropEntry) return `Typical yields for ${varietyName.toLowerCase()}.`;

  const daysMin = cropEntry.daysToHarvest?.min || 60;
  const daysMax = cropEntry.daysToHarvest?.max || 90;
  const spread = daysMax - daysMin;

  if (daysMin <= 40) return `Quick to mature (${daysMin}–${daysMax} days), producing a fast crop of ${varietyName.toLowerCase()}.`;
  if (daysMin <= 60) return `Early-maturing variety (${daysMin}–${daysMax} days), yielding a steady harvest of ${varietyName.toLowerCase()}.`;
  if (daysMin <= 80) return `Mid-season ${vegetableName.toLowerCase()} maturing in ${daysMin}–${daysMax} days with a productive harvest period${spread > 20 ? ' over several weeks' : ''}.`;
  if (daysMin <= 120) return `Longer-season ${vegetableName.toLowerCase()} (${daysMin}–${daysMax} days) rewarding patience with${spread > 20 ? ' extended' : ''} harvests.`;
  return `Slow-maturing ${vegetableName.toLowerCase()} (${daysMin}–${daysMax} days)${spread > 30 ? ' with a prolonged harvest window' : ''}.`;
}

// ── Process all vegetable files ────────────────────────────────────────────

// Use find to list all vegetable data files
import { execSync } from 'child_process';
const result = execSync('ls src/data/vegetables/*.ts | grep -v source.ts | grep -v index.ts | grep -v consolidated.ts', { encoding: 'utf-8' });
const files = result.trim().split('\n').filter(Boolean);

let totalReplaced = 0;

for (const filepath of files) {
  let content = readFileSync(filepath, 'utf-8');

  // Find each variety block and resolve its EXPAND-ME markers
  // Match variety IDs and their cropgraph slugs
  const varietyRegex = /id:\s*'([^']+)'/g;
  let match;

  while ((match = varietyRegex.exec(content)) !== null) {
    const varietyId = match[1];

    // Determine the cropgraph slug for this variety
    // Generated variety IDs follow pattern: {groupId}-{cropgraph-slug}
    // e.g. 'tomatoes-brandywine-tomato' → slug is 'brandywine-tomato'
    // or 'squash-delicata' → slug is 'delicata'
    const idParts = varietyId.split('-');
    let cropSlug = null;

    // The cropgraph slug is everything after the group prefix
    // But we need to find the right cropgraph entry
    // Try the last N parts as the slug
    for (let i = 1; i < idParts.length; i++) {
      const candidate = idParts.slice(i).join('-');
      if (cropIndex.has(candidate)) {
        cropSlug = candidate;
        break;
      }
    }

    if (!cropSlug) continue;

    const cropEntry = cropIndex.get(cropSlug);
    if (!cropEntry) continue;

    // Find the variety block boundaries
    const idIdx = content.indexOf(`id: '${varietyId}'`);
    const blockStart = content.lastIndexOf('{', idIdx);
    // Find the closing of this variety entry (the next '},' at the right indentation level)
    const blockEnd = content.indexOf('\n    },', idIdx);
    if (blockStart === -1 || blockEnd === -1) continue;

    // Extract variety info
    const nameMatch = content.substring(blockStart, blockEnd).match(/name:\s*'([^']+)'/);
    const vegNameMatch = content.substring(blockStart, blockEnd).match(/vegetableName:\s*'([^']+)'/);
    const varietyName = nameMatch ? nameMatch[1] : 'This variety';
    const vegetableName = vegNameMatch ? vegNameMatch[1] : 'Vegetable';

    // Replace EXPAND-ME in description
    const descPattern = /description:\s*'([^']*EXPAND-ME[^']*)'/;
    const descMatch = content.substring(blockStart, blockEnd).match(descPattern);
    if (descMatch) {
      const newDesc = buildDescription(cropEntry, varietyName, vegetableName);
      const oldDesc = descMatch[1];
      const escapedNewDesc = newDesc.replace(/'/g, "\\'");
      const fullOld = `description: '${oldDesc}'`;
      const fullNew = `description: '${escapedNewDesc}'`;
      content = content.replace(fullOld, fullNew);
      totalReplaced++;
    }

    // Replace EXPAND-ME in growingInstructions
    const giPattern = /growingInstructions:\s*'([^']*EXPAND-ME[^']*)'/;
    const giMatch = content.substring(blockStart, blockEnd).match(giPattern);
    if (giMatch) {
      const newGI = buildGrowingInstructions(cropEntry, varietyName);
      const oldGI = giMatch[1];
      const escapedNewGI = newGI.replace(/'/g, "\\'");
      const fullOld = `growingInstructions: '${oldGI}'`;
      const fullNew = `growingInstructions: '${escapedNewGI}'`;
      content = content.replace(fullOld, fullNew);
      totalReplaced++;
    }

    // Replace EXPAND-ME in yieldDescription
    const ydPattern = /yieldDescription:\s*'([^']*EXPAND-ME[^']*)'/;
    const ydMatch = content.substring(blockStart, blockEnd).match(ydPattern);
    if (ydMatch) {
      const newYD = buildYieldDescription(cropEntry, varietyName, vegetableName);
      const oldYD = ydMatch[1];
      const escapedNewYD = newYD.replace(/'/g, "\\'");
      const fullOld = `yieldDescription: '${oldYD}'`;
      const fullNew = `yieldDescription: '${escapedNewYD}'`;
      content = content.replace(fullOld, fullNew);
      totalReplaced++;
    }
  }

  writeFileSync(filepath, content);
}

console.log(`=== EXPAND-ME RESOLUTION COMPLETE ===`);
console.log(`Total markers replaced: ${totalReplaced}`);
console.log(`Files processed: ${files.length}`);
