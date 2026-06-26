export type VegetableCategory = 'western' | 'asian';
export type SunRequirement = 'full-sun' | 'partial-shade' | 'shade-tolerant';
export type GrowingHabit = 'bush' | 'climbing' | 'sprawling' | 'upright' | 'rosette';
export type WaterNeeds = 'low' | 'medium' | 'high';

/** Represents one complete growing season (sow → plant out → harvest) for a vegetable variety. */
export interface GrowingSeason {
  /** Human-readable name, e.g. "Autumn sown (overwintered)", "Spring sown", "Early spring" */
  name: string;
  indoorSowWeeksBeforeLastFrost?: number;
  directSowWeeksAfterLastFrost?: number;
  plantOutWeeksAfterLastFrost?: number;
  daysToMaturity: number;
  harvestPeriodWeeks?: number;
  /** True if this season spans the winter into the next year */
  isOverwintering?: boolean;
}

export interface VegetableVariety {
  id: string;
  vegetableGroupId: string;
  vegetableName: string;
  name: string;
  category: VegetableCategory;

  growingHabit: GrowingHabit;
  isPerennial: boolean;
  height: number;       // average height in cm
  spread: number;       // average spread in cm

  // Ratings 1-5
  climateSuitability: number;
  yield: number;
  tastiness: number;
  difficulty: number;
  valueForMoney: number;

  sunRequirement: SunRequirement;

  spacing: {
    betweenPlantsCm: number;
    betweenRowsCm: number;
  };

  // Timing relative to last frost
  daysToMaturity: number;
  indoorSowWeeksBeforeLastFrost?: number;
  directSowWeeksAfterLastFrost?: number;
  plantOutWeeksAfterLastFrost?: number;
  harvestPeriodWeeks?: number;

  yieldDescription: string;
  maxPlantsPerPerson: number;

  description: string;
  growingInstructions: string;
  commonProblems?: string[];
  goodCompanions?: string[];
  badCompanions?: string[];

  benefitsFromGrowLights: boolean;
  benefitsFromFleece: boolean;
  growLightsExtendWeeks: number;
  fleeceExtendWeeks: number;

  sowDepth?: string;
  germinationTemp?: string;
  waterNeeds: WaterNeeds;

  displayColor: string;

  /** Multiple growing seasons (e.g. autumn-sown vs spring-sown).
   * When present, the top-level timing fields serve as the default season.
   * When absent, the variety has a single growing season. */
  seasons?: GrowingSeason[];

  /** Optional labels for filtering and display (e.g. 'clubroot-host', 'nitrogen-fixer'). */
  tags?: string[];
}

export interface VegetableGroup {
  id: string;
  name: string;
  emoji: string;
  description: string;
  varieties: VegetableVariety[];

  /** Optional labels for the group as a whole (e.g. 'clubroot-host'). */
  tags?: string[];
}

export interface VegetableFilters {
  category: 'all' | 'western' | 'asian';
  search: string;
  sunRequirement?: SunRequirement;
  difficultyMax?: number;
  onlySelected?: boolean;
}
