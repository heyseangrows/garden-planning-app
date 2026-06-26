import type { VegetableGroup } from '@/types';

export const collardGreensGroup: VegetableGroup = {
  id: 'collard-greens',
  name: 'Collard Greens',
  emoji: '🥬',
  description:
    'A hardy, non-heading brassica grown for its large, smooth, dark green leaves that are a staple of Southern American cooking but thrive equally well in the UK climate. Collards are one of the most cold-tolerant of all brassicas, withstanding frosts that would destroy cabbage, and their flavour actually improves after cold weather — though kale remains the very hardiest brassica of all. They are among the easiest greens to grow in British conditions, producing abundant harvests over a very long season with minimal pest problems compared to other brassicas.',
  tags: ['clubroot-host'],
  varieties: [
    {
      id: 'collard-greens-georgia',
      vegetableGroupId: 'collard-greens',
      vegetableName: 'Collard Greens',
      name: 'Georgia Southern',
      category: 'western',
      growingHabit: 'upright',
      isPerennial: false,
      height: 60,
      spread: 75,
      climateSuitability: 3,
      yield: 4,
      tastiness: 3,
      difficulty: 2,
      valueForMoney: 5,
      sunRequirement: 'full-sun',
      spacing: { betweenPlantsCm: 40, betweenRowsCm: 45 },
      daysToMaturity: 75,
      directSowWeeksAfterLastFrost: 2,
      harvestPeriodWeeks: 12,
      yieldDescription:
        'Prolific leaf production — each plant provides multiple harvests of large, tender leaves over several months.',
      maxPlantsPerPerson: 3,
      description:
        'Georgia Southern is a classic heirloom collard variety from the American South, producing large, wavy-edged, blue-green leaves on tall, sturdy stems. It is exceptionally heat-tolerant for a brassica, resisting bolting even in warm weather, yet its flavour improves markedly after autumn frosts. The leaves have a mild, earthy, slightly cabbage-like flavour that is sweeter and more delicate than kale. In the UK, Georgia Southern performs admirably in both cool summers and mild winters, providing a continuous supply of cooking greens from midsummer through to the following spring.',
      growingInstructions:
        'Sow direct from 2 weeks after the last frost (late May) through to August for a continuous supply. Collards prefer rich, well-drained soil in full sun but tolerate partial shade. Sow seeds 1cm deep, thinning to 40cm apart with 45cm between rows — they need space for their large leaves. Water regularly, especially in dry spells, to keep leaves tender. Begin harvesting outer leaves from 10 weeks, leaving the central growing point intact for continued production. The real magic of collards in the UK is their winter hardiness — they survive hard frosts intact and taste noticeably sweeter after cold weather. Harvest through winter as needed. For the spring crop, allow plants to overwinter and they will produce a flush of tender new leaves in March-April before eventually bolting.',
      commonProblems: [
        'Cabbage white butterfly caterpillars on leaves',
        'Slugs on young seedlings',
        'Aphids on undersides of leaves',
        'Downy mildew in humid, crowded conditions',
      ],
      goodCompanions: ['onion', 'beetroot', 'celery', 'chamomile', 'mint'],
      badCompanions: ['tomato', 'strawberry', 'beans', 'fennel'],
      benefitsFromGrowLights: false,
      benefitsFromFleece: true,
      growLightsExtendWeeks: 0,
      fleeceExtendWeeks: 4,
      sowDepth: '1 cm',
      germinationTemp: '15-25°C',
      waterNeeds: 'medium',
      displayColor: '#228B22',
    },
  ],
};
