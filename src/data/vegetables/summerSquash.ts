import type { VegetableGroup } from '@/types';

export const summerSquashGroup: VegetableGroup = {
  id: 'gourds',
  name: 'Gourds & Luffa',
  emoji: '🥒',
  description:
    'Gourds and specialty cucurbits that are harvested young for eating or left to mature for other uses. Luffa is a fascinating dual-purpose gourd — pick young for the table or leave to mature into natural bath sponges. These warm-season crops need a long, hot growing season and perform best in a greenhouse or polytunnel in the UK climate.',
  varieties: [
    {
      id: 'summer-squash-luffa',
      vegetableGroupId: 'gourds',
      vegetableName: 'Luffa',
      name: 'Luffa (Sponge Gourd)',
      category: 'western',
      growingHabit: 'climbing',
      isPerennial: false,
      height: 500,
      spread: 120,
      climateSuitability: 2,
      yield: 3,
      tastiness: 3,
      difficulty: 4,
      valueForMoney: 3,
      sunRequirement: 'full-sun',
      spacing: { betweenPlantsCm: 90, betweenRowsCm: 150 },
      daysToMaturity: 110,
      indoorSowWeeksBeforeLastFrost: 6,
      plantOutWeeksAfterLastFrost: 3,
      harvestPeriodWeeks: 6,
      yieldDescription:
        'Moderate yields of young edible gourds plus mature sponges — a dual-purpose novelty crop.',
      maxPlantsPerPerson: 1,
      description:
        'Luffa (also spelled Loofah) is a fascinating dual-purpose gourd. Harvest young at 15–20cm for eating as a tender summer squash with a flavour similar to courgette, or leave the fruits on the vine to mature into the famous natural bath sponges. The vigorous vines can reach 5m or more and need very strong support. In the UK climate, luffa is best grown in a greenhouse, polytunnel, or very sheltered sunny spot, as it needs a long, warm growing season. The young fruits are popular in Asian cuisine and the mature sponges are a satisfying, zero-waste alternative to synthetic sponges.',
      growingInstructions:
        'Sow indoors 6 weeks before the last frost (late March to early April) in 9cm pots at 22–26°C. Luffa needs more warmth than most squashes — a heated propagator is ideal. Nick or soak seeds for 24 hours before sowing to improve germination. Pot on as plants grow. Plant out 3 weeks after the last frost (early June) into a greenhouse, polytunnel, or the warmest, most sheltered outdoor spot. Provide extremely strong support — the vines are heavy. Space 90cm apart. Water generously and feed weekly. For eating, harvest at 15–20cm. For sponges, leave on the vine until the skin turns brown and dry (October–November). Peel, shake out seeds, and bleach in dilute solution for a white sponge.',
      commonProblems: [
        'Slow growth and poor ripening in cool summers',
        'Red spider mite in greenhouse',
        'Powdery mildew',
        'Needs a very long warm season — challenging outdoors in the UK',
      ],
      goodCompanions: ['sweetcorn', 'beans', 'sunflower'],
      badCompanions: ['potato'],
      benefitsFromGrowLights: true,
      benefitsFromFleece: true,
      growLightsExtendWeeks: 4,
      fleeceExtendWeeks: 3,
      sowDepth: '2 cm (nick and soak seed)',
      germinationTemp: '22-26°C',
      waterNeeds: 'high',
      displayColor: '#A5D6A7',
    },
  ],
};
