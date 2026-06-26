import { Header } from '@/components/layout/Header';
import { FloatingToolbar } from '@/components/layout/FloatingToolbar';
import { PlotCanvas } from '@/components/plot/PlotCanvas';
import { PlotSetupPanel } from '@/components/plot/PlotSetupPanel';
import { VegetableBrowserPage } from '@/components/vegetables/VegetableBrowserPage';
import { MonthNotes } from '@/components/month/MonthNotes';
import { SlidePanel } from '@/components/panel/SlidePanel';
import { useStore } from '@/store';

function App() {
  const showPlotSetup = useStore((s) => s.showPlotSetup);
  const showVegetableBrowser = useStore((s) => s.showVegetableBrowser);
  const togglePlotSetup = useStore((s) => s.togglePlotSetup);
  const toggleVegetableBrowser = useStore((s) => s.toggleVegetableBrowser);
  const activeMonthIndex = useStore((s) => s.activeMonthIndex);
  const setActiveMonth = useStore((s) => s.setActiveMonth);

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Header />

      {/* Toolbar — always visible so user can access Plot Setup */}
      <FloatingToolbar />

      <main className="flex-1 flex flex-col min-h-0">
        <div className="flex-1 relative min-h-0">
          <PlotCanvas />

          {/* Edge arrows for month navigation — no bounds */}
          <button
            onClick={() => setActiveMonth(activeMonthIndex - 1)}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-30 w-10 h-10 flex items-center justify-center text-xl font-bold rounded-full bg-white/80 shadow-md hover:bg-white transition-all"
            title="Previous month"
          >
            ←
          </button>
          <button
            onClick={() => setActiveMonth(activeMonthIndex + 1)}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-30 w-10 h-10 flex items-center justify-center text-xl font-bold rounded-full bg-white/80 shadow-md hover:bg-white transition-all"
            title="Next month"
          >
            →
          </button>

          {/* Notes area */}
          <div className="absolute bottom-0 left-0 right-0">
            <MonthNotes />
          </div>
        </div>
      </main>

      {/* Slide-out panels */}
      <SlidePanel
        open={showPlotSetup}
        onClose={togglePlotSetup}
        title="Plot Setup"
        width="half"
      >
        <PlotSetupPanel />
      </SlidePanel>

      <SlidePanel
        open={showVegetableBrowser}
        onClose={toggleVegetableBrowser}
        title="Vegetable Browser"
        width="half"
      >
        <VegetableBrowserPage />
      </SlidePanel>
    </div>
  );
}

export default App;
