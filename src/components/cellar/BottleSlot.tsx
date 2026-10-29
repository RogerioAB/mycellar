import type { Bottle } from '../../types/bottle'
import { BottleIcon } from './BottleIcon'

export type MatchState = 'neutral' | 'match' | 'dim'

const MATCH_CLASSES: Record<MatchState, string> = {
  neutral: 'bg-cellar-900/40 hover:bg-cellar-900/70',
  match: 'bg-cellar-900/40 ring-2 ring-wine-400 shadow-[0_0_10px_rgba(196,73,95,0.7)]',
  dim: 'bg-cellar-900/40 opacity-30',
}

export function BottleSlot({
  bottle,
  onSelect,
  matchState = 'neutral',
}: {
  bottle: Bottle
  onSelect: (bottle: Bottle, originRect: DOMRect) => void
  matchState?: MatchState
}) {
  const title = bottle.vintage_year ? `${bottle.name} (${bottle.vintage_year})` : bottle.name
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      onClick={(e) => onSelect(bottle, e.currentTarget.getBoundingClientRect())}
      className={`flex aspect-[2/5] min-h-11 flex-1 items-center justify-center rounded-md p-1 transition-all ${MATCH_CLASSES[matchState]}`}
    >
      <BottleIcon wineType={bottle.wine_type} className="h-full w-auto" />
    </button>
  )
}
