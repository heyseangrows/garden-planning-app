import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Stage, Layer, Rect, Line, Text, Group, Transformer } from 'react-konva';
import { useStore } from '@/store';
import { getVarietyById, getGroupById } from '@/data/vegetables';
import { getMutedVegColor } from '@/constants/theme';
import type { Plot, VegetablePlacement } from '@/types';
import { PlacementContextMenu } from './PlacementContextMenu';
import type { ReorderDirection } from './PlacementContextMenu';
import { getVarietyTimeline, formatSunRequirement } from '@/utils/calendar/dateCalculations';
import { isHarvestMonth } from '@/utils/vegetables/monthFilterUtils';

// ── helpers ──

interface GridLine {
  points: number[];
}

function plotGridLines(
  plot: Plot,
  scale: number,
  offsetX: number,
  offsetY: number,
): GridLine[] {
  const lines: GridLine[] = [];
  const spacing = plot.unit === 'metres' ? 0.3 : 1.0;

  // Vertical lines
  const xSteps = Math.ceil(plot.width / spacing);
  for (let i = 0; i <= xSteps; i++) {
    const x = Math.min(i * spacing, plot.width);
    const px = x * scale + offsetX;
    lines.push({
      points: [px, offsetY, px, plot.height * scale + offsetY],
    });
  }

  // Horizontal lines
  const ySteps = Math.ceil(plot.height / spacing);
  for (let i = 0; i <= ySteps; i++) {
    const y = Math.min(i * spacing, plot.height);
    const py = y * scale + offsetY;
    lines.push({
      points: [offsetX, py, plot.width * scale + offsetX, py],
    });
  }

  return lines;
}

function layoutPlots(plots: Plot[]): { plot: Plot; x: number; y: number }[] {
  if (plots.length === 0) return [];
  const gap = 2;
  let currentX = 0;
  return plots.map((plot) => {
    const positioned = { plot, x: currentX, y: 0 };
    currentX += plot.width + gap;
    return positioned;
  });
}

function totalLayoutWidth(plots: Plot[]): number {
  if (plots.length === 0) return 0;
  return plots.reduce((sum, p) => sum + p.width, 0) + (plots.length - 1) * 2;
}

function maxPlotHeight(plots: Plot[]): number {
  if (plots.length === 0) return 0;
  return Math.max(...plots.map((p) => p.height));
}

// ── component ──

export function PlotCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<any>(null);

  const plots = useStore((s) => s.plots);
  const activePlotId = useStore((s) => s.activePlotId);
  const activeMonthIndex = useStore((s) => s.activeMonthIndex);
  const monthData = useStore((s) => s.monthData);
  const customVarieties = useStore((s) => s.customVarieties);
  const selectedPlacementIds = useStore((s) => s.selectedPlacementIds);
  const pendingPlacementVarietyId = useStore((s) => s.pendingPlacementVarietyId);
  const zoom = useStore((s) => s.zoom);
  const stageX = useStore((s) => s.stageX);
  const stageY = useStore((s) => s.stageY);

  const addPlacement = useStore((s) => s.addPlacement);
  const updatePlacement = useStore((s) => s.updatePlacement);
  const removePlacements = useStore((s) => s.removePlacements);
  const movePlacements = useStore((s) => s.movePlacements);
  const selectPlacement = useStore((s) => s.selectPlacement);
  const clearSelection = useStore((s) => s.clearSelection);
  const copyPlacements = useStore((s) => s.copyPlacements);
  const pastePlacements = useStore((s) => s.pastePlacements);
  const reorderPlacement = useStore((s) => s.reorderPlacement);
  const replicatePlacementToAllMonths = useStore((s) => s.replicatePlacementToAllMonths);
  const multiMonthPlacement = useStore((s) => s.multiMonthPlacement);
  const setPendingPlacementVarietyId = useStore((s) => s.setPendingPlacementVarietyId);
  const setZoom = useStore((s) => s.setZoom);
  const setStagePosition = useStore((s) => s.setStagePosition);
  const undo = useStore((s) => s.undo);
  const redo = useStore((s) => s.redo);

  const [containerSize, setContainerSize] = useState({ width: 800, height: 600 });

  // Drawing state (for placing new vegetables)
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawStart, setDrawStart] = useState({ x: 0, y: 0, plotId: '' });
  const [drawCurrent, setDrawCurrent] = useState({ x: 0, y: 0 });

  // Tooltip / hover state
  const [hoveredPlacementId, setHoveredPlacementId] = useState<string | null>(null);
  const hoveredPlacementRef = useRef<{ x: number; y: number; varietyId: string } | null>(null);

  // Context menu state
  const [contextMenu, setContextMenu] = useState<{
    clientX: number;
    clientY: number;
    placementId: string;
  } | null>(null);

  // Pan state
  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef({ x: 0, y: 0, stageX: 0, stageY: 0 });
  // For drag-to-pan on blank space: track potential pan
  const potentialPanRef = useRef(false);
  const mouseDownPos = useRef({ x: 0, y: 0 });

  // Drag state for moving placements
  const transformerRef = useRef<any>(null);

  const dragRef = useRef<{
    startX: number;
    startY: number;
    placementId: string;
    plotId: string;
    isMulti: boolean;
    initialPositions: Map<string, { x: number; y: number }>;
  } | null>(null);

  // Resize observer
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setContainerSize({
        width: Math.max(width, 200),
        height: Math.max(height, 200),
      });
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      if (activeEl?.tagName === 'INPUT' || activeEl?.tagName === 'TEXTAREA') return;

      if ((e.metaKey || e.ctrlKey) && e.key === 'c') {
        // If the user has text selected, let the browser's native copy handle it
        const selection = window.getSelection();
        if (selection && selection.toString().length > 0) return;

        if (activePlotId) {
          e.preventDefault();
          copyPlacements(activePlotId, activeMonthIndex);
        }
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'v') {
        if (activePlotId) {
          e.preventDefault();
          pastePlacements(activePlotId, activeMonthIndex);
        }
      }
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedPlacementIds.length > 0) {
        if (activePlotId) {
          removePlacements(activePlotId, activeMonthIndex, selectedPlacementIds);
        }
      }
      if (e.key === 'Escape') {
        setPendingPlacementVarietyId(null);
        clearSelection();
      }
      // Undo: Cmd+Z
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      // Redo: Cmd+Shift+Z
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && e.shiftKey) {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activePlotId, activeMonthIndex, selectedPlacementIds, copyPlacements, pastePlacements, removePlacements, setPendingPlacementVarietyId, clearSelection, undo, redo]);

  // Update transformer when single placement selected
  useEffect(() => {
    const transformer = transformerRef.current;
    if (!transformer) return;
    const stage = stageRef.current;
    if (!stage) return;

    if (selectedPlacementIds.length === 1) {
      const node = stage.findOne(`#placement-${selectedPlacementIds[0]}`);
      if (node) {
        transformer.nodes([node]);
        transformer.getLayer()?.batchDraw();
        return;
      }
    }
    transformer.nodes([]);
    transformer.getLayer()?.batchDraw();
  }, [selectedPlacementIds, /* re-run when placements change (e.g. pasted) */ monthData, activeMonthIndex]);

  // ── Layout calculations ──

  const positionedPlots = layoutPlots(plots);
  const totalWidth = totalLayoutWidth(plots);
  const totalHeight = maxPlotHeight(plots);

  const scale = zoom;

  const padLeft = 40;
  const padTop = 20;
  const padRight = 20;
  const padBottom = 30;

  const toPixel = (v: number) => v * scale;

  // Handle placement resize via transformer
  const handleTransformEnd = useCallback((placementId: string, plotId: string, e: any) => {
    const node = e.target;
    const nodeScaleX = node.scaleX();
    const nodeScaleY = node.scaleY();
    node.scaleX(1);
    node.scaleY(1);

    const plot = plots.find((p) => p.id === plotId);
    if (!plot) return;

    const newWidth = Math.max(0.3, node.width() * nodeScaleX / scale);
    const newHeight = Math.max(0.3, node.height() * nodeScaleY / scale);

    const positioned = positionedPlots.find((pp) => pp.plot.id === plotId);
    if (!positioned) return;

    const newX = Math.max(0, Math.min(plot.width - newWidth, (node.x() - (positioned.x * scale + padLeft)) / scale));
    const newY = Math.max(0, Math.min(plot.height - newHeight, (node.y() - (positioned.y * scale + padTop)) / scale));

    updatePlacement(plotId, activeMonthIndex, placementId, { x: newX, y: newY, width: newWidth, height: newHeight });

    node.x(positioned.x * scale + padLeft + newX * scale);
    node.y(positioned.y * scale + padTop + newY * scale);
  }, [plots, scale, positionedPlots, padLeft, padTop, updatePlacement, activeMonthIndex]);

  // ── Mouse handlers ──

  const getPlotFromPointer = useCallback((stageX: number, stageY: number): { plotId: string; x: number; y: number } | null => {
    for (const { plot, x: plotOffsetX, y: plotOffsetY } of positionedPlots) {
      const px = plotOffsetX * scale + padLeft;
      const py = plotOffsetY * scale + padTop;
      if (
        stageX >= px && stageX <= px + plot.width * scale &&
        stageY >= py && stageY <= py + plot.height * scale
      ) {
        return {
          plotId: plot.id,
          x: Math.max(0, Math.min(plot.width, (stageX - px) / scale)),
          y: Math.max(0, Math.min(plot.height, (stageY - py) / scale)),
        };
      }
    }
    return null;
  }, [positionedPlots, scale, padLeft, padTop]);

  const handleMouseDown = useCallback((e: any) => {
    const stage = e.target.getStage();
    const pointerPos = stage.getPointerPosition();
    if (!pointerPos) return;

    const stagePos = {
      x: (pointerPos.x - stageX) / (zoom / 100),
      y: (pointerPos.y - stageY) / (zoom / 100),
    };

    // Middle mouse or Alt+drag for panning
    if (e.evt?.button === 1 || e.evt?.altKey) {
      setIsPanning(true);
      panStart.current = { x: pointerPos.x, y: pointerPos.y, stageX, stageY };
      return;
    }

    // Check if clicking on a placement
    const targetId = e.target?.id?.();
    if (targetId && targetId.startsWith('placement-')) {
      return;
    }

    // Pending placement: start drawing a new vegetable rectangle
    if (pendingPlacementVarietyId && activePlotId) {
      const hit = getPlotFromPointer(stagePos.x, stagePos.y);
      if (hit && hit.plotId === activePlotId) {
        setIsDrawing(true);
        setDrawStart({ x: hit.x, y: hit.y, plotId: hit.plotId });
        setDrawCurrent({ x: hit.x, y: hit.y });
        return;
      }
    }

    // Click on empty space: start potential pan (activates if user drags > 4px)
    potentialPanRef.current = true;
    mouseDownPos.current = { x: pointerPos.x, y: pointerPos.y };
    panStart.current = { x: pointerPos.x, y: pointerPos.y, stageX, stageY };
  }, [stageX, stageY, zoom, pendingPlacementVarietyId, activePlotId, getPlotFromPointer, scale, padLeft, padTop]);

  const handleMouseMove = useCallback((e: any) => {
    const stage = e.target.getStage();
    const pointerPos = stage.getPointerPosition();
    if (!pointerPos) return;

    // Check if a potential pan should activate (moved > 4px from mousedown)
    if (potentialPanRef.current) {
      const dx = pointerPos.x - mouseDownPos.current.x;
      const dy = pointerPos.y - mouseDownPos.current.y;
      if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
        potentialPanRef.current = false;
        setIsPanning(true);
      }
    }

    if (isPanning) {
      const dx = pointerPos.x - panStart.current.x;
      const dy = pointerPos.y - panStart.current.y;
      setStagePosition(panStart.current.stageX + dx, panStart.current.stageY + dy);
      return;
    }

    if (isDrawing) {
      const stagePos = {
        x: (pointerPos.x - stageX) / (zoom / 100),
        y: (pointerPos.y - stageY) / (zoom / 100),
      };
      const hit = getPlotFromPointer(stagePos.x, stagePos.y);
      if (hit && hit.plotId === drawStart.plotId) {
        setDrawCurrent({ x: hit.x, y: hit.y });
      }
    }
  }, [isPanning, isDrawing, stageX, stageY, zoom, scale, padLeft, padTop, getPlotFromPointer, drawStart.plotId, setStagePosition]);

  const handleMouseUp = useCallback(() => {
    // If we were in a potential pan that never activated, it's a click — clear selection
    if (potentialPanRef.current) {
      potentialPanRef.current = false;
      clearSelection();
    }

    if (isPanning) {
      setIsPanning(false);
      return;
    }

    if (isDrawing) {
      setIsDrawing(false);
      const width = Math.abs(drawCurrent.x - drawStart.x);
      const height = Math.abs(drawCurrent.y - drawStart.y);
      if (width > 0.1 && height > 0.1 && pendingPlacementVarietyId && drawStart.plotId) {
        const x = Math.min(drawStart.x, drawCurrent.x);
        const y = Math.min(drawStart.y, drawCurrent.y);
        addPlacement(drawStart.plotId, activeMonthIndex, pendingPlacementVarietyId, x, y, width, height);
        // When multi-month mode is on, replicate the new placement to all
        // months in its growing season (plant-out/direct-sow → harvest).
        if (multiMonthPlacement) {
          const newId = useStore.getState().selectedPlacementIds[0];
          if (newId) {
            replicatePlacementToAllMonths(drawStart.plotId, newId);
          }
        }
      }
    }
  }, [isPanning, isDrawing, drawStart, drawCurrent, pendingPlacementVarietyId, activeMonthIndex, addPlacement, clearSelection, multiMonthPlacement, replicatePlacementToAllMonths]);

  // Wheel zoom — smoother, proportional step
  const handleWheel = useCallback((e: any) => {
    e.evt?.preventDefault();

    const stage = e.target.getStage();
    const pointerPos = stage.getPointerPosition();
    if (!pointerPos) return;

    const oldZoom = zoom;
    const direction = e.evt?.deltaY > 0 ? -1 : 1;
    // Step scales with current zoom: ~4% per tick, clamped between 1.5 and 4
    const step = Math.max(1.5, Math.min(4, oldZoom * 0.04));
    const newZoom = Math.max(5, Math.min(200, oldZoom + direction * step));

    // Zoom toward cursor position
    const scaleChange = newZoom / oldZoom;
    const newStageX = pointerPos.x - (pointerPos.x - stageX) * scaleChange;
    const newStageY = pointerPos.y - (pointerPos.y - stageY) * scaleChange;

    setZoom(newZoom);
    setStagePosition(newStageX, newStageY);
  }, [zoom, stageX, stageY, setZoom, setStagePosition]);

  // ── Placement drag handlers ──

  const handlePlacementDragStart = useCallback((placementId: string, plotId: string, e: any) => {
    const node = e.target;
    const isMulti = selectedPlacementIds.includes(placementId) && selectedPlacementIds.length > 1;
    const idsToMove = isMulti ? selectedPlacementIds : [placementId];

    const plotMonths = monthData[plotId];
    const md = plotMonths?.[activeMonthIndex];
    const placements = md?.placements ?? [];

    const initialPositions = new Map<string, { x: number; y: number }>();
    for (const p of placements) {
      if (idsToMove.includes(p.id)) {
        initialPositions.set(p.id, { x: p.x, y: p.y });
      }
    }

    dragRef.current = {
      startX: node.x(),
      startY: node.y(),
      placementId,
      plotId,
      isMulti,
      initialPositions,
    };
  }, [selectedPlacementIds, monthData, activeMonthIndex]);

  const handlePlacementDragMove = useCallback((e: any) => {
    if (!dragRef.current) return;
    const node = e.target;
    const dx = (node.x() - dragRef.current.startX) / scale;
    const dy = (node.y() - dragRef.current.startY) / scale;

    if (dragRef.current.isMulti) {
      const stage = node.getStage();
      for (const [pid, init] of dragRef.current.initialPositions) {
        if (pid === dragRef.current.placementId) continue;
        const otherNode = stage.findOne(`#placement-${pid}`);
        if (otherNode) {
          const plot = positionedPlots.find((pp) => pp.plot.id === dragRef.current!.plotId);
          if (plot) {
            const px = (init.x + dx) * scale + (plot.x * scale + padLeft);
            const py = (init.y + dy) * scale + (plot.y * scale + padTop);
            otherNode.x(px);
            otherNode.y(py);
          }
        }
      }
    }
  }, [scale, positionedPlots, padLeft, padTop]);

  const handlePlacementDragEnd = useCallback((placementId: string, e: any) => {
    if (!dragRef.current) return;
    const node = e.target;

    const startUserX = dragRef.current.initialPositions.get(placementId)?.x ?? 0;
    const startUserY = dragRef.current.initialPositions.get(placementId)?.y ?? 0;

    const plot = positionedPlots.find((pp) => pp.plot.id === dragRef.current!.plotId);
    if (!plot) { dragRef.current = null; return; }

    const userX = (node.x() - (plot.x * scale + padLeft)) / scale;
    const userY = (node.y() - (plot.y * scale + padTop)) / scale;

    const dx = userX - startUserX;
    const dy = userY - startUserY;

    if (Math.abs(dx) > 0.001 || Math.abs(dy) > 0.001) {
      if (dragRef.current.isMulti) {
        const ids = Array.from(dragRef.current.initialPositions.keys());
        movePlacements(dragRef.current.plotId, activeMonthIndex, ids, dx, dy);
      } else {
        updatePlacement(dragRef.current.plotId, activeMonthIndex, placementId, {
          x: Math.max(0, Math.min(plot.plot.width - (node.width() / scale), userX)),
          y: Math.max(0, Math.min(plot.plot.height - (node.height() / scale), userY)),
        });
      }
    }

    dragRef.current = null;
  }, [scale, positionedPlots, padLeft, padTop, movePlacements, updatePlacement, activeMonthIndex]);

  // ── Context menu reorder ──

  const handleContextMenuReorder = useCallback(
    (direction: ReorderDirection) => {
      if (!activePlotId || !contextMenu) return;
      reorderPlacement(activePlotId, contextMenu.placementId, direction);
    },
    [activePlotId, contextMenu, reorderPlacement],
  );

  // ── Rendering ──

  const unitLabel = (plot: Plot) => plot.unit === 'feet' ? 'ft' : 'm';
  const placementFontSize = 11;

  const getVariety = (id: string) => {
    return getVarietyById(id) ?? customVarieties.find((v) => v.id === id);
  };

  const getPlotPlacements = (plotId: string): VegetablePlacement[] => {
    return monthData[plotId]?.[activeMonthIndex]?.placements ?? [];
  };

  // Precompute harvest status for all placements in the current month so we
  // don't run date math inside the render loop.
  const harvestMap = useMemo(() => {
    const map = new Map<string, boolean>();
    for (const plotId of Object.keys(monthData)) {
      const placements = monthData[plotId]?.[activeMonthIndex]?.placements ?? [];
      for (const p of placements) {
        const variety = getVariety(p.varietyId);
        if (variety) {
          map.set(p.id, isHarvestMonth(variety, activeMonthIndex, p.seasonIndex));
        }
      }
    }
    return map;
  }, [monthData, activeMonthIndex, customVarieties]);

  const showCursor = pendingPlacementVarietyId ? 'crosshair' : 'default';

  return (
    <div ref={containerRef} className="w-full h-full overflow-hidden relative bg-stone-100">
      <Stage
        ref={stageRef}
        width={containerSize.width}
        height={containerSize.height}
        scaleX={zoom / 100}
        scaleY={zoom / 100}
        x={stageX}
        y={stageY}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        style={{ cursor: showCursor }}
      >
        {/* Grid & plot background layer */}
        <Layer listening={false}>
          {positionedPlots.map(({ plot, x, y }) => {
            const offsetX = x * scale + padLeft;
            const offsetY = y * scale + padTop;
            const grid = plotGridLines(plot, scale, offsetX, offsetY);
            return (
              <Group key={plot.id}>
                {/* Plot background */}
                <Rect
                  x={offsetX}
                  y={offsetY}
                  width={toPixel(plot.width)}
                  height={toPixel(plot.height)}
                  fill="#F5F0E8"
                  stroke={plot.id === activePlotId ? '#2D6A4F' : '#D4C4AB'}
                  strokeWidth={plot.id === activePlotId ? 2.5 : 1}
                />
                {/* Grid lines — uniform styling (no major/minor distinction) */}
                {grid.map((line, i) => (
                  <Line
                    key={i}
                    points={line.points}
                    stroke="#C8C0B4"
                    strokeWidth={0.4}
                  />
                ))}
                {/* Axis labels */}
                {Array.from({ length: Math.floor(plot.width) + 1 }, (_, i) => (
                  <Text
                    key={`lx-${i}`}
                    x={offsetX + toPixel(i) - 8}
                    y={offsetY + toPixel(plot.height) + 4}
                    text={i.toString()}
                    fontSize={10}
                    fill="#A8A29E"
                  />
                ))}
                {Array.from({ length: Math.floor(plot.height) + 1 }, (_, i) => (
                  <Text
                    key={`ly-${i}`}
                    x={offsetX - 25}
                    y={offsetY + toPixel(i) - 6}
                    text={i.toString()}
                    fontSize={10}
                    fill="#A8A29E"
                  />
                ))}
                {/* Plot name label */}
                <Rect
                  x={offsetX + 4}
                  y={offsetY - 20}
                  width={plot.name.length * 7 + 16}
                  height={18}
                  fill="#2D6A4F"
                  cornerRadius={4}
                  opacity={0.85}
                />
                <Text
                  x={offsetX + 12}
                  y={offsetY - 17}
                  text={plot.name}
                  fontSize={12}
                  fill="white"
                  fontStyle="bold"
                />
                {/* Unit label */}
                <Text
                  x={offsetX + toPixel(plot.width) - 20}
                  y={offsetY + toPixel(plot.height) - 16}
                  text={unitLabel(plot)}
                  fontSize={10}
                  fill="#A8A29E"
                />
              </Group>
            );
          })}
        </Layer>

        {/* Placements layer */}
        <Layer>
          {positionedPlots.map(({ plot, x: plotX, y: plotY }) => {
            const placements = getPlotPlacements(plot.id);
            const offsetX = plotX * scale + padLeft;
            const offsetY = plotY * scale + padTop;

            return placements.map((placement) => {
              const variety = getVariety(placement.varietyId);
              const group = variety ? getGroupById(variety.vegetableGroupId) : undefined;
              const color = getMutedVegColor(placement.varietyId);
              const isSelected = selectedPlacementIds.includes(placement.id);
              const isHarvesting = harvestMap.get(placement.id) ?? false;

              const label = variety
                ? `${group?.emoji ?? ''} ${variety.vegetableName} — ${variety.name}`
                : placement.varietyId;

              const px = offsetX + toPixel(placement.x);
              const py = offsetY + toPixel(placement.y);
              const pw = toPixel(placement.width);
              const ph = toPixel(placement.height);
              const invScale = 1 / (zoom / 100);

              return (
                <Group key={placement.id}>
                  <Rect
                    id={`placement-${placement.id}`}
                    x={px}
                    y={py}
                    width={pw}
                    height={ph}
                    fill={color}
                    opacity={0.85}
                    stroke={isSelected ? '#2563EB' : '#333'}
                    strokeWidth={isSelected ? 2 : 1}
                    draggable
                    onClick={(e: any) => {
                      const nativeEvent = e.evt as MouseEvent;
                      selectPlacement(placement.id, nativeEvent?.shiftKey ?? false);
                    }}
                    onTap={(e: any) => {
                      const nativeEvent = e.evt as MouseEvent;
                      selectPlacement(placement.id, nativeEvent?.shiftKey ?? false);
                    }}
                    onDragStart={(e: any) => {
                      handlePlacementDragStart(placement.id, plot.id, e);
                    }}
                    onDragMove={handlePlacementDragMove}
                    onDragEnd={(e: any) => handlePlacementDragEnd(placement.id, e)}
                    onTransformEnd={(e: any) => handleTransformEnd(placement.id, plot.id, e)}
                    onContextMenu={(e: any) => {
                      e.evt.preventDefault();
                      const nativeEvent = e.evt as MouseEvent;
                      setContextMenu({
                        clientX: nativeEvent.clientX,
                        clientY: nativeEvent.clientY,
                        placementId: placement.id,
                      });
                      selectPlacement(placement.id, nativeEvent.shiftKey ?? false);
                    }}
                    onMouseEnter={(e: any) => {
                      const stage = e.target.getStage();
                      const pos = stage.getPointerPosition();
                      hoveredPlacementRef.current = { x: pos.x, y: pos.y, varietyId: placement.varietyId };
                      setHoveredPlacementId(placement.id);
                    }}
                    onMouseLeave={() => {
                      setHoveredPlacementId(null);
                      hoveredPlacementRef.current = null;
                    }}
                  />
                  {/* Harvest indicator — gold star in the top-right corner */}
                  {isHarvesting && (() => {
                    const starSize = 14;
                    const margin = 2;
                    return (
                      <Text
                        x={px + pw - (starSize + margin) * invScale}
                        y={py + margin * invScale}
                        text="★"
                        fontSize={starSize}
                        fill="#F59E0B"
                        fontStyle="bold"
                        listening={false}
                        scaleX={invScale}
                        scaleY={invScale}
                      />
                    );
                  })()}
                  {/* Label — word-wraps to fit, hidden only when box is too small for any text.
                      Text is counter-scaled so it always renders at physical ~11px regardless of zoom. */}
                  {(() => {
                    // Need enough width for at least a few characters and height for ~2 lines
                    const minW = 22;
                    const minH = 16;
                    if (pw <= minW || ph <= minH) return null;
                    // Leave 3px padding on each side
                    const textW = pw - 6;
                    return (
                      <Text
                        x={px + 3}
                        y={py + 3}
                        text={label}
                        fontSize={placementFontSize}
                        lineHeight={1.15}
                        fill="#1C1917"
                        fontStyle="bold"
                        listening={false}
                        width={textW}
                        wrap="word"
                        ellipsis={true}
                        scaleX={invScale}
                        scaleY={invScale}
                      />
                    );
                  })()}
                </Group>
              );
            });
          })}
        </Layer>

        {/* Transformer layer — resize handles for single selected placement */}
        {selectedPlacementIds.length === 1 && (
          <Layer>
            <Transformer
              ref={transformerRef}
              keepRatio={false}
              boundBoxFunc={(_oldBox: any, newBox: any) => {
                const minSize = toPixel(0.3);
                if (newBox.width < minSize || newBox.height < minSize) return _oldBox;
                return newBox;
              }}
              enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right']}
            />
          </Layer>
        )}

        {/* Tooltip layer — shows vegetable details on hover */}
        {hoveredPlacementId && hoveredPlacementRef.current && (() => {
          const hp = hoveredPlacementRef.current;
          const variety = getVariety(hp.varietyId);
          if (!variety) return null;

          // Find the placement to get its seasonIndex
          const placement = activePlotId
            ? monthData[activePlotId]?.[activeMonthIndex]?.placements.find((p: VegetablePlacement) => p.id === hoveredPlacementId)
            : undefined;
          const seasonLabel = placement?.seasonIndex !== undefined && variety.seasons?.[placement.seasonIndex]
            ? ` (${variety.seasons[placement.seasonIndex].name})`
            : '';

          const desc = variety.description;

          // Build detail lines for the tooltip
          const detailLines: string[] = [];
          detailLines.push(`☀️ ${formatSunRequirement(variety.sunRequirement)}`);
          detailLines.push(`📏 ${variety.spacing.betweenPlantsCm}cm plants · ${variety.spacing.betweenRowsCm}cm rows`);
          detailLines.push(`⏱️ ~${variety.daysToMaturity} days to harvest`);

          const timeline = getVarietyTimeline(variety, undefined, placement?.seasonIndex);
          for (const entry of timeline) {
            detailLines.push(`${entry.emoji} ${entry.label}: ~${entry.dateRange}`);
          }

          const fontSize = 12;
          const lineHeight = 16;
          const pad = 10;
          const boxW = 330;
          const textW = boxW - pad * 2;
          // Wrap each detail line at ~48 chars
          const charsPerLine = Math.floor(textW / (fontSize * 0.6));
          const detailTextLines = detailLines.flatMap((line) => {
            if (line.length <= charsPerLine) return [line];
            const chunks: string[] = [];
            let remaining = line;
            while (remaining.length > charsPerLine) {
              chunks.push(remaining.slice(0, charsPerLine));
              remaining = remaining.slice(charsPerLine);
            }
            if (remaining.length > 0) chunks.push(remaining);
            return chunks;
          });
          const descLines = desc.length > 0 ? Math.ceil(desc.length / (charsPerLine * 0.85)) : 0;
          const totalLines = 1 + detailTextLines.length + descLines;
          const boxH = totalLines * lineHeight + pad * 2;

          // Pointer position from getPointerPosition() is already in screen-space
          // (container-relative). Position tooltip in screen-space, then convert
          const z = zoom / 100;
          const screenCX = hp.x;
          const screenCY = hp.y;
          const cw = containerSize.width;
          const ch = containerSize.height;

          // Try right of cursor, fall back to left if not enough room
          let screenTX = screenCX + 16;
          if (screenTX + boxW > cw) screenTX = screenCX - boxW - 16;
          if (screenTX < 0) screenTX = 4;
          // Vertically centred on cursor, clamped
          let screenTY = screenCY - boxH / 2;
          if (screenTY < 0) screenTY = 4;
          if (screenTY + boxH > ch) screenTY = ch - boxH - 4;

          // Convert back to stage-space
          const tx = (screenTX - stageX) / z;
          const ty = (screenTY - stageY) / z;
          return (
            <Layer listening={false}>
              <Rect
                x={tx}
                y={ty}
                width={boxW}
                height={boxH}
                fill="white"
                stroke="#D4C4AB"
                strokeWidth={1}
                cornerRadius={6}
                shadowColor="black"
                shadowBlur={6}
                shadowOpacity={0.15}
                shadowOffset={{ x: 0, y: 2 }}
              />
              <Text
                x={tx + pad}
                y={ty + pad}
                text={`🌱 ${variety.vegetableName} — ${variety.name}${seasonLabel}`}
                fontSize={fontSize}
                fill="#1C1917"
                fontStyle="bold"
              />
              {detailTextLines.map((line, i) => (
                <Text
                  key={i}
                  x={tx + pad}
                  y={ty + pad + (1 + i) * lineHeight}
                  text={line}
                  fontSize={fontSize}
                  fill="#78716C"
                  width={textW}
                />
              ))}
              {desc && (
                <Text
                  x={tx + pad}
                  y={ty + pad + (1 + detailTextLines.length) * lineHeight}
                  text={desc}
                  fontSize={fontSize}
                  fill="#A8A29E"
                  width={textW}
                  wrap="word"
                />
              )}
            </Layer>
          );
        })()}

        {/* Drawing preview */}
        {isDrawing && (
          <Layer>
            <Rect
              x={
                (() => {
                  const pos = positionedPlots.find((p) => p.plot.id === drawStart.plotId);
                  if (!pos) return 0;
                  return pos.x * scale + padLeft + Math.min(drawStart.x, drawCurrent.x) * scale;
                })()
              }
              y={
                (() => {
                  const pos = positionedPlots.find((p) => p.plot.id === drawStart.plotId);
                  if (!pos) return 0;
                  return pos.y * scale + padTop + Math.min(drawStart.y, drawCurrent.y) * scale;
                })()
              }
              width={Math.abs(drawCurrent.x - drawStart.x) * scale}
              height={Math.abs(drawCurrent.y - drawStart.y) * scale}
              fill="rgba(34, 197, 94, 0.15)"
              stroke="#22C55E"
              strokeWidth={2}
              dash={[6, 4]}
            />
          </Layer>
        )}

        {/* Empty state */}
        {plots.length === 0 && (
          <Layer>
            <Text
              x={containerSize.width / 2 - 120}
              y={containerSize.height / 2 - 20}
              text="No plots yet"
              fontSize={16}
              fill="#A8A29E"
              align="center"
            />
            <Text
              x={containerSize.width / 2 - 180}
              y={containerSize.height / 2 + 10}
              text='Click "✨ New" to create a garden plan, or load a saved plan'
              fontSize={12}
              fill="#C8C0B4"
              align="center"
            />
          </Layer>
        )}
      </Stage>

      {/* Right-click context menu for z-order */}
      {contextMenu && containerRef.current && (
        <PlacementContextMenu
          clientX={contextMenu.clientX}
          clientY={contextMenu.clientY}
          containerRect={containerRef.current.getBoundingClientRect()}
          onClose={() => setContextMenu(null)}
          onReorder={handleContextMenuReorder}
        />
      )}

      {/* Zoom percentage indicator */}
      <div className="absolute bottom-12 right-2 bg-white/80 rounded px-2 py-0.5 text-xs text-stone-400">
        {Math.round(zoom)}%
      </div>

      {/* Harvest legend */}
      <div className="absolute bottom-12 left-2 bg-white/80 rounded px-2 py-0.5 text-xs text-stone-500 flex items-center gap-1.5">
        <span className="text-amber-500 font-bold">★</span>
        <span>Ready to harvest</span>
      </div>
    </div>
  );
}
