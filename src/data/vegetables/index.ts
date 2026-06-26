/**
 * Vegetable data — now enriched with @cropgraph/core authoritative growing data.
 *
 * Re-exports from the cropgraph adapter which merges:
 *   - App-specific data (cultivars, ratings, emoji) from the 43 individual files
 *   - Authoritative growing data (timing, companions, pests) from @cropgraph/core
 */

export {
  allVegetableGroups,
  getVarietyById,
  getAllVarieties,
  getGroupById,
} from '@/data/cropgraph';
