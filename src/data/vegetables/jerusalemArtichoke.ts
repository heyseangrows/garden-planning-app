import type { VegetableGroup } from '@/types';

export const jerusalemArtichokeGroup: VegetableGroup = {
  id: 'jerusalem-artichoke',
  name: 'Jerusalem Artichokes',
  emoji: '🌻',
  description:
    'A tall, sunflower-like perennial grown for its knobbly, sweet-nutty tubers that are among the easiest and most productive crops for the UK garden. Jerusalem artichokes are undemanding, hardy, and produce a massive yield from minimal effort, thriving in almost any soil. Their tall yellow flowers in late summer add ornamental value, while the tubers provide a distinctive, sweet, nutty harvest from autumn through winter that stores beautifully in the ground.',
  varieties: [
    {
      id: 'jerusalem-artichoke-fuseau',
      vegetableGroupId: 'jerusalem-artichoke',
      vegetableName: 'Jerusalem Artichoke',
      name: 'Fuseau',
      category: 'western',
      growingHabit: 'upright',
      isPerennial: true,
      height: 250,
      spread: 60,
      climateSuitability: 5,
      yield: 5,
      tastiness: 3,
      difficulty: 1,
      valueForMoney: 5,
      sunRequirement: 'full-sun',
      spacing: { betweenPlantsCm: 40, betweenRowsCm: 60 },
      daysToMaturity: 130,
      directSowWeeksAfterLastFrost: 2,
      harvestPeriodWeeks: 12,
      yieldDescription:
        'Exceptionally heavy yields — a single tuber multiplies into dozens, providing kilos of crop from a small patch.',
      maxPlantsPerPerson: 3,
      description:
        'Fuseau is a refined selection of the classic Jerusalem artichoke bred for smoother, more elongated tubers that are significantly easier to peel than the traditional knobbly types. The skin is light brown and the flesh is creamy white with a sweet, nutty, earthy flavour that becomes sweeter after frost. It produces tall, sunflower-like stalks reaching 2.5m with cheerful yellow flowers in late summer. Fuseau is highly productive and one of the easiest possible crops for the UK — plant once and harvest for years from the same spot.',
      growingInstructions:
        'Plant tubers direct from 2 weeks after the last frost (late May) in a sunny, well-drained spot. Jerusalem artichokes are vigorous and can become invasive — consider planting in a dedicated bed or sunken container to control spread. Dig a shallow trench 10cm deep and place tubers 40cm apart with 60cm between rows. No watering or feeding is needed once established — they fend for themselves. The tall stems may need staking in exposed gardens. Leave the plants to grow through summer; the yellow flowers in August-September are a bonus. Harvest tubers from late October onwards after the foliage has died back and frost has sweetened them. They store best left in the ground and lifted as needed through winter. Any tubers left behind will regrow the following year, giving a self-renewing crop.',
      commonProblems: [
        'Invasive spread if not contained',
        'Knobbly tubers (less with Fuseau, but still present)',
        'Wind damage to tall stems in exposed sites',
        'Slugs on developing tubers in wet soil',
      ],
      goodCompanions: ['sweetcorn', 'beans', 'brassicas', 'marigold'],
      badCompanions: ['potato', 'tomato', 'fennel'],
      benefitsFromGrowLights: false,
      benefitsFromFleece: false,
      growLightsExtendWeeks: 0,
      fleeceExtendWeeks: 0,
      sowDepth: '10 cm',
      germinationTemp: '7-15°C',
      waterNeeds: 'low',
      displayColor: '#DAA520',
    },
  ],
};
