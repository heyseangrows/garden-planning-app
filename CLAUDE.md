# Gardening App

Vite + React + TypeScript vegetable garden planning app.

## Dev server

```bash
npm run dev
```

Runs on `http://localhost:5173/` by default.

## After every code change

**Always reconnect the dev server** — the localhost connection can drop after file changes trigger HMR rebuilds or after the server sits idle. Before declaring work done:

1. Confirm `npm run dev` is still running in a terminal.
2. If not, restart it with `npm run dev`.
3. Verify `http://localhost:5173/` loads in the browser.
4. If the page shows a blank screen or errors, check the terminal for Vite/TypeScript compilation errors and fix them.
5. If `http://localhost:5173/` is not connecting at all, the Vite server may have stopped — re-run `npm run dev` in the project directory.

## Architecture

- `src/types/` — TypeScript interfaces (`VegetableGroup`, `VegetableVariety`, etc.)
- `src/data/vegetables/` — 43 individual vegetable group data files + `source.ts` (aggregator)
- `src/data/cropgraph/adapter.ts` — enriches hardcoded data with @cropgraph/core data (timing, companions, pests)
- `src/components/vegetables/` — vegetable browser UI components
- `src/store.ts` — Zustand state management

## Data flow

Individual veg files → `source.ts` (raw groups) → `adapter.ts` (enrich with cropgraph) → `index.ts` → components
