export interface VegetablePlacement {
  id: string;
  varietyId: string;
  x: number;
  y: number;
  width: number;
  height: number;
  /** Index into the variety's GrowingSeason[], if multiple seasons exist */
  seasonIndex?: number;
}

export type PlotUnit = 'feet' | 'metres';

export interface Plot {
  id: string;
  name: string;
  width: number;
  height: number;
  unit: PlotUnit;
}

export interface MonthPlacementData {
  placements: VegetablePlacement[];
  notes: string;
}

export interface SavedPlan {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  planName: string;
  plots: Plot[];
  monthData: Record<string, Record<number, MonthPlacementData>>;
  peopleCount: number;
  useGrowLights: boolean;
  useFleece: boolean;
  categoryFilter: string;
}
