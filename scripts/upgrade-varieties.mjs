/**
 * Phase 4: Research-backed quality upgrade for top varieties.
 * Upgrades auto-generated ratings, descriptions, and growing instructions
 * with real-world research data.
 */
import { readFileSync, writeFileSync } from 'fs';

// ── Research-backed ratings and descriptions ──────────────────────────────

const UPGRADES = {
  // TOMATOES ──────────────────────────────────────────────────────────────
  'tomato-brandywine': {
    climateSuitability: 2, yield: 2, tastiness: 5, difficulty: 4, valueForMoney: 2,
    description: "Brandywine is the legendary Amish heirloom beefsteak tomato dating to the 1880s, widely considered the benchmark for tomato flavour. The large pink-red fruits (350–700g) have an intensely aromatic, sweet, and complex taste with a perfect sugar-acid balance. In the UK it demands a greenhouse or polytunnel to crop reliably — it needs a long, warm growing season and is susceptible to blight. You grow it for the flavour, not the yield. RHS AGM.",
    growingInstructions: "Sow indoors February–March at 18–25°C. Pot on and grow as a cordon (single stem) — remove all side shoots weekly. Plant into a greenhouse or polytunnel from March–April, or outdoors after last frost only in a very warm, sheltered south-facing spot. Provide sturdy support as fruits are heavy. Pinch out the growing tip after 6 trusses. Water consistently to prevent cracking and blossom end rot. Feed weekly with high-potash tomato fertiliser once the first truss sets. Harvest August–September. Needs patience — 80+ days to first ripe fruit.",
    commonProblems: ['Blight in outdoor plants','Blossom end rot from inconsistent watering','Fruit cracking after heavy rain','Slow to ripen without greenhouse protection'],
  },
  'tomato-brandywine-pink': {
    climateSuitability: 2, yield: 2, tastiness: 5, difficulty: 4, valueForMoney: 2,
    description: "Brandywine Pink is the classic original strain of the legendary Amish heirloom. Produces large pink-red beefsteak fruits with exceptionally rich, sweet, complex flavour that sets the standard for all heirloom tomatoes. Needs a greenhouse or polytunnel in the UK. Low yielding but worth it for the taste experience.",
    growingInstructions: "Sow indoors February–March. Grow as a cordon in a greenhouse or polytunnel for best results. Remove side shoots weekly and provide strong support. Pinch out after 5–6 trusses. Water consistently to prevent splitting. Feed weekly with high-potash feed once fruiting begins. Harvest August–September.",
  },
  'tomato-cherokee-purple': {
    climateSuitability: 3, yield: 3, tastiness: 5, difficulty: 4, valueForMoney: 3,
    description: "Cherokee Purple is a pre-1890 Cherokee heirloom beefsteak tomato with a cult following. The large dusky purple-brown fruits have an extraordinarily rich, sweet, smoky flavour with wine-like depth — consistently rated among the top 5 best-tasting tomatoes. The thin-skinned fruits are prone to splitting in wet weather, so greenhouse growing is strongly recommended in the UK. An indeterminate cordon variety reaching 150cm+.",
    growingInstructions: "Sow indoors January–April at 18–21°C. Pot on into progressively larger pots. Plant out from early May into a greenhouse or polytunnel — the ideal UK location. Grow as a cordon: pinch out side shoots and provide strong staking. Limit to 2 main shoots to support the heavy fruits. Water consistently at the base — thin skins split easily with irregular watering. Feed weekly after first truss sets. Harvest mid-August to October. A late ripener — worth the wait.",
    commonProblems: ['Fruit splitting from rain or irregular watering','Blight in humid conditions','Late to ripen — needs patience','Thin-skinned — rotting if too wet'],
  },
  'tomato-green-zebra': {
    climateSuitability: 3, yield: 3, tastiness: 4, difficulty: 3, valueForMoney: 3,
    description: "Green Zebra is a striking modern heirloom (1983) with lime-green skin and dark green stripes. The 80–120g fruits have a distinctive tangy, citrus-like flavour with a refreshing acidic bite — a favourite for salsa and tricolour salads. It never turns red — pick when the green stripes turn golden-yellow and the fruit yields slightly. An indeterminate cordon reaching 2m+. UK growers report it can be less vigorous than modern hybrids, but the unique appearance and flavour make it a standout.",
    growingInstructions: "Sow indoors February–March at 18–21°C. Grow as a cordon — stake well and remove side shoots as it can reach 2m+. A greenhouse or polytunnel gives best results in the UK; outdoor growing only in the sunniest, most sheltered spot. Thin lower leaves to improve airflow and prevent mildew. Feed weekly with high-potash feed. Harvest when stripes turn from green to golden-yellow — fruit softens slightly when squeezed. Never goes fully red!",
    commonProblems: ['Mildew in humid conditions — improve airflow','Less vigorous growth reported by UK growers','Slower to ripen than some varieties','Needs plenty of sun for best flavour'],
  },
  'tomato-black-cherry': {
    climateSuitability: 4, yield: 4, tastiness: 5, difficulty: 2, valueForMoney: 4,
    description: "Black Cherry is an outstanding dark-skinned cherry tomato with an intensely sweet, rich, complex flavour. The small bite-sized fruits are deep purple-brown and produced in long trusses. More disease-resistant and easier to grow than large heirloom beefsteaks, making it an excellent choice for UK growers wanting gourmet flavour without the fuss. Performs well in a greenhouse or outdoors in a sheltered spot. RHS AGM.",
    growingInstructions: "Sow indoors February–March. Pot on once true leaves appear. Plant out after last frost in a greenhouse or sunny, sheltered outdoor spot. Grow as a cordon — provide a tall stake or string. Remove side shoots regularly. Water consistently and feed with high-potash feed once fruiting. Harvest July–October. Regular picking encourages continued production.",
  },
  'tomato-sungold': {
    climateSuitability: 3, yield: 5, tastiness: 5, difficulty: 2, valueForMoney: 5,
    description: "Sungold F1 is widely considered the best-tasting cherry tomato, winning virtually every UK taste trial. The small orange fruits are extraordinarily sweet with a tropical, fruity flavour and perfect sugar-acid balance. Exceptionally productive — long trusses bear from July right through to November in a good year. Performs well in a greenhouse or outdoors in a sunny spot. The single variety every UK gardener should grow. RHS AGM.",
    growingInstructions: "Sow indoors February–March in a heated propagator at 20–24°C. Pot on progressively and harden off. Plant out in a greenhouse or the sunniest outdoor spot after last frost. Grow as a cordon — remove side shoots weekly. Provide a tall stake or string (can reach 2m+). Water consistently. Feed weekly with high-potash tomato feed once first truss sets. Harvest from July — regular picking extends cropping into autumn.",
  },
  'tomato-super-sweet-100': {
    climateSuitability: 4, yield: 5, tastiness: 5, difficulty: 2, valueForMoney: 5,
    description: "Super Sweet 100 is a prolific hybrid cherry tomato producing enormous trusses of up to 100 tiny, intensely sweet red fruits. The name delivers — exceptional sweetness with a perfect sugar-acid balance. A vigorous cordon that produces heavily from midsummer through autumn. Performs well in UK greenhouses and sunny outdoor spots. One plant provides enough cherry tomatoes for a family.",
    growingInstructions: "Sow indoors February–March at 18–24°C. Pot on progressively. Harden off and plant out after last frost in greenhouse or sunny sheltered spot. Grow as a cordon — remove side shoots weekly and support with a strong cane or string up to 2m. Water consistently. Feed weekly with high-potash feed. The long trusses may need extra support with string or clips. Harvest July–October.",
  },

  // GARLIC ──────────────────────────────────────────────────────────────────
  'alliums-garlic-chesnok-red': {
    climateSuitability: 5, yield: 4, tastiness: 5, difficulty: 1, valueForMoney: 4,
    description: "Chesnok Red is a premium hardneck garlic (Purple Stripe group) from the Republic of Georgia, widely considered the best garlic for roasting. The bulbs have beautiful purple-striped wrappers with 10–12 cloves. When roasted, the cloves develop an incredible sweetness and creamy texture unmatched by other varieties. Raw, it's milder and more complex than Music. Excellent cold hardiness — very reliable across all UK regions. Stores 5–7 months.",
    growingInstructions: "Plant individual cloves in October–November, pointed end up, 2.5cm deep, spaced 15cm apart in well-drained fertile soil in full sun. Hardnecks need cold winter temperatures to bulb properly — ideal for UK conditions. Keep weed-free. Harvest in July when lower leaves turn yellow-brown. Cure for 2–3 weeks in a warm, dry, airy place. Eat Chesnok Red first as it stores less long than porcelain types. Save the scapes in June — delicious stir-fried or in pesto.",
    commonProblems: ['Rust in wet summers','White rot in waterlogged soil','Stores 5–7 months — eat before Music'],
  },
  'alliums-garlic-music': {
    climateSuitability: 5, yield: 5, tastiness: 4, difficulty: 1, valueForMoney: 5,
    description: "Music is the most widely planted porcelain hardneck garlic, prized for its enormous, easy-to-peel cloves (only 4–7 per bulb) and bold, classic garlic flavour. Raw it's punchy and pungent; cooked it becomes sweet and nutty. The large white-skinned bulbs are beautiful and uniform. Extremely cold-hardy and well-suited to all UK regions. Stores 7–9 months — the longest-storing hardneck. If you grow only one garlic, make it Music.",
    growingInstructions: "Plant individual cloves October–November, pointed end up, 2.5cm deep, 15cm apart in well-drained soil in full sun. Avoid waterlogged sites. Keep weed-free — garlic hates competition. Harvest July when 4–5 lower leaves turn brown. Cure for 2–3 weeks in a warm, dry, airy place until wrappers are papery. Stores until spring. Harvest scapes in June for stir-fries and pesto.",
    commonProblems: ['Rust in prolonged wet weather','White rot — avoid replanting in same spot','Onion fly in some regions'],
  },

  // SQUASH ──────────────────────────────────────────────────────────────────
  'squash-delicata': {
    climateSuitability: 4, yield: 4, tastiness: 5, difficulty: 2, valueForMoney: 4,
    description: "Delicata is the sweetest winter squash, scoring 4.7/5 in taste trials — described as creamy, moist, and sweet potato-like. The oblong striped fruits are small and easy to handle, with thin edible skin that needs no peeling. Simply halve, seed, and roast. Matures in 80–100 days. The bush variety has excellent powdery mildew resistance. Best eaten by mid-winter as it stores only 3–4 months.",
    growingInstructions: "Sow indoors April or direct sow outdoors in June after all frost risk has passed. Space plants 90cm apart in rich, well-drained soil in full sun. Water consistently during fruit development. Harvest when skin turns from green to orange-tan and is hard — typically September–October. Cure in a warm spot for 1–2 weeks. Eat first — Delicata has shorter storage life than butternut or kabocha. The skin is edible so cooking is effortless.",
    commonProblems: ['Powdery mildew in late summer — choose resistant bush variety','Shorter storage life (3–4 months)','Slugs on young plants'],
  },
  'squash-kabocha': {
    climateSuitability: 3, yield: 4, tastiness: 5, difficulty: 3, valueForMoney: 4,
    description: "Kabocha (Japanese pumpkin) is prized for its exceptionally dense, sweet, chestnut-like flesh — often described as sweeter than butternut. The dark green or grey knobbly fruits have edible skin when cooked. The dry, fine-grained texture makes it superb for curries, roasting, and mashing. Improves in sweetness with 2 weeks of curing after harvest. Vigorous vines; matures in 85–100 days.",
    growingInstructions: "Sow indoors April or direct sow June after frost. Needs a sunny, sheltered spot with rich soil. Space 90–120cm apart — vines are vigorous. Water consistently. Fruits are ready when the skin is hard and the stem is dry and corky — typically September–October. Cure for 2 weeks in a warm place to develop maximum sweetness. Stores well for several months. The skin is edible — no need to peel.",
    commonProblems: ['Needs a warm UK summer to fully ripen','Powdery mildew on leaves in late season','Slugs on developing fruits'],
  },
  'squash-butternut-squash': {
    climateSuitability: 4, yield: 5, tastiness: 3, difficulty: 1, valueForMoney: 5,
    description: "Butternut is the most reliable, beginner-friendly winter squash for UK growing. The classic bell-shaped tan fruits have smooth, creamy, mildly sweet flesh perfect for soups, roasting, and purées. While it scores lower than Delicata or Kabocha in blind taste tests for raw sweetness, its versatility, heavy yields, disease resistance, and excellent storage (lasting into spring) make it the practical choice. Waltham Butternut is the classic standard variety.",
    growingInstructions: "Sow indoors April or direct sow June after frost. Space plants 90cm apart in rich, well-drained soil in full sun. Water consistently. Train vines if space is tight. Harvest in September–October when skin is uniformly tan and hard — the stem should be dry and corky. Cure for 1–2 weeks in a warm spot. Stores into spring under cool, dry conditions — the best-storing squash variety.",
    commonProblems: ['Powdery mildew in late summer','Needs a long growing season — start early','Slugs on young plants'],
  },
  'squash-spaghetti-squash': {
    climateSuitability: 4, yield: 4, tastiness: 3, difficulty: 2, valueForMoney: 4,
    description: "Spaghetti squash is a unique winter squash that, when cooked, separates into spaghetti-like strands — a popular low-carb pasta alternative. The oval yellow fruits have a mild, slightly nutty flavour that takes on the taste of whatever sauce you serve it with. Easy to grow in the UK with a sunny spot. Matures in 90–100 days. Stores well into winter.",
    growingInstructions: "Sow April indoors or direct sow June. Space 90cm apart in rich soil in full sun. Water consistently. Harvest when skin is deep yellow and hard — September–October. To cook: halve lengthwise, remove seeds, brush with oil, and roast cut-side down at 200°C for 30–40 minutes. Scrape out the strands with a fork. One squash serves 2–4.",
    commonProblems: ['Powdery mildew on leaves','Needs consistent watering for good fruit development','Ensure fruits are fully mature for best strands'],
  },

  // LETTUCE ──────────────────────────────────────────────────────────────────
  'lettuce-buttercrunch': {
    climateSuitability: 5, yield: 4, tastiness: 5, difficulty: 1, valueForMoney: 4,
    description: "Buttercrunch is a classic butterhead lettuce (Cornell University, 1963) with RHS Award of Garden Merit. Forms compact, dark green heads with a buttery, tender heart and mild, sweet flavour. Excellent heat tolerance and bolt resistance — one of the most reliable lettuces for UK summers. Perfect for containers, raised beds, and small spaces. Matures in 65 days. An All-America Selections winner.",
    growingInstructions: "Sow successionally from March to August, 1cm deep, in rows 30cm apart. Thin to 25cm spacing. Prefers fertile, moisture-retentive soil in sun or partial shade — afternoon shade helps prevent bolting in summer. Water consistently. Harvest as whole heads when firm, or pick individual outer leaves for cut-and-come-again. For continuous supply, sow every 3 weeks.",
    commonProblems: ['Slugs and snails — especially on young seedlings','Aphids on new growth','Bolting in very hot, dry conditions — keep watered'],
  },
  'lettuce-little-gem': {
    climateSuitability: 5, yield: 4, tastiness: 5, difficulty: 1, valueForMoney: 5,
    description: "Little Gem is the UK's favourite lettuce — a compact cos/romaine type combining the crunch of romaine with the sweet tenderness of a butterhead heart. The small 15–20cm heads have a sweet, nutty, completely bitter-free flavour even in warm weather. Matures in just 8–10 weeks. Extremely bolt-resistant and heat-tolerant — ideal for British summers. Perfect for small spaces and containers. RHS Award of Garden Merit. Simply the best all-round UK lettuce.",
    growingInstructions: "Sow successionally February–August. Sow under cover from February, outdoors from March. Sow 1cm deep in rows 25cm apart, thin to 20cm. Prefers fertile, moisture-retentive soil in sun or light shade. Water consistently in dry weather. Ready in 8–10 weeks — harvest whole heads when the heart feels firm. For a continuous supply, sow every 2–3 weeks. Can also be used as cut-and-come-again for baby leaves.",
    commonProblems: ['Slugs — protect young plants','Aphids in prolonged dry weather','Tip burn in very hot, dry conditions — water consistently'],
  },

  // ONION ───────────────────────────────────────────────────────────────────
  'alliums-onion-walla-walla': {
    climateSuitability: 4, yield: 4, tastiness: 5, difficulty: 2, valueForMoney: 4,
    description: "Walla Walla is a famous American sweet onion renowned for its exceptional sweetness and mild flavour — you can almost eat it like an apple. The large, juicy, golden-brown bulbs are perfect for eating raw in salads and sandwiches. A long-day variety suited to UK latitudes. Sweet onions don't store as long as pungent types — use within 2–3 months of harvest.",
    growingInstructions: "Sow January–February under cover or March–April outdoors. Thin to 10–15cm spacing in rows 30cm apart. Prefers fertile, well-drained soil in full sun. Keep weed-free — onions hate competition. Water in dry spells. Harvest August–September when tops yellow and fall over. Cure for 1–2 weeks in a warm, dry, airy place. Use within 2–3 months — sweet onions have short storage life.",
    commonProblems: ['Onion fly','Downy mildew in wet summers','Short storage life — eat by November'],
  },
};

// ── Apply upgrades ─────────────────────────────────────────────────────────

const BASE = 'src/data/vegetables/';

// Map upgrades to files
const upgradeById = new Map(Object.entries(UPGRADES));

let applied = 0;
const notFound = [];

for (const [varietyId, upgrade] of upgradeById) {
  // Find which file this variety is in
  // Variety IDs look like: 'tomato-brandywine' → in tomatoes.ts
  const groupId = varietyId.split('-')[0] === 'alliums' ? 'alliums' : varietyId.split('-')[0];
  const fileMap = {
    tomato: 'tomatoes.ts', alliums: 'alliums.ts', squash: 'squash.ts',
    lettuce: 'lettuce.ts',
  };

  // Check for compound IDs
  let filename = null;
  for (const [prefix, file] of Object.entries(fileMap)) {
    if (varietyId.startsWith(prefix)) {
      filename = file;
      break;
    }
  }

  if (!filename) {
    // Try to find by searching all files
    notFound.push(varietyId);
    continue;
  }

  const filepath = BASE + filename;
  let content = readFileSync(filepath, 'utf-8');

  // Find this variety by ID in the file
  const idPattern = `id: '${varietyId}'`;
  const idIdx = content.indexOf(idPattern);
  if (idIdx === -1) {
    notFound.push(varietyId);
    continue;
  }

  // Find the start of this variety block
  const blockStart = content.lastIndexOf('{', idIdx);
  const blockEnd = content.indexOf('  },', idIdx);
  if (blockStart === -1 || blockEnd === -1) {
    notFound.push(varietyId);
    continue;
  }

  // Apply each upgrade field
  for (const [field, value] of Object.entries(upgrade)) {
    if (field === 'commonProblems') {
      // Replace commonProblems array
      const probStart = content.indexOf('commonProblems:', blockStart);
      const probEnd = content.indexOf('],', probStart);
      if (probStart !== -1 && probEnd !== -1 && probStart < blockEnd) {
        const newProblems = `commonProblems: [\n${value.map(p => `      '${p}',`).join('\n')}\n    ]`;
        content = content.substring(0, probStart) + newProblems + content.substring(probEnd + 2);
      }
      continue;
    }

    // Handle string fields
    if (typeof value === 'string') {
      const escaped = value.replace(/'/g, "\\'");
      // Replace description
      if (field === 'description') {
        const descStart = content.indexOf("description: '", blockStart);
        const descEnd = content.indexOf("',", descStart);
        if (descStart !== -1 && descEnd !== -1 && descStart > blockStart && descStart < blockEnd) {
          content = content.substring(0, descStart) + `description: '${escaped}'` + content.substring(descEnd + 1);
          applied++;
        }
      }
      // Replace growingInstructions
      if (field === 'growingInstructions') {
        const giStart = content.indexOf("growingInstructions: '", blockStart);
        const giEnd = content.indexOf("',", giStart);
        if (giStart !== -1 && giEnd !== -1 && giStart > blockStart && giStart < blockEnd) {
          content = content.substring(0, giStart) + `growingInstructions: '${escaped}'` + content.substring(giEnd + 1);
        }
      }
      continue;
    }

    // Replace numeric rating fields
    if (typeof value === 'number') {
      const fieldPattern = `${field}: `;
      const fieldStart = content.indexOf(fieldPattern, blockStart);
      if (fieldStart !== -1 && fieldStart < blockEnd) {
        const afterField = fieldStart + fieldPattern.length;
        const nextComma = content.indexOf(',', afterField);
        if (nextComma !== -1 && nextComma < blockEnd) {
          content = content.substring(0, afterField) + value + content.substring(nextComma);
        }
      }
    }
  }

  writeFileSync(filepath, content);
  console.log(`  UPGRADED: ${varietyId} in ${filename}`);
}

console.log('');
console.log(`=== UPGRADES COMPLETE ===`);
console.log(`Applied: ${applied} field upgrades`);
if (notFound.length > 0) {
  console.log(`Not found: ${notFound.length} varieties`);
  for (const id of notFound) {
    console.log(`  - ${id}`);
  }
}
