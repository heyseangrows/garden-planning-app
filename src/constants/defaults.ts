import type { PlotUnit } from '@/types';

export const DEFAULTS = {
  plotWidth: 10,
  plotHeight: 8,
  plotUnit: 'feet' as PlotUnit,
  peopleCount: 3,
  useGrowLights: false,
  useFleece: false,
  categoryFilter: 'all' as const,
  zoom: 40,
} as const;
