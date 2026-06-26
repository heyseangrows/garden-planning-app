import { useStore } from '@/store';
import { formatMonthLabel } from '@/data/frostDates';
import { clsx } from 'clsx';

export function FloatingToolbar() {
  const activeMonthIndex = useStore((s) => s.activeMonthIndex);
  const setActiveMonth = useStore((s) => s.setActiveMonth);
  const zoom = useStore((s) => s.zoom);
  const setZoom = useStore((s) => s.setZoom);
  const showPlotSetup = useStore((s) => s.showPlotSetup);
  const showVegetableBrowser = useStore((s) => s.showVegetableBrowser);
  const togglePlotSetup = useStore((s) => s.togglePlotSetup);
  const toggleVegetableBrowser = useStore((s) => s.toggleVegetableBrowser);
  const activePlotId = useStore((s) => s.activePlotId);
  const plots = useStore((s) => s.plots);
  const setActivePlot = useStore((s) => s.setActivePlot);

  const undo = useStore((s) => s.undo);
  const redo = useStore((s) => s.redo);
  const undoStack = useStore((s) => s.undoStack);
  const redoStack = useStore((s) => s.redoStack);

  const activePlot = plots.find((p) => p.id === activePlotId);

  const monthDisplay = formatMonthLabel(activeMonthIndex);

  return (
    <div className="flex items-center gap-3 px-4 py-2.5 bg-white border-b border-stone-200">
      {/* LEFT: undo/redo + zoom controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={undo}
          disabled={undoStack.length === 0}
          className="px-2.5 py-2 text-base rounded-md bg-stone-100 text-stone-600 hover:bg-stone-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors font-medium"
          title="Undo (Cmd+Z)"
        >
          ↩
        </button>
        <button
          onClick={redo}
          disabled={redoStack.length === 0}
          className="px-2.5 py-2 text-base rounded-md bg-stone-100 text-stone-600 hover:bg-stone-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors font-medium"
          title="Redo (Cmd+Shift+Z)"
        >
          ↪
        </button>
        <div className="w-px h-6 bg-stone-200 mx-1" />
        <button
          onClick={() => setZoom(zoom - 10)}
          className="px-2.5 py-2 text-base rounded-md bg-stone-100 text-stone-600 hover:bg-stone-200 transition-colors font-medium"
          title="Zoom out"
        >
          🔍−
        </button>
        <span className="text-sm text-stone-500 min-w-[42px] text-center font-medium">
          {Math.round(zoom)}%
        </span>
        <button
          onClick={() => setZoom(zoom + 10)}
          className="px-2.5 py-2 text-base rounded-md bg-stone-100 text-stone-600 hover:bg-stone-200 transition-colors font-medium"
          title="Zoom in"
        >
          🔍+
        </button>
      </div>

      {/* CENTRE: month name with left/right arrows — no bounds */}
      <div className="flex-1 flex items-center justify-center gap-3">
        <button
          onClick={() => setActiveMonth(activeMonthIndex - 1)}
          className="px-3 py-2 text-base font-bold rounded-md bg-stone-100 text-stone-600 hover:bg-stone-200 transition-colors"
          title="Previous month"
        >
          ←
        </button>
        <span className="text-base font-bold text-stone-800 min-w-[160px] text-center">
          {monthDisplay}
        </span>
        <button
          onClick={() => setActiveMonth(activeMonthIndex + 1)}
          className="px-3 py-2 text-base font-bold rounded-md bg-stone-100 text-stone-600 hover:bg-stone-200 transition-colors"
          title="Next month"
        >
          →
        </button>
      </div>

      {/* RIGHT: plot selector + panel toggles */}
      <div className="flex items-center gap-2">
        {plots.length > 1 && (
          <select
            value={activePlotId ?? ''}
            onChange={(e) => setActivePlot(e.target.value || null)}
            className="px-3 py-2 text-sm border border-stone-300 rounded-md bg-white text-stone-700 focus:ring-2 focus:ring-brand-500 outline-none font-medium"
          >
            {plots.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        )}

        {activePlot && (
          <span className="text-sm text-stone-400 font-medium">
            {activePlot.width}×{activePlot.height} {activePlot.unit === 'feet' ? 'ft' : 'm'}
          </span>
        )}

        <button
          onClick={togglePlotSetup}
          className={clsx(
            'px-3 py-2 text-sm font-medium rounded-md transition-colors',
            showPlotSetup
              ? 'bg-brand-600 text-white'
              : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
          )}
          title="Plot Setup"
        >
          ☰ Plots
        </button>
        <button
          onClick={toggleVegetableBrowser}
          className={clsx(
            'px-3 py-2 text-sm font-medium rounded-md transition-colors',
            showVegetableBrowser
              ? 'bg-brand-600 text-white'
              : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
          )}
          title="Vegetable Browser"
        >
          🌿 Vegetables
        </button>
      </div>
    </div>
  );
}
