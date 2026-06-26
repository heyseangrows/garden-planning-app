import type { VegetableGroup } from '@/types';

export const celeriacGroup: VegetableGroup = {
  id: 'celeriac',
  name: 'Celeriac',
  emoji: '🤍',
  description:
    'A hardy, knobbly-rooted vegetable grown for its swollen stem base rather than the root itself, producing a dense, creamy-white flesh with a distinctive celery-parsley flavour. Celeriac thrives in the cool, moist conditions of the UK and is one of the easiest winter storage vegetables to grow. It requires a long season but rewards the gardener with an excellent crop that stores for months and provides fresh flavour through the coldest months.',
  varieties: [
    {
      id: 'celeriac-monarch',
      vegetableGroupId: 'celeriac',
      vegetableName: 'Celeriac',
      name: 'Monarch',
      category: 'western',
      growingHabit: 'upright',
      isPerennial: false,
      height: 40,
      spread: 35,
      climateSuitability: 5,
      yield: 4,
      tastiness: 4,
      difficulty: 3,
      valueForMoney: 5,
      sunRequirement: 'full-sun',
      spacing: { betweenPlantsCm: 30, betweenRowsCm: 40 },
      daysToMaturity: 120,
      indoorSowWeeksBeforeLastFrost: 8,
      plantOutWeeksAfterLastFrost: 2,
      harvestPeriodWeeks: 8,
      yieldDescription:
        'Good yields of smooth, uniform roots from compact plants — expect 5-8 well-formed bulbs per square metre.',
      maxPlantsPerPerson: 3,
      description:
        'Monarch is the UK\'s most popular celeriac variety and an RHS Award of Garden Merit winner, prized for its exceptionally smooth-skinned, almost clean bulbs that require minimal peeling. The flesh is dense, creamy white, and packed with a refined celery flavour with hints of parsley and nuttiness. It is one of the smoothest and easiest-to-prepare celeriac varieties available, producing uniformly round bulbs that reach 10-15cm in diameter. Monarch is particularly well-suited to the UK climate, reliably producing good crops even in cool, wet summers.',
      growingInstructions:
        'Sow indoors 8 weeks before the last frost (early March) in a propagator at 15-20°C. Celeriac seeds are tiny and slow to germinate — surface-sow without covering, as they need light to germinate. Prick out into module trays or small pots once large enough to handle. Plant out 2 weeks after the last frost (late May) in rich, moisture-retentive soil in full sun. Space 30cm apart with 40cm between rows. Water consistently — celeriac is very sensitive to drought, which causes small, woody bulbs. Remove lower leaves as the bulb swells and earth up around the bulb to keep it covered, preventing greening and bitterness.Mulch heavily to retain moisture. Harvest from late September through winter as needed — celeriac is hardy and can be left in the ground until hard frosts threaten, then lifted and stored in damp sand in a cool shed.',
      commonProblems: [
        'Small or misshapen bulbs from inconsistent watering',
        'Split bulbs from sudden growth after rain',
        'Celery leaf miner tunnelling in leaves',
        'Bolting if exposed to cold spell after planting out',
        'Fungal leaf spots in damp conditions',
      ],
      goodCompanions: ['onion', 'leek', 'brassicas', 'beans', 'tomato'],
      badCompanions: ['celery', 'parsnip', 'carrot', 'fennel'],
      benefitsFromGrowLights: true,
      benefitsFromFleece: false,
      growLightsExtendWeeks: 3,
      fleeceExtendWeeks: 0,
      sowDepth: 'Surface sow',
      germinationTemp: '15-20°C',
      waterNeeds: 'high',
      displayColor: '#E8DCC8',
    },
  ],
};
