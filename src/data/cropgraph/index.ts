/**
 * Cropgraph-enriched data layer — public API.
 *
 * Re-exports the same interface as the old src/data/vegetables/index.ts.
 * Data is enriched at import time with authoritative growing information
 * from @cropgraph/core.
 */

export {
  allVegetableGroups,
  getVarietyById,
  getAllVarieties,
  getGroupById,
  getAllGroups,
  getVarietiesByCropSlug,
} from './adapter';

export { resolveVarietySlug } from './slug-map';
