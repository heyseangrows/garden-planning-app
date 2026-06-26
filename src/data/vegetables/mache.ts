import type { VegetableGroup } from '@/types';

export const macheGroup: VegetableGroup = {
  id: 'mache',
  name: "Lamb's Lettuce (Mâche)",
  emoji: '🥗',
  description:
    "A cold-hardy winter salad green with soft, velvety, dark green leaves arranged in delicate rosettes. Also known as corn salad or lamb's lettuce, mâche is one of the finest winter salad crops for the UK, thriving in the cool, damp conditions of autumn and winter when other salad greens have long since given up. Its mild, nutty flavour and tender texture make it a gourmet salad leaf that is expensive to buy but remarkably easy to grow — a true winter luxury from the garden.",
  varieties: [
    {
      id: 'mache-verte-de-cambrai',
      vegetableGroupId: 'mache',
      vegetableName: "Lamb's Lettuce",
      name: 'Verte de Cambrai',
      category: 'western',
      growingHabit: 'rosette',
      isPerennial: false,
      height: 10,
      spread: 15,
      climateSuitability: 5,
      yield: 4,
      tastiness: 4,
      difficulty: 1,
      valueForMoney: 5,
      sunRequirement: 'partial-shade',
      spacing: { betweenPlantsCm: 15, betweenRowsCm: 20 },
      daysToMaturity: 60,
      directSowWeeksAfterLastFrost: -8,
      harvestPeriodWeeks: 14,
      yieldDescription:
        'Good yields of tender rosettes through autumn and winter. Succession sowing extends the harvest for months. Exceptional value vs supermarket prices.',
      maxPlantsPerPerson: 4,
      description:
        "Verte de Cambrai is a classic French mâche variety producing compact, dark green rosettes of spoon-shaped leaves with a delicate, nutty flavour and soft, velvety texture. It is exceptionally cold-hardy — surviving temperatures well below freezing — and its flavour actually improves after frost. Mâche is one of the few salad greens that genuinely thrives in the UK winter garden, filling the salad bowl from October through March when lettuces are long finished. It is also one of the most expensive salad leaves to buy and one of the easiest to grow, offering remarkable value for the home gardener.",
      growingInstructions:
        'Sow direct from late summer (August to September, about 8 weeks before the first frost) for autumn and winter harvests. Seeds can be erratic to germinate — sow in moist soil and keep shaded and cool (mâche germinates best below 20°C, making it perfect for late summer sowing). Sow thinly in drills 1cm deep, thinning to 15cm apart with 20cm between rows. Mâche is slow-growing but undemanding — keep weed-free but requires no feeding and little watering once established. Harvest whole rosettes by cutting at ground level when 8-10cm across, leaving the root in the soil for a second cut. In cold weather, a cloche or fleece will improve growth rate and leaf quality. Self-seeds readily — allow a few plants to flower in spring for a self-renewing winter crop.',
      commonProblems: [
        'Slow and erratic germination in warm soil (sow in late summer when soil is cooling)',
        'Slugs in wet autumn weather',
        'Downy mildew in very damp, crowded conditions',
        'Bolting in spring as day length increases',
      ],
      goodCompanions: ['brassicas', 'onion', 'garlic', 'leek'],
      badCompanions: ['celery'],
      benefitsFromGrowLights: false,
      benefitsFromFleece: true,
      growLightsExtendWeeks: 0,
      fleeceExtendWeeks: 4,
      sowDepth: '1 cm',
      germinationTemp: '10-18°C',
      waterNeeds: 'medium',
      displayColor: '#7CCD7C',
    },
  ],
};
