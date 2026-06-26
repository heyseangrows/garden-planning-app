import type { VegetableGroup, VegetableVariety } from '@/types';
import { VarietyRow } from './VarietyRow';
import { Badge } from '@/components/ui/Badge';

/** Convert a kebab-case tag slug into a human-readable label. */
function formatTag(tag: string): string {
  return tag
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

interface VegetableCardProps {
  group: VegetableGroup;
  isExpanded: boolean;
  onToggle: () => void;
  peopleCount: number;
  onEditCustom?: (variety: VegetableVariety) => void;
}

export function VegetableCard({ group, isExpanded, onToggle, peopleCount, onEditCustom }: VegetableCardProps) {
  return (
    <div className="card overflow-x-auto">
      {/* Header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 hover:bg-stone-50 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">{group.emoji}</span>
          <div>
            <h3 className="font-semibold text-stone-800">{group.name}</h3>
            <p className="text-xs text-stone-500">{group.varieties.length} varieties</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {group.tags?.map((tag) => (
            <Badge key={tag} variant="warning">
              {formatTag(tag)}
            </Badge>
          ))}
          <Badge variant="default">
            {group.varieties.length}
          </Badge>
          <span className={`text-stone-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
            ▼
          </span>
        </div>
      </button>

      {/* Description (always visible) */}
      <div className="px-4 pb-2">
        <p className="text-xs text-stone-500">{group.description}</p>
      </div>

      {/* Varieties list (expanded) */}
      {isExpanded && (
        <div className="border-t border-stone-100">
          {/* Column headers */}
          <div className="grid grid-cols-[repeat(14,minmax(0,1fr))] gap-2 px-4 py-2 bg-stone-50 text-xs font-medium text-stone-500 uppercase tracking-wider w-[840px]">
            <div className="col-span-3">Variety</div>
            <div className="col-span-2 text-center">Climate</div>
            <div className="col-span-2 text-center">Yield</div>
            <div className="col-span-2 text-center">Taste</div>
            <div className="col-span-2 text-center">Ease</div>
            <div className="col-span-1 text-center">Value</div>
            <div className="col-span-1 text-center">Max</div>
            <div className="col-span-1 text-center">Place</div>
          </div>
          {group.varieties.map((variety) => (
            <VarietyRow
              key={variety.id}
              variety={variety}
              peopleCount={peopleCount}
              onEditCustom={onEditCustom}
            />
          ))}
        </div>
      )}
    </div>
  );
}
