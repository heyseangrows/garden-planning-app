import type { VegetableGroup } from '@/types';

export const tomatilloGroup: VegetableGroup = {
  id: 'tomatillo',
  name: 'Tomatillos',
  emoji: '🫧',
  description:
    'A warm-season fruiting crop related to the Cape gooseberry, producing round green fruits enclosed in distinctive papery husks that are the essential ingredient for authentic Mexican salsa verde. Tomatillos are tender perennials grown as annuals in the UK, requiring similar conditions to tomatoes but generally more robust and forgiving. They need at least two plants for cross-pollination and benefit greatly from greenhouse or polytunnel cultivation in British conditions, though they can succeed outdoors in a warm, sheltered spot during a good summer.',
  varieties: [
    {
      id: 'tomatillo-verde',
      vegetableGroupId: 'tomatillo',
      vegetableName: 'Tomatillo',
      name: 'Verde',
      category: 'western',
      growingHabit: 'bush',
      isPerennial: false,
      height: 100,
      spread: 80,
      climateSuitability: 3,
      yield: 4,
      tastiness: 4,
      difficulty: 3,
      valueForMoney: 4,
      sunRequirement: 'full-sun',
      spacing: { betweenPlantsCm: 60, betweenRowsCm: 90 },
      daysToMaturity: 80,
      indoorSowWeeksBeforeLastFrost: 6,
      plantOutWeeksAfterLastFrost: 2,
      harvestPeriodWeeks: 8,
      yieldDescription:
        'Heavy yields — each plant produces dozens of husk-wrapped fruits. Two plants provide ample tomatillos for a season of salsa verde.',
      maxPlantsPerPerson: 2,
      description:
        'Verde is the standard green tomatillo, producing an abundance of round, bright green fruits that swell to fill and split their papery husks when ripe. The fruits have a tart, slightly lemony flavour with herbaceous notes that is entirely unique — it is the irreplaceable base of salsa verde, enchiladas verdes, and countless Mexican dishes. Tomatillos are prolific plants with a sprawling habit, producing masses of yellow flowers (attractive to bees) followed by the distinctive lantern-like husks. They are more forgiving than tomatoes in the UK and generally have fewer pest and disease problems, making them a rewarding crop for the adventurous gardener.',
      growingInstructions:
        'Sow indoors 6 weeks before the last frost (mid-March) at 20-25°C. Pot on into 9cm, then 13cm pots as plants grow. Plant out 2 weeks after the last frost (late May) in a greenhouse border, polytunnel, or very sunny, sheltered outdoor spot. IMPORTANT: You must grow at least two plants — tomatillos are self-incompatible and will not set fruit without a pollination partner. Space 60cm apart and provide support — the sprawling bushes benefit from tomato cages or stakes. Water consistently and feed with a high-potash fertiliser once flowering begins. Harvest when the papery husks turn from green to tan and the fruits have filled the husk, typically from August onwards. Fruits store for weeks in their husks at cool room temperature.',
      commonProblems: [
        'Poor or no fruit set with only one plant — ALWAYS grow at least two for cross-pollination',
        'Red spider mite in hot, dry greenhouse conditions',
        'Slugs on young plants',
        'Whitefly in greenhouse',
        'Sprawling habit needs support or adequate space',
      ],
      goodCompanions: ['basil', 'marigold', 'nasturtium', 'beans', 'coriander'],
      badCompanions: ['fennel', 'kohlrabi', 'potato'],
      benefitsFromGrowLights: true,
      benefitsFromFleece: true,
      growLightsExtendWeeks: 3,
      fleeceExtendWeeks: 2,
      sowDepth: '0.5 cm',
      germinationTemp: '20-25°C',
      waterNeeds: 'medium',
      displayColor: '#9ACD32',
    },
  ],
};
