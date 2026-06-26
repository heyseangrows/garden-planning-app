import type { VegetableGroup } from '@/types';

export const sorrelGroup: VegetableGroup = {
  id: 'sorrel',
  name: 'Sorrel',
  emoji: '🌿',
  description:
    'A hardy perennial herb with a distinctive sharp, lemony flavour that adds a bright, tangy note to salads, soups, and sauces. Sorrel is one of the earliest greens to emerge in spring and one of the last to fade in autumn, making it invaluable for the hungry gap. It thrives with virtually no care in UK conditions and returns reliably year after year, providing free lemony leaves for decades from a single planting.',
  varieties: [
    {
      id: 'sorrel-broad-leaf',
      vegetableGroupId: 'sorrel',
      vegetableName: 'Sorrel',
      name: 'Broad Leaf Sorrel',
      category: 'western',
      growingHabit: 'rosette',
      isPerennial: true,
      height: 30,
      spread: 40,
      climateSuitability: 5,
      yield: 4,
      tastiness: 4,
      difficulty: 1,
      valueForMoney: 5,
      sunRequirement: 'partial-shade',
      spacing: { betweenPlantsCm: 30, betweenRowsCm: 40 },
      daysToMaturity: 60,
      directSowWeeksAfterLastFrost: 0,
      harvestPeriodWeeks: 24,
      yieldDescription:
        'Abundant — a single clump provides regular harvests of lemony leaves from early spring through late autumn for years.',
      maxPlantsPerPerson: 2,
      description:
        'Broad Leaf Sorrel is the classic culinary variety, producing large, tender, arrow-shaped green leaves with a refreshing, sharp lemon flavour that comes from oxalic acid. The young leaves are excellent raw in salads (use sparingly — the flavour is intense), while mature leaves cook down into a velvety, lemony purée that is the base of the classic French soup. It is one of the most cold-hardy perennials, poking through frozen ground in late winter to provide the first fresh greens of the year. Utterly trouble-free and one of the best value plants in the kitchen garden.',
      growingInstructions:
        'Sow direct from spring onwards in moisture-retentive soil. Sorrel is unfussy about position — it thrives in sun or partial shade and tolerates damp soil better than most herbs. Sow seeds 0.5cm deep, thinning to 30cm apart. Plants establish quickly and will crop from 8 weeks. Remove flower stalks as they appear to prevent self-seeding and keep the plant focused on leaf production. Cut back tired leaves in midsummer to encourage a flush of tender new growth. Sorrel is very hardy and persists for years — divide clumps every 3-4 years to maintain vigour. The oxalic acid content means sorrel should be eaten in moderation, particularly by those with kidney concerns.',
      commonProblems: [
        'Self-seeds prolifically if flower stalks are not removed',
        'Slugs on young spring growth',
        'Leaves become tough and more acidic after flowering',
        'Clumps become congested after 3-4 years without division',
      ],
      goodCompanions: ['strawberry', 'thyme', 'lavender', 'rosemary'],
      badCompanions: ['rhubarb (similar pests)'],
      benefitsFromGrowLights: false,
      benefitsFromFleece: false,
      growLightsExtendWeeks: 0,
      fleeceExtendWeeks: 0,
      sowDepth: '0.5 cm',
      germinationTemp: '12-20°C',
      waterNeeds: 'medium',
      displayColor: '#4CAF50',
    },
  ],
};
