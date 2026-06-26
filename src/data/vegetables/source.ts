/**
 * Raw vegetable data — imports from all 43 individual vegetable files.
 *
 * This file exists to break a circular dependency:
 *   source.ts (imports 43 files, no deps on adapter)
 *   → adapter.ts (imports source.ts + @cropgraph/core, enriches data)
 *   → index.ts (re-exports from adapter)
 *
 * Components import from @/data/vegetables (index.ts) as before.
 */

import type { VegetableGroup } from '@/types';

// Individual vegetable groups (split from compound groups)
import { tomatoGroup } from './tomatoes';
import { pepperGroup } from './peppers';
import { legumesGroup } from './legumes';
import { alliumsGroup } from './alliums';
import { herbsGroup } from './herbs';

// Leafy greens (split from leafyGreens.ts)
import { lettuceGroup } from './lettuce';
import { spinachGroup } from './spinach';
import { chardGroup } from './chard';
import { kaleGroup } from './kale';
import { rocketGroup } from './rocket';

// Root vegetables (split from rootVegetables.ts)
import { carrotGroup } from './carrot';
import { beetrootGroup } from './beetroot';
import { radishGroup } from './radish';
import { parsnipGroup } from './parsnip';
import { turnipGroup } from './turnip';
import { swedeGroup } from './swede';

// Brassicas (split from brassicas.ts)
import { broccoliGroup } from './broccoli';
import { cabbageGroup } from './cabbage';
import { cauliflowerGroup } from './cauliflower';
import { brusselsSproutsGroup } from './brusselsSprouts';
import { kohlrabiGroup } from './kohlrabi';

// Cucurbits (split from cucurbits.ts)
import { cucumberGroup } from './cucumber';
import { courgetteGroup } from './courgette';
import { squashGroup } from './squash';
import { pumpkinGroup } from './pumpkin';

// Asian vegetables (split from asianVegetables.ts)
import { pakChoiGroup } from './pakChoi';
import { chineseCabbageGroup } from './chineseCabbage';
import { choySumGroup } from './choySum';
import { mizunaGroup } from './mizuna';
import { mooliGroup } from './mooli';
import { mustardGreensGroup } from './mustardGreens';
import { kaiLanGroup } from './kaiLan';
import { tatsoiGroup } from './tatsoi';

// Other vegetables
import { sweetcornGroup } from './sweetcorn';
import { asparagusGroup } from './asparagus';
import { artichokeGroup } from './artichoke';
import { celeryGroup } from './celery';
import { fennelGroup } from './fennel';
import { rhubarbGroup } from './rhubarb';
import { okraGroup } from './okra';
import { sweetPotatoGroup } from './sweetPotato';

// New vegetables (added from @cropgraph/core)
import { potatoGroup } from './potato';
import { aubergineGroup } from './aubergine';
import { celeriacGroup } from './celeriac';
import { endiveGroup } from './endive';
import { watercressGroup } from './watercress';
import { jerusalemArtichokeGroup } from './jerusalemArtichoke';
import { collardGreensGroup } from './collardGreens';
import { sorrelGroup } from './sorrel';
import { macheGroup } from './mache';
import { horseradishGroup } from './horseradish';
import { tomatilloGroup } from './tomatillo';

// New vegetables (database expansion 2026)
import { summerSquashGroup } from './summerSquash';
import { specialtyGreensGroup } from './specialtyGreens';
import { asianGreensExpandedGroup } from './asianGreensExpanded';
import { unusualRootsGroup } from './unusualRoots';
import { perennialVegetablesGroup } from './perennialVegetables';
import { specialtyLegumesGroup } from './specialtyLegumes';

export const allVegetableGroups: VegetableGroup[] = [
  // Fruiting vegetables
  tomatoGroup,
  pepperGroup,
  legumesGroup,

  // Alliums
  alliumsGroup,

  // Leafy greens
  lettuceGroup,
  spinachGroup,
  chardGroup,
  kaleGroup,
  rocketGroup,

  // Root vegetables
  carrotGroup,
  beetrootGroup,
  radishGroup,
  parsnipGroup,
  turnipGroup,
  swedeGroup,

  // Brassicas
  broccoliGroup,
  cabbageGroup,
  cauliflowerGroup,
  brusselsSproutsGroup,
  kohlrabiGroup,

  // Cucurbits
  cucumberGroup,
  courgetteGroup,
  squashGroup,
  pumpkinGroup,

  // Asian vegetables
  pakChoiGroup,
  chineseCabbageGroup,
  choySumGroup,
  mizunaGroup,
  mooliGroup,
  mustardGreensGroup,
  kaiLanGroup,
  tatsoiGroup,

  // Herbs
  herbsGroup,

  // Other vegetables
  sweetcornGroup,
  asparagusGroup,
  artichokeGroup,
  celeryGroup,
  fennelGroup,
  rhubarbGroup,
  okraGroup,
  sweetPotatoGroup,

  // New vegetables (from @cropgraph/core)
  potatoGroup,
  aubergineGroup,
  celeriacGroup,
  endiveGroup,
  watercressGroup,
  jerusalemArtichokeGroup,
  collardGreensGroup,
  sorrelGroup,
  macheGroup,
  horseradishGroup,
  tomatilloGroup,

  // New vegetables (database expansion 2026)
  summerSquashGroup,
  specialtyGreensGroup,
  asianGreensExpandedGroup,
  unusualRootsGroup,
  perennialVegetablesGroup,
  specialtyLegumesGroup,
];
