import { useState } from 'react';
import { useStore } from '@/store';
import type { PlotUnit } from '@/types';
import { CompatibilityPanel } from './CompatibilityPanel';
import { Toggle } from '@/components/ui/Toggle';

export function PlotSetupPanel() {
  const plots = useStore((s) => s.plots);
  const activePlotId = useStore((s) => s.activePlotId);
  const addPlot = useStore((s) => s.addPlot);
  const updatePlot = useStore((s) => s.updatePlot);
  const removePlot = useStore((s) => s.removePlot);
  const setActivePlot = useStore((s) => s.setActivePlot);
  const peopleCount = useStore((s) => s.peopleCount);
  const setPeopleCount = useStore((s) => s.setPeopleCount);
  const useGrowLights = useStore((s) => s.useGrowLights);
  const setUseGrowLights = useStore((s) => s.setUseGrowLights);
  const useFleece = useStore((s) => s.useFleece);
  const setUseFleece = useStore((s) => s.setUseFleece);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newWidth, setNewWidth] = useState(10);
  const [newHeight, setNewHeight] = useState(8);
  const [newUnit, setNewUnit] = useState<PlotUnit>('feet');

  const handleAddPlot = () => {
    const name = newName.trim() || `Plot ${plots.length + 1}`;
    addPlot(name, newWidth, newHeight, newUnit);
    setNewName('');
    setShowAddForm(false);
  };

  return (
    <div className="space-y-4">
      {/* Add plot */}
      {!showAddForm ? (
        <button
          onClick={() => setShowAddForm(true)}
          className="w-full px-4 py-2 text-sm font-medium rounded-lg bg-brand-600 text-white hover:bg-brand-700 transition-colors"
        >
          + Add Plot
        </button>
      ) : (
        <div className="p-3 bg-stone-50 rounded-lg border border-stone-200 space-y-2">
          <h3 className="text-sm font-medium text-stone-700">New Plot</h3>
          <div>
            <label className="text-xs text-stone-400">Name</label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder={`Plot ${plots.length + 1}`}
              className="w-full px-3 py-1.5 text-sm border border-stone-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
              onKeyDown={(e) => e.key === 'Enter' && handleAddPlot()}
            />
          </div>
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <label className="text-xs text-stone-400">Width</label>
              <input
                type="number"
                value={newWidth}
                onChange={(e) => setNewWidth(Number(e.target.value))}
                min={1} max={100}
                className="w-full px-3 py-1.5 text-sm border border-stone-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
              />
            </div>
            <span className="text-stone-400 pb-1">×</span>
            <div className="flex-1">
              <label className="text-xs text-stone-400">Height</label>
              <input
                type="number"
                value={newHeight}
                onChange={(e) => setNewHeight(Number(e.target.value))}
                min={1} max={100}
                className="w-full px-3 py-1.5 text-sm border border-stone-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-stone-400">Unit</label>
            <div className="flex rounded-lg overflow-hidden border border-stone-300">
              {(['feet', 'metres'] as PlotUnit[]).map((unit) => (
                <button
                  key={unit}
                  onClick={() => setNewUnit(unit)}
                  className={`flex-1 px-3 py-1.5 text-xs font-medium transition-colors ${
                    newUnit === unit
                      ? 'bg-brand-600 text-white'
                      : 'bg-white text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  {unit === 'feet' ? 'Feet' : 'Metres'}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleAddPlot}
              className="flex-1 px-3 py-1.5 text-sm rounded-lg bg-brand-600 text-white hover:bg-brand-700 transition-colors"
            >
              Add
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="px-3 py-1.5 text-sm rounded-lg bg-stone-200 text-stone-600 hover:bg-stone-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Plot list */}
      {plots.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-2">
            Plots ({plots.length})
          </label>
          <div className="space-y-2">
            {plots.map((plot) => (
              <div
                key={plot.id}
                onClick={() => setActivePlot(plot.id)}
                className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                  plot.id === activePlotId
                    ? 'border-brand-500 bg-brand-50'
                    : 'border-stone-200 hover:bg-stone-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-sm text-stone-800">{plot.name}</div>
                    <div className="text-xs text-stone-400">
                      {plot.width}×{plot.height} {plot.unit === 'feet' ? 'ft' : 'm'}
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Delete "${plot.name}"?`)) removePlot(plot.id);
                    }}
                    className="p-1 text-stone-400 hover:text-red-500 transition-colors"
                    title="Delete plot"
                  >
                    🗑️
                  </button>
                </div>
                {/* Inline dimension editing */}
                {plot.id === activePlotId && (
                  <div className="flex gap-2 mt-2 items-end" onClick={(e) => e.stopPropagation()}>
                    <div className="flex-1">
                      <label className="text-xs text-stone-400">Width</label>
                      <input
                        type="number"
                        value={plot.width}
                        onChange={(e) => updatePlot(plot.id, { width: Number(e.target.value) })}
                        min={1} max={100}
                        className="w-full px-2 py-1 text-xs border border-stone-300 rounded focus:ring-2 focus:ring-brand-500 outline-none"
                      />
                    </div>
                    <span className="text-stone-400 pb-1">×</span>
                    <div className="flex-1">
                      <label className="text-xs text-stone-400">Height</label>
                      <input
                        type="number"
                        value={plot.height}
                        onChange={(e) => updatePlot(plot.id, { height: Number(e.target.value) })}
                        min={1} max={100}
                        className="w-full px-2 py-1 text-xs border border-stone-300 rounded focus:ring-2 focus:ring-brand-500 outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* People count */}
      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1">People</label>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPeopleCount(peopleCount - 1)}
            disabled={peopleCount <= 1}
            className="w-8 h-8 rounded-lg border border-stone-300 flex items-center justify-center text-stone-600 hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            −
          </button>
          <span className="w-10 text-center font-medium text-stone-800">{peopleCount}</span>
          <button
            onClick={() => setPeopleCount(peopleCount + 1)}
            disabled={peopleCount >= 20}
            className="w-8 h-8 rounded-lg border border-stone-300 flex items-center justify-center text-stone-600 hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            +
          </button>
        </div>
        <p className="text-xs text-stone-400 mt-1">Max plants scaled per person</p>
      </div>

      {/* Grow lights & fleece */}
      <div>
        <label className="block text-sm font-medium text-stone-700 mb-2">Extensions</label>
        <div className="space-y-2">
          <Toggle
            label="💡 Grow Lights"
            value={useGrowLights}
            onChange={setUseGrowLights}
          />
          <Toggle
            label="🧣 Fleece / Cloche"
            value={useFleece}
            onChange={setUseFleece}
          />
        </div>
      </div>

      {/* Compatibility analysis */}
      {plots.length > 0 && <CompatibilityPanel />}

      <p className="text-xs text-stone-400">
        Select a plot on the canvas and use the Vegetable Browser to place crops.
      </p>
    </div>
  );
}
