import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type {
  VegetablePlacement,
  Plot,
  PlotUnit,
  MonthPlacementData,
  VegetableCategory,
  VegetableSelection,
  SavedPlan,
  VegetableVariety,
} from '@/types';
import { VEGETABLE_COLORS } from '@/constants/theme';
import { DEFAULTS } from '@/constants/defaults';
import { getVarietyById } from '@/data/vegetables';
import { getLondonFrostDates, BASE_YEAR } from '@/data/frostDates';
import { MONTH_NAMES } from '@/data/frostDates';

let nextId = 1;
function generateId(): string {
  return `placement-${Date.now()}-${nextId++}`;
}

function generatePlotId(): string {
  return `plot-${Date.now()}-${nextId++}`;
}

/**
 * Compute which absolute month indices a vegetable should appear in based on its
 * plant-out and harvest dates. 0 = January of BASE_YEAR.
 * Handles overwintered crops that span into the following year (e.g. purple
 * sprouting broccoli planted in May, harvested through March of year+1).
 * When seasonIndex is provided and the variety has a `seasons` array, uses that
 * season's timing data instead of the top-level fields.
 *
 * @param referenceMonthIndex — optional absolute month index that provides year
 *   context. When provided, the frost date year is offset by floor(referenceMonthIndex/12)
 *   so placements in future (or past) years produce month ranges in that year rather
 *   than always being anchored to BASE_YEAR. Defaults to 0 (BASE_YEAR).
 * Returns months 0-11 if no timing data is available.
 */
function computeActiveMonths(
  variety: VegetableVariety | undefined,
  seasonIndex?: number,
  referenceMonthIndex?: number,
): number[] {
  if (!variety) return Array.from({ length: 12 }, (_, i) => i);

  // Resolve timing data: use season-specific if available, otherwise top-level
  let indoorSowWeeks: number | undefined;
  let directSowWeeks: number | undefined;
  let plantOutWeeks: number | undefined;
  let daysToMaturity: number;
  let harvestPeriodWeeks: number | undefined;

  const season = (seasonIndex !== undefined && variety.seasons?.[seasonIndex])
    ? variety.seasons[seasonIndex]
    : null;

  if (season) {
    indoorSowWeeks = season.indoorSowWeeksBeforeLastFrost;
    directSowWeeks = season.directSowWeeksAfterLastFrost;
    // For direct-sown crops (no explicit plant-out), treat direct-sow date as
    // the effective plant-out for month-range calculation purposes.
    plantOutWeeks = season.plantOutWeeksAfterLastFrost ?? season.directSowWeeksAfterLastFrost;
    daysToMaturity = season.daysToMaturity;
    harvestPeriodWeeks = season.harvestPeriodWeeks;
  } else {
    indoorSowWeeks = variety.indoorSowWeeksBeforeLastFrost;
    directSowWeeks = variety.directSowWeeksAfterLastFrost;
    plantOutWeeks = variety.plantOutWeeksAfterLastFrost;
    daysToMaturity = variety.daysToMaturity;
    harvestPeriodWeeks = variety.harvestPeriodWeeks;
  }

  // Offset the frost-date year by the year implied by the reference month,
  // so placements in future/past years anchor to that year's growing season
  // instead of always being pinned to BASE_YEAR.
  const yearOffset = referenceMonthIndex !== undefined
    ? Math.floor(referenceMonthIndex / 12)
    : 0;
  const frostDates = getLondonFrostDates(BASE_YEAR + yearOffset);

  // Calculate plant out date
  let plantOutDate: Date;
  if (plantOutWeeks !== undefined) {
    plantOutDate = new Date(frostDates.lastSpringFrost);
    plantOutDate.setDate(plantOutDate.getDate() + plantOutWeeks * 7);
  } else if (directSowWeeks !== undefined) {
    plantOutDate = new Date(frostDates.lastSpringFrost);
    plantOutDate.setDate(plantOutDate.getDate() + directSowWeeks * 7);
  } else if (indoorSowWeeks !== undefined) {
    // If only indoor sow is set, approximate plant out as indoorSow + 6 weeks
    plantOutDate = new Date(frostDates.lastSpringFrost);
    plantOutDate.setDate(plantOutDate.getDate() + indoorSowWeeks * 7 + 42);
  } else {
    return Array.from({ length: 12 }, (_, i) => i);
  }

  // Calculate harvest end date
  const harvestStart = new Date(plantOutDate);
  harvestStart.setDate(harvestStart.getDate() + daysToMaturity);
  const harvestWeeks = harvestPeriodWeeks ?? 4;
  const harvestEnd = new Date(harvestStart);
  harvestEnd.setDate(harvestEnd.getDate() + harvestWeeks * 7);

  // Iterate month-by-month from plantOut to harvestEnd, producing absolute indices
  const activeMonths: number[] = [];
  const cursor = new Date(plantOutDate.getFullYear(), plantOutDate.getMonth(), 1);
  while (cursor <= harvestEnd) {
    const m = (cursor.getFullYear() - BASE_YEAR) * 12 + cursor.getMonth();
    activeMonths.push(m);
    cursor.setMonth(cursor.getMonth() + 1);
  }
  return activeMonths.length > 0 ? activeMonths : Array.from({ length: 12 }, (_, i) => i);
}

function ensureMonthData(
  monthData: Record<string, Record<number, MonthPlacementData>>,
  plotId: string,
): Record<number, MonthPlacementData> {
  if (!monthData[plotId]) {
    monthData[plotId] = {};
  }
  return monthData[plotId];
}

function getMonthData(
  monthData: Record<string, Record<number, MonthPlacementData>>,
  plotId: string,
  monthIndex: number,
): MonthPlacementData {
  const plotMonths = ensureMonthData(monthData, plotId);
  if (!plotMonths[monthIndex]) {
    plotMonths[monthIndex] = { placements: [], notes: '' };
  }
  return plotMonths[monthIndex];
}

export interface AppStore {
  // Plan
  planName: string;

  // Plots
  plots: Plot[];
  activePlotId: string | null;

  // Monthly data: monthData[plotId][monthIndex] = { placements, notes }
  monthData: Record<string, Record<number, MonthPlacementData>>;

  // View state
  activeMonthIndex: number; // unbounded (0 = Jan year 0, 12 = Jan year 1, -1 = Dec year -1, etc.)
  zoom: number;
  stageX: number;
  stageY: number;

  // Selection
  selectedPlacementIds: string[];

  // Clipboard
  clipboard: VegetablePlacement[];
  pendingPlacementVarietyId: string | null;
  pendingPlacementSeasonIndex: number | null;

  // Settings
  peopleCount: number;
  useGrowLights: boolean;
  useFleece: boolean;
  categoryFilter: 'all' | VegetableCategory;
  customVarieties: VegetableVariety[];

  // Saved plans
  savedPlans: SavedPlan[];

  // Undo / redo (session-only)
  undoStack: string[];
  redoStack: string[];
  undo: () => void;
  redo: () => void;

  // UI state (non-persisted / transient — not in partialize)
  showPlotSetup: boolean;
  showVegetableBrowser: boolean;

  // Placement mode — place in current month only, or across the full growing season
  multiMonthPlacement: boolean;

  // ── Plot actions ──
  addPlot: (name: string, width: number, height: number, unit?: PlotUnit) => void;
  updatePlot: (id: string, updates: Partial<Plot>) => void;
  removePlot: (id: string) => void;
  setActivePlot: (id: string | null) => void;

  // ── Monthly placement actions ──
  addPlacement: (plotId: string, monthIndex: number, varietyId: string, x: number, y: number, width: number, height: number) => void;
  updatePlacement: (plotId: string, monthIndex: number, placementId: string, updates: Partial<VegetablePlacement>) => void;
  removePlacements: (plotId: string, monthIndex: number, placementIds: string[]) => void;
  removePlacementFromAllMonths: (plotId: string, placementId: string) => void;
  movePlacements: (plotId: string, monthIndex: number, placementIds: string[], dx: number, dy: number) => void;
  reorderPlacement: (plotId: string, placementId: string, direction: 'toFront' | 'forwards' | 'backwards' | 'toBack') => void;

  // ── Selection ──
  selectPlacement: (id: string | null, multi?: boolean) => void;
  clearSelection: () => void;

  // ── Clipboard ──
  copyPlacements: (plotId: string, monthIndex: number) => void;
  pastePlacements: (plotId: string, monthIndex: number) => void;
  setPendingPlacementVarietyId: (varietyId: string | null) => void;
  setPendingPlacementSeasonIndex: (seasonIndex: number | null) => void;

  // ── Month navigation ──
  setActiveMonth: (index: number) => void;

  // ── Replication ──
  replicatePlacementToAllMonths: (plotId: string, placementId: string) => void;
  replicateAllPlacementsToAllMonths: (plotId: string) => void;

  // ── Notes ──
  setMonthNotes: (plotId: string, monthIndex: number, notes: string) => void;

  // ── Zoom ──
  setZoom: (zoom: number) => void;
  setStagePosition: (x: number, y: number) => void;

  // ── Settings ──
  setPeopleCount: (count: number) => void;
  setUseGrowLights: (value: boolean) => void;
  setUseFleece: (value: boolean) => void;
  setCategoryFilter: (filter: 'all' | VegetableCategory) => void;
  addCustomVariety: (vegetableName: string, name: string, opts?: { climate?: number; yield?: number; taste?: number; ease?: number; value?: number; maxPlants?: number; plantOutMonth?: number; harvestMonths?: number }) => void;
  updateCustomVariety: (id: string, updates: { vegetableName?: string; name?: string; climate?: number; yield?: number; taste?: number; ease?: number; value?: number; maxPlants?: number; plantOutMonth?: number; harvestMonths?: number }) => void;
  removeCustomVariety: (id: string) => void;

  // ── Saved plans ──
  saveCurrentPlan: (name: string) => void;
  loadPlan: (planId: string) => void;
  deleteSavedPlan: (planId: string) => void;
  loadSavedPlans: () => void;

  // ── New plan ──
  startNewPlan: () => void;

  // ── Helpers ──
  getActiveMonthPlacements: () => VegetablePlacement[];
  getActiveMonthNotes: () => string;

  // ── UI toggles ──
  togglePlotSetup: () => void;
  toggleVegetableBrowser: () => void;
  toggleMultiMonthPlacement: () => void;
}

export const useStore = create<AppStore>()(
  persist(
    immer((set, get) => {
      // ── helpers ──
      const getPlotMonths = (plotId: string): Record<number, MonthPlacementData> => {
        const state = get();
        return ensureMonthData(state.monthData as Record<string, Record<number, MonthPlacementData>>, plotId);
      };

      const getPlotMonthData = (plotId: string, monthIndex: number): MonthPlacementData => {
        const state = get();
        return getMonthData(state.monthData as Record<string, Record<number, MonthPlacementData>>, plotId, monthIndex);
      };

      /** Snapshot the mutable state for undo. Call BEFORE a mutation. */
      const pushUndo = () => {
        const s = get();
        const snap = JSON.stringify({
          plots: s.plots,
          monthData: s.monthData,
          activePlotId: s.activePlotId,
          planName: s.planName,
        });
        set((draft) => {
          draft.undoStack.push(snap);
          if (draft.undoStack.length > 80) draft.undoStack.shift();
          draft.redoStack = [];
        });
      };

      return {
        // ── Plan ──
        planName: '',

        // ── Plots ──
        plots: [],
        activePlotId: null,

        // ── Monthly data ──
        monthData: {},

        // ── View state ──
        activeMonthIndex: 5, // June (month index 5)
        zoom: 40,
        stageX: 0,
        stageY: 0,

        // ── Selection ──
        selectedPlacementIds: [],
        clipboard: [],
        pendingPlacementVarietyId: null,
        pendingPlacementSeasonIndex: null,

        // ── Settings ──
        peopleCount: DEFAULTS.peopleCount,
        useGrowLights: DEFAULTS.useGrowLights,
        useFleece: DEFAULTS.useFleece,
        categoryFilter: DEFAULTS.categoryFilter as 'all' | VegetableCategory,
        customVarieties: [],

        // ── Saved plans ──
        savedPlans: [],

        // ── Undo / redo (session-only) ──
        undoStack: [],
        redoStack: [],

        // ── UI state (transient) ──
        showPlotSetup: false,
        showVegetableBrowser: false,
        multiMonthPlacement: false,

        // ═══════════════════════════════════════════
        // Plot actions
        // ═══════════════════════════════════════════

        addPlot: (name, width, height, unit = 'feet') => {
          set((s) => {
            const plot: Plot = {
              id: generatePlotId(),
              name,
              width,
              height,
              unit,
            };
            s.plots.push(plot);
            if (!s.activePlotId) {
              s.activePlotId = plot.id;
            }
            // Initialize month data for this plot
            if (!s.monthData[plot.id]) {
              s.monthData[plot.id] = {};
              for (let m = 0; m < 12; m++) {
                s.monthData[plot.id][m] = { placements: [], notes: '' };
              }
            }
          });
        },

        updatePlot: (id, updates) => {
          set((s) => {
            const plot = s.plots.find((p) => p.id === id);
            if (plot) Object.assign(plot, updates);
          });
        },

        removePlot: (id) => {
          set((s) => {
            s.plots = s.plots.filter((p) => p.id !== id);
            delete s.monthData[id];
            if (s.activePlotId === id) {
              s.activePlotId = s.plots.length > 0 ? s.plots[0].id : null;
            }
          });
        },

        setActivePlot: (id) => {
          set((s) => { s.activePlotId = id; s.selectedPlacementIds = []; });
        },

        // ═══════════════════════════════════════════
        // Monthly placement actions
        // ═══════════════════════════════════════════

        addPlacement: (plotId, monthIndex, varietyId, x, y, width, height) => {
          pushUndo();
          const state = get();
          const placement: VegetablePlacement = {
            id: generateId(),
            varietyId,
            x,
            y,
            width: Math.max(0.3, width),
            height: Math.max(0.3, height),
            seasonIndex: state.pendingPlacementSeasonIndex ?? undefined,
          };
          set((s) => {
            const plotMonths = ensureMonthData(s.monthData, plotId);
            if (!plotMonths[monthIndex]) {
              plotMonths[monthIndex] = { placements: [], notes: '' };
            }
            plotMonths[monthIndex].placements.push(placement);
            s.selectedPlacementIds = [placement.id];
            s.pendingPlacementVarietyId = null;
            s.pendingPlacementSeasonIndex = null;
          });
        },

        updatePlacement: (plotId, _monthIndex, placementId, updates) => {
          pushUndo();
          set((s) => {
            const plotMonths = ensureMonthData(s.monthData, plotId);
            // Apply position/size changes to this placement across ALL months
            for (const m of Object.keys(plotMonths)) {
              const md = plotMonths[Number(m)];
              if (!md) continue;
              const placement = md.placements.find((p) => p.id === placementId);
              if (placement) Object.assign(placement, updates);
            }
          });
        },

        removePlacements: (plotId, monthIndex, placementIds) => {
          pushUndo();
          const idSet = new Set(placementIds);
          set((s) => {
            const plotMonths = ensureMonthData(s.monthData, plotId);
            const md = plotMonths[monthIndex];
            if (!md) return;
            md.placements = md.placements.filter((p) => !idSet.has(p.id));
            s.selectedPlacementIds = s.selectedPlacementIds.filter((sid) => !idSet.has(sid));
          });
        },

        removePlacementFromAllMonths: (plotId, placementId) => {
          pushUndo();
          set((s) => {
            const plotMonths = s.monthData[plotId];
            if (!plotMonths) return;
            for (const m of Object.keys(plotMonths)) {
              const md = plotMonths[Number(m)];
              if (!md) continue;
              md.placements = md.placements.filter((p) => p.id !== placementId);
            }
            s.selectedPlacementIds = s.selectedPlacementIds.filter((sid) => sid !== placementId);
          });
        },

        movePlacements: (plotId, _monthIndex, placementIds, dx, dy) => {
          pushUndo();
          const idSet = new Set(placementIds);
          set((s) => {
            const plot = s.plots.find((p) => p.id === plotId);
            if (!plot) return;
            const plotMonths = ensureMonthData(s.monthData, plotId);
            // Apply move to these placements across ALL months
            for (const m of Object.keys(plotMonths)) {
              const md = plotMonths[Number(m)];
              if (!md) continue;
              for (const p of md.placements) {
                if (idSet.has(p.id)) {
                  p.x = Math.max(0, Math.min(plot.width - p.width, p.x + dx));
                  p.y = Math.max(0, Math.min(plot.height - p.height, p.y + dy));
                }
              }
            }
          });
        },

        reorderPlacement: (plotId, placementId, direction) => {
          pushUndo();
          set((s) => {
            const plotMonths = ensureMonthData(s.monthData, plotId);
            for (const monthKey of Object.keys(plotMonths)) {
              const md = plotMonths[Number(monthKey)];
              if (!md) continue;
              const index = md.placements.findIndex((p) => p.id === placementId);
              if (index === -1) continue;

              switch (direction) {
                case 'toFront': {
                  const last = md.placements.length - 1;
                  if (index === last) break;
                  const [item] = md.placements.splice(index, 1);
                  md.placements.push(item);
                  break;
                }
                case 'forwards': {
                  const last = md.placements.length - 1;
                  if (index >= last) break;
                  const [item] = md.placements.splice(index, 1);
                  md.placements.splice(index + 1, 0, item);
                  break;
                }
                case 'backwards': {
                  if (index <= 0) break;
                  const [item] = md.placements.splice(index, 1);
                  md.placements.splice(index - 1, 0, item);
                  break;
                }
                case 'toBack': {
                  if (index === 0) break;
                  const [item] = md.placements.splice(index, 1);
                  md.placements.unshift(item);
                  break;
                }
              }
            }
          });
        },

        // ═══════════════════════════════════════════
        // Selection
        // ═══════════════════════════════════════════

        selectPlacement: (id, multi = false) => {
          set((s) => {
            if (id === null) {
              s.selectedPlacementIds = [];
            } else if (multi) {
              const idx = s.selectedPlacementIds.indexOf(id);
              if (idx >= 0) {
                s.selectedPlacementIds.splice(idx, 1);
              } else {
                s.selectedPlacementIds.push(id);
              }
            } else if (s.selectedPlacementIds.length === 1 && s.selectedPlacementIds[0] === id) {
              s.selectedPlacementIds = [];
            } else {
              s.selectedPlacementIds = [id];
            }
          });
        },

        clearSelection: () => {
          set((s) => { s.selectedPlacementIds = []; });
        },

        // ═══════════════════════════════════════════
        // Clipboard
        // ═══════════════════════════════════════════

        copyPlacements: (plotId, monthIndex) => {
          const state = get();
          const md = getPlotMonthData(plotId, monthIndex);
          const selectedIds = new Set(state.selectedPlacementIds);
          const toCopy = md.placements.filter((p) => selectedIds.has(p.id));
          if (toCopy.length === 0 && state.selectedPlacementIds.length === 1) {
            // If one is selected but not found, copy it anyway
            const single = md.placements.find((p) => p.id === state.selectedPlacementIds[0]);
            if (single) toCopy.push(single);
          }
          set((s) => {
            s.clipboard = JSON.parse(JSON.stringify(toCopy));
          });
        },

        pastePlacements: (plotId, monthIndex) => {
          pushUndo();
          const state = get();
          if (state.clipboard.length === 0) return;
          const plot = state.plots.find((p) => p.id === plotId);
          if (!plot) return;

          const newIds: string[] = [];
          set((s) => {
            const plotMonths = ensureMonthData(s.monthData, plotId);
            if (!plotMonths[monthIndex]) {
              plotMonths[monthIndex] = { placements: [], notes: '' };
            }
            for (const item of state.clipboard) {
              const newId = generateId();
              const newPlacement: VegetablePlacement = {
                id: newId,
                varietyId: item.varietyId,
                x: Math.min(Math.max(0, item.x), plot.width - Math.max(0.3, item.width)),
                y: Math.min(Math.max(0, item.y), plot.height - Math.max(0.3, item.height)),
                width: item.width,
                height: item.height,
                seasonIndex: item.seasonIndex,
              };
              plotMonths[monthIndex].placements.push(newPlacement);
              newIds.push(newId);
            }
            s.selectedPlacementIds = newIds;
          });
        },

        setPendingPlacementVarietyId: (varietyId) => {
          set((s) => { s.pendingPlacementVarietyId = varietyId; });
        },

        setPendingPlacementSeasonIndex: (seasonIndex) => {
          set((s) => { s.pendingPlacementSeasonIndex = seasonIndex; });
        },

        // ═══════════════════════════════════════════
        // Month navigation
        // ═══════════════════════════════════════════

        setActiveMonth: (index) => {
          set((s) => { s.activeMonthIndex = index; });
        },

        replicatePlacementToAllMonths: (plotId, placementId) => {
          pushUndo();
          const state = get();
          const plotMonths = state.monthData[plotId];
          if (!plotMonths) return;

          // Find the placement in any month, capturing the month index so we
          // can anchor timing to the correct year (not always BASE_YEAR).
          let sourcePlacement: VegetablePlacement | null = null;
          let sourceMonthIndex: number | null = null;
          for (const mKey of Object.keys(plotMonths)) {
            const md = plotMonths[Number(mKey)];
            if (!md) continue;
            const found = md.placements.find((p) => p.id === placementId);
            if (found) {
              sourcePlacement = found;
              sourceMonthIndex = Number(mKey);
              break;
            }
          }
          if (!sourcePlacement) return;

          const variety = getVarietyById(sourcePlacement.varietyId)
            ?? state.customVarieties.find((v) => v.id === sourcePlacement.varietyId);

          // Use the placement's seasonIndex and source month for timing.
          // The source month determines which year's growing season to anchor to.
          const allowedMonths = computeActiveMonths(
            variety,
            sourcePlacement.seasonIndex,
            sourceMonthIndex ?? undefined,
          );
          const copy = JSON.parse(JSON.stringify(sourcePlacement)) as VegetablePlacement;

          set((s) => {
            const pm = ensureMonthData(s.monthData, plotId);
            for (const m of allowedMonths) {
              if (!pm[m]) pm[m] = { placements: [], notes: '' };
              if (!pm[m].placements.some((p) => p.id === placementId)) {
                pm[m].placements.push(JSON.parse(JSON.stringify(copy)));
              }
            }
          });
        },

        replicateAllPlacementsToAllMonths: (plotId) => {
          pushUndo();
          const state = get();
          const plotMonths = state.monthData[plotId];
          if (!plotMonths) return;

          const currentMonth = state.activeMonthIndex;
          const sourcePlacements = plotMonths[currentMonth]?.placements ?? [];
          if (sourcePlacements.length === 0) return;

          // Compute allowed months per placement, using each placement's seasonIndex
          const perPlacement: { copy: VegetablePlacement; months: number[] }[] = [];
          for (const p of sourcePlacements) {
            const variety = getVarietyById(p.varietyId)
              ?? state.customVarieties.find((v) => v.id === p.varietyId);
            // Anchor timing to the current month's year so placements
            // replicate into the correct growing season, not always BASE_YEAR.
            const allowedMonths = computeActiveMonths(variety, p.seasonIndex, currentMonth);
            perPlacement.push({
              copy: JSON.parse(JSON.stringify(p)) as VegetablePlacement,
              months: allowedMonths,
            });
          }

          set((s) => {
            const pm = ensureMonthData(s.monthData, plotId);
            for (const { copy, months } of perPlacement) {
              for (const m of months) {
                if (m === currentMonth) continue; // skip source month
                if (!pm[m]) pm[m] = { placements: [], notes: '' };
                if (!pm[m].placements.some((p) => p.id === copy.id)) {
                  pm[m].placements.push(JSON.parse(JSON.stringify(copy)));
                }
              }
            }
          });
        },

        // ═══════════════════════════════════════════
        // Notes
        // ═══════════════════════════════════════════

        setMonthNotes: (plotId, monthIndex, notes) => {
          set((s) => {
            const plotMonths = ensureMonthData(s.monthData, plotId);
            if (!plotMonths[monthIndex]) {
              plotMonths[monthIndex] = { placements: [], notes: '' };
            }
            plotMonths[monthIndex].notes = notes;
          });
        },

        // ═══════════════════════════════════════════
        // Zoom
        // ═══════════════════════════════════════════

        setZoom: (zoom) => {
          set((s) => {
            s.zoom = Math.max(5, Math.min(200, zoom));
          });
        },

        setStagePosition: (x, y) => {
          set((s) => {
            s.stageX = x;
            s.stageY = y;
          });
        },


	        undo: () => {
	          const s = get();
	          if (s.undoStack.length === 0) return;
	          const curSnap = JSON.stringify({
	            plots: s.plots,
	            monthData: s.monthData,
	            activePlotId: s.activePlotId,
	            planName: s.planName,
	          });
	          const prev = s.undoStack[s.undoStack.length - 1];
	          const restored = JSON.parse(prev);
	          set((draft) => {
	            draft.plots = restored.plots;
	            draft.monthData = restored.monthData;
	            draft.activePlotId = restored.activePlotId;
	            draft.planName = restored.planName;
	            draft.undoStack.pop();
	            draft.redoStack.push(curSnap);
	            draft.selectedPlacementIds = [];
	          });
	        },

	        redo: () => {
	          const s = get();
	          if (s.redoStack.length === 0) return;
	          const curSnap = JSON.stringify({
	            plots: s.plots,
	            monthData: s.monthData,
	            activePlotId: s.activePlotId,
	            planName: s.planName,
	          });
	          const next = s.redoStack[s.redoStack.length - 1];
	          const restored = JSON.parse(next);
	          set((draft) => {
	            draft.plots = restored.plots;
	            draft.monthData = restored.monthData;
	            draft.activePlotId = restored.activePlotId;
	            draft.planName = restored.planName;
	            draft.redoStack.pop();
	            draft.undoStack.push(curSnap);
	            draft.selectedPlacementIds = [];
	          });
	        },        // ═══════════════════════════════════════════
        // Settings
        // ═══════════════════════════════════════════

        setPeopleCount: (count) => {
          set((s) => { s.peopleCount = Math.max(1, count); });
        },
        setUseGrowLights: (value) => {
          set((s) => { s.useGrowLights = value; });
        },
        setUseFleece: (value) => {
          set((s) => { s.useFleece = value; });
        },
        setCategoryFilter: (filter) => {
          set((s) => { s.categoryFilter = filter; });
        },

        addCustomVariety: (vegetableName, name, opts = {}) => {
          set((s) => {
            const id = `custom-${Date.now()}`;
            const colorIndex = s.customVarieties.length % VEGETABLE_COLORS.length;
            const climate = opts.climate ?? 0;
            const yld = opts.yield ?? 0;
            const taste = opts.taste ?? 0;
            const ease = opts.ease ?? 0;
            const value = opts.value ?? 0;
            const maxPlants = opts.maxPlants ?? 0;
            const plantOutMonth = opts.plantOutMonth; // 1-12
            const harvestMonths = opts.harvestMonths ?? 4;

            // Compute approximate timing from month inputs
            const frostDates = getLondonFrostDates();
            let plantOutWeeks: number | undefined;
            let daysToMaturity: number = 60;
            let harvestWeeks: number = harvestMonths * 4;
            if (plantOutMonth !== undefined && plantOutMonth >= 1 && plantOutMonth <= 12) {
              // Calculate weeks from last frost to the given plant-out month
              const plantOutDate = new Date(frostDates.lastSpringFrost.getFullYear(), plantOutMonth - 1, 15);
              const diffDays = Math.round((plantOutDate.getTime() - frostDates.lastSpringFrost.getTime()) / (1000 * 60 * 60 * 24));
              plantOutWeeks = Math.max(0, Math.round(diffDays / 7));
            }

            const variety: VegetableVariety = {
              id,
              vegetableGroupId: 'custom',
              vegetableName,
              name,
              category: 'western',
              growingHabit: 'bush',
              isPerennial: false,
              height: 0,
              spread: 0,
              climateSuitability: climate,
              yield: yld,
              tastiness: taste,
              difficulty: ease,
              valueForMoney: value,
              sunRequirement: 'full-sun',
              spacing: { betweenPlantsCm: 30, betweenRowsCm: 40 },
              daysToMaturity,
              plantOutWeeksAfterLastFrost: plantOutWeeks,
              harvestPeriodWeeks: harvestWeeks,
              yieldDescription: '',
              maxPlantsPerPerson: maxPlants,
              description: 'A custom crop added by you.',
              growingInstructions: 'Custom crop — adjust timing, spacing, and care based on your own knowledge.',
              benefitsFromGrowLights: false,
              benefitsFromFleece: false,
              growLightsExtendWeeks: 0,
              fleeceExtendWeeks: 0,
              waterNeeds: 'medium',
              displayColor: VEGETABLE_COLORS[colorIndex],
            };
            s.customVarieties.push(variety);
          });
        },

        updateCustomVariety: (id, updates) => {
          set((s) => {
            const v = s.customVarieties.find((x) => x.id === id);
            if (!v) return;
            if (updates.vegetableName !== undefined) v.vegetableName = updates.vegetableName;
            if (updates.name !== undefined) v.name = updates.name;
            if (updates.climate !== undefined) v.climateSuitability = updates.climate;
            if (updates.yield !== undefined) v.yield = updates.yield;
            if (updates.taste !== undefined) v.tastiness = updates.taste;
            if (updates.ease !== undefined) v.difficulty = updates.ease;
            if (updates.value !== undefined) v.valueForMoney = updates.value;
            if (updates.maxPlants !== undefined) v.maxPlantsPerPerson = updates.maxPlants;
            // Recompute timing from plantOutMonth / harvestMonths
            if (updates.plantOutMonth !== undefined || updates.harvestMonths !== undefined) {
              const pm = updates.plantOutMonth ?? undefined;
              const hm = updates.harvestMonths ?? 4;
              if (pm !== undefined && pm >= 1 && pm <= 12) {
                const frostDates = getLondonFrostDates();
                const plantOutDate = new Date(frostDates.lastSpringFrost.getFullYear(), pm - 1, 15);
                const diffDays = Math.round((plantOutDate.getTime() - frostDates.lastSpringFrost.getTime()) / (1000 * 60 * 60 * 24));
                v.plantOutWeeksAfterLastFrost = Math.max(0, Math.round(diffDays / 7));
              }
              v.harvestPeriodWeeks = hm * 4;
            }
          });
        },

        removeCustomVariety: (id) => {
          set((s) => {
            s.customVarieties = s.customVarieties.filter((v) => v.id !== id);
            // Clean up placements across all month data
            for (const plotId of Object.keys(s.monthData)) {
              const plotMonths = s.monthData[plotId];
              if (!plotMonths) continue;
              for (const mIdx of Object.keys(plotMonths)) {
                const md = plotMonths[Number(mIdx)];
                if (md) {
                  md.placements = md.placements.filter((p) => p.varietyId !== id);
                }
              }
            }
          });
        },

        // ═══════════════════════════════════════════
        // Saved plans
        // ═══════════════════════════════════════════

        loadSavedPlans: () => {
          try {
            const raw = localStorage.getItem('garden-planner-saved-plans');
            if (raw) {
              const plans = JSON.parse(raw) as SavedPlan[];
              set((s) => { s.savedPlans = plans; });
            }
          } catch { /* ignore */ }
        },

        saveCurrentPlan: (name) => {
          const state = get();
          const now = new Date().toISOString();
          const plan: SavedPlan = {
            id: `plan-${Date.now()}`,
            name,
            planName: state.planName || name,
            createdAt: now,
            updatedAt: now,
            plots: JSON.parse(JSON.stringify(state.plots)),
            monthData: JSON.parse(JSON.stringify(state.monthData)),
            peopleCount: state.peopleCount,
            useGrowLights: state.useGrowLights,
            useFleece: state.useFleece,
            categoryFilter: state.categoryFilter,
          };
          set((s) => {
            s.savedPlans.push(plan);
          });
          const plans = [...get().savedPlans];
          localStorage.setItem('garden-planner-saved-plans', JSON.stringify(plans));
        },

        loadPlan: (planId) => {
          const plan = get().savedPlans.find((p) => p.id === planId);
          if (!plan) return;
          set((s) => {
            s.planName = plan.planName || plan.name;
            s.plots = plan.plots ? JSON.parse(JSON.stringify(plan.plots)) : [];
            s.monthData = plan.monthData ? JSON.parse(JSON.stringify(plan.monthData)) : {};
            s.activePlotId = s.plots.length > 0 ? s.plots[0].id : null;
            s.peopleCount = plan.peopleCount ?? DEFAULTS.peopleCount;
            s.useGrowLights = plan.useGrowLights ?? DEFAULTS.useGrowLights;
            s.useFleece = plan.useFleece ?? DEFAULTS.useFleece;
            s.categoryFilter = (plan.categoryFilter ?? DEFAULTS.categoryFilter) as 'all' | VegetableCategory;
            s.selectedPlacementIds = [];
            s.pendingPlacementVarietyId = null;
            s.activeMonthIndex = new Date().getMonth();
          });
        },

        deleteSavedPlan: (planId) => {
          set((s) => {
            s.savedPlans = s.savedPlans.filter((p) => p.id !== planId);
          });
          localStorage.setItem('garden-planner-saved-plans', JSON.stringify(get().savedPlans));
        },

        // ═══════════════════════════════════════════
        // New plan
        // ═══════════════════════════════════════════

        startNewPlan: () => {
          set((s) => {
            s.plots = [];
            s.monthData = {};
            s.activePlotId = null;
            s.selectedPlacementIds = [];
            s.clipboard = [];
            s.pendingPlacementVarietyId = null;
            s.activeMonthIndex = 5; // June
            s.planName = '';
          });
        },

        // ═══════════════════════════════════════════
        // Helpers
        // ═══════════════════════════════════════════

        getActiveMonthPlacements: () => {
          const state = get();
          if (!state.activePlotId) return [];
          const md = getPlotMonthData(state.activePlotId, state.activeMonthIndex);
          return md.placements;
        },

        getActiveMonthNotes: () => {
          const state = get();
          if (!state.activePlotId) return '';
          const md = getPlotMonthData(state.activePlotId, state.activeMonthIndex);
          return md.notes;
        },

        // ═══════════════════════════════════════════
        // UI toggles
        // ═══════════════════════════════════════════

        togglePlotSetup: () => {
          set((s) => {
            s.showPlotSetup = !s.showPlotSetup;
            if (s.showPlotSetup) s.showVegetableBrowser = false;
          });
        },

        toggleVegetableBrowser: () => {
          set((s) => {
            s.showVegetableBrowser = !s.showVegetableBrowser;
            if (s.showVegetableBrowser) s.showPlotSetup = false;
          });
        },

        toggleMultiMonthPlacement: () => {
          set((s) => {
            s.multiMonthPlacement = !s.multiMonthPlacement;
          });
        },
      };
    }),
    {
      name: 'garden-planner-storage-v5',
      version: 5,
      migrate: (persistedState: any, _version: number) => {
        // Migration from v4 to v5 — fresh start with new data model
        // Old state had: plotWidth, plotHeight, plotUnit, placements[], canvasMode, etc.
        // Convert to: plots[], monthData{}, planName
        const old = persistedState as any;

        // If already v5 shape, return as-is
        if (old.plots !== undefined && old.monthData !== undefined) {
          return old;
        }

        // Migrate old single-plot data
        const defaultPlotId = 'plot-legacy-1';
        const migratedPlots: Plot[] = [];
        const migratedMonthData: Record<string, Record<number, MonthPlacementData>> = {};

        if (old.plotWidth && old.plotHeight) {
          const plot: Plot = {
            id: defaultPlotId,
            name: 'My Plot',
            width: old.plotWidth ?? DEFAULTS.plotWidth,
            height: old.plotHeight ?? DEFAULTS.plotHeight,
            unit: old.plotUnit ?? DEFAULTS.plotUnit,
          };
          migratedPlots.push(plot);

          // Convert old placements to current month
          const currentMonth = new Date().getMonth();
          migratedMonthData[defaultPlotId] = {};
          for (let m = 0; m < 12; m++) {
            migratedMonthData[defaultPlotId][m] = {
              placements: m === currentMonth && old.placements ? old.placements : [],
              notes: '',
            };
          }
        }

        return {
          planName: '',
          plots: migratedPlots,
          monthData: migratedMonthData,
          activePlotId: migratedPlots.length > 0 ? defaultPlotId : null,
          activeMonthIndex: new Date().getMonth(),
          zoom: 40,
          stageX: 0,
          stageY: 0,
          selectedPlacementIds: [],
          clipboard: [],
          pendingPlacementVarietyId: null,
          peopleCount: old.peopleCount ?? DEFAULTS.peopleCount,
          useGrowLights: old.useGrowLights ?? DEFAULTS.useGrowLights,
          useFleece: old.useFleece ?? DEFAULTS.useFleece,
          categoryFilter: old.categoryFilter ?? DEFAULTS.categoryFilter,
          customVarieties: old.customVarieties ?? [],
          savedPlans: [],
          showPlotSetup: false,
          showVegetableBrowser: false,
        };
      },
      partialize: (state) => ({
        planName: state.planName,
        plots: state.plots,
        monthData: state.monthData,
        activePlotId: state.activePlotId,
        activeMonthIndex: state.activeMonthIndex,
        zoom: state.zoom,
        stageX: state.stageX,
        stageY: state.stageY,
        peopleCount: state.peopleCount,
        useGrowLights: state.useGrowLights,
        useFleece: state.useFleece,
        categoryFilter: state.categoryFilter,
        customVarieties: state.customVarieties,
        multiMonthPlacement: state.multiMonthPlacement,
      }),
    }
  )
);
