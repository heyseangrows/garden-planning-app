import type { VegetableGroup } from '@/types';

export const horseradishGroup: VegetableGroup = {
  id: 'horseradish',
  name: 'Horseradish',
  emoji: '🥬',
  description:
    'A vigorous, hardy perennial grown for its large, pungent taproots that are grated fresh to make the classic fiery condiment that accompanies roast beef and smoked fish. Horseradish is incredibly easy to grow in the UK climate — so easy, in fact, that it can become invasive if not contained. A single plant provides more than enough pungent root for a household, and the young leaves are also edible with a milder, peppery flavour. Once established, it is virtually indestructible.',
  tags: ['clubroot-host'],
  varieties: [
    {
      id: 'horseradish-common',
      vegetableGroupId: 'horseradish',
      vegetableName: 'Horseradish',
      name: 'Common Horseradish',
      category: 'western',
      growingHabit: 'upright',
      isPerennial: true,
      height: 90,
      spread: 60,
      climateSuitability: 5,
      yield: 5,
      tastiness: 3,
      difficulty: 1,
      valueForMoney: 5,
      sunRequirement: 'full-sun',
      spacing: { betweenPlantsCm: 60, betweenRowsCm: 90 },
      daysToMaturity: 160,
      directSowWeeksAfterLastFrost: 2,
      harvestPeriodWeeks: 12,
      yieldDescription:
        'Exceptionally productive — a single plant produces more root than most households can use. Free horseradish for life from one planting.',
      maxPlantsPerPerson: 1,
      description:
        'Common horseradish is a robust, deep-rooted perennial producing large, fleshy white taproots with an intense, sinus-clearing pungency that is released only when grated fresh. The large, glossy green leaves form an attractive clump reaching 90cm tall. Grated horseradish root mixed with vinegar and cream makes the classic British condiment — and the flavour of freshly grated homegrown horseradish is incomparably more pungent and complex than anything from a jar. It is arguably the easiest edible crop in existence for the UK gardener, thriving in neglect and returning more vigorously each year.',
      growingInstructions:
        'Grow from root cuttings (thongs) rather than seed for the fastest, most reliable results. Plant root cuttings 5cm deep and 60cm apart from 2 weeks after the last frost (late May) in a sunny spot with deep, well-drained soil. WARNING: Horseradish is highly invasive — any fragment of root left in the soil will regrow. Consider planting in a sunken bottomless bucket or dedicated bed to contain it. Water in dry spells. Harvest roots from October through winter by digging carefully — any roots left behind will grow into new plants. For the best flavour, harvest after frost. Grate fresh and mix immediately with vinegar to stabilise the heat. If you want to eliminate horseradish from a spot, you must dig out every scrap of root — it will return from the tiniest fragment.',
      commonProblems: [
        'INVASIVE — spreads aggressively from root fragments! Must be contained or planted in a dedicated, monitored spot.',
        'Cabbage white caterpillars on leaves in summer',
        'Flea beetles creating small holes in leaves (cosmetic only)',
        'Roots become woody and less pungent in very dry soil',
      ],
      goodCompanions: ['potato', 'sweet potato', 'fruit trees (deters pests)'],
      badCompanions: ['beans'],
      benefitsFromGrowLights: false,
      benefitsFromFleece: false,
      growLightsExtendWeeks: 0,
      fleeceExtendWeeks: 0,
      sowDepth: '5 cm (root cuttings)',
      germinationTemp: 'N/A (plant root cuttings)',
      waterNeeds: 'medium',
      displayColor: '#F5F5DC',
    },
  ],
};
