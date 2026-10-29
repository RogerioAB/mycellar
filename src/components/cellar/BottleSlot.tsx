import type { Bottle } from '../../types/bottle'
import { BottleIcon } from './BottleIcon'

export function BottleSlot({
  bottle,
  onSelect,
}: {
  bottle: Bottle
  onSelect: (bottle: Bottle, originRect: DOMRect) => void
}) {
  const title = bottle.vintage_year ? `${bottle.name} (${bottle.vintage_year})` : bottle.name
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      onClick={(e) => onSelect(bottle, e.currentTarget.getBoundingClientRect())}
      className="flex aspect-[2/5] min-h-11 flex-1 items-center justify-center rounded-md bg-cellar-900/40 p-1 hover:bg-cellar-900/70"
    >
      <BottleIcon wineType={bottle.wine_type} className="h-full w-auto" />
    </button>
  )
}
