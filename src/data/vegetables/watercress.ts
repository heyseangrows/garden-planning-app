import type { VegetableGroup } from '@/types';

export const watercressGroup: VegetableGroup = {
  id: 'watercress',
  name: 'Watercress',
  emoji: '🌿',
  description:
    'A fast-growing, peppery aquatic perennial that is one of the most nutrient-dense leafy greens you can grow. True watercress thrives in running water, but it adapts surprisingly well to consistently moist garden conditions in the UK, where its natural affinity for cool, damp environments makes it an ideal crop. It provides an almost continuous harvest of peppery, vitamin-rich leaves from spring through autumn and returns year after year.',
  tags: ['clubroot-host'],
  varieties: [
    {
      id: 'watercress-aquatic',
      vegetableGroupId: 'watercress',
      vegetableName: 'Watercress',
      name: 'Watercress',
      category: 'western',
      growingHabit: 'sprawling',
      isPerennial: true,
      height: 15,
      spread: 60,
      climateSuitability: 4,
      yield: 4,
      tastiness: 5,
      difficulty: 2,
      valueForMoney: 5,
      sunRequirement: 'partial-shade',
      spacing: { betweenPlantsCm: 15, betweenRowsCm: 20 },
      daysToMaturity: 55,
      directSowWeeksAfterLastFrost: 2,
      harvestPeriodWeeks: 16,
      yieldDescription:
        'Prolific cut-and-come-again crops — a single patch provides peppery leaves for salads and sandwiches for months.',
      maxPlantsPerPerson: 3,
      description:
        'Watercress is the classic aquatic salad leaf with a distinctive peppery, slightly mustardy kick that is unmatched for freshness. The small, rounded dark green leaves grow on trailing stems that root at the nodes, creating a dense, spreading mat. It is exceptionally rich in vitamins C and K, iron, and calcium. In the UK, watercress has been foraged and cultivated for centuries and is perfectly suited to our cool, damp climate. While traditionally grown in spring-fed beds, it thrives in ordinary garden soil kept constantly moist, or even in a container sitting in a tray of water.',
      growingInstructions:
        'Sow direct from 2 weeks after the last frost (late May) or start indoors earlier for a head start. Watercress needs constant moisture above all else — choose a partially shaded spot with rich, moisture-retentive soil, or grow in a container placed in a deep saucer of water. Sow seeds thinly on the surface and barely cover with fine compost, keeping continuously moist. Thin to 15cm apart with 20cm between rows. For the best results, grow in a shallow trench lined with plastic and filled with compost, kept permanently damp. Begin harvesting from 8 weeks by cutting the top 10cm of stems — this encourages bushy regrowth. Never let the soil dry out. Watercress is perennial: it will die back in hard winters but regrow from the base in spring.',
      commonProblems: [
        'Bolting in hot, dry conditions',
        'Slugs and snails in damp growing conditions',
        'Aphids on new growth',
        'Powdery mildew in stagnant, humid air',
      ],
      goodCompanions: ['mint', 'chives', 'lettuce', 'rocket'],
      badCompanions: ['tomato', 'potato'],
      benefitsFromGrowLights: false,
      benefitsFromFleece: true,
      growLightsExtendWeeks: 0,
      fleeceExtendWeeks: 3,
      sowDepth: 'Surface sow',
      germinationTemp: '12-18°C',
      waterNeeds: 'high',
      displayColor: '#2E8B57',
    },
  ],
};
