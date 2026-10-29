import type { Bottle, Shelf } from '../../types/bottle'
import { BottleSlot } from './BottleSlot'
import { EmptySlot } from './EmptySlot'

export function ShelfRow({
  shelf,
  index,
  bottles,
  onSelectBottle,
  matchingIds,
}: {
  shelf: Shelf
  index: number
  bottles: Bottle[]
  onSelectBottle: (bottle: Bottle, originRect: DOMRect) => void
  /** Quando definido, garrafas no conjunto ficam destacadas e as demais esmaecidas. */
  matchingIds?: Set<string> | null
}) {
  const bottleBySlot = new Map(bottles.filter((b) => b.shelf_id === shelf.id).map((b) => [b.slot_index, b]))

  return (
    <div className="rounded-xl bg-cellar-800 p-3">
      <p className="mb-2 text-xs font-medium text-cellar-50/60">
        {shelf.name ?? `Prateleira ${index + 1}`}
      </p>
      <div
        className="grid gap-2"
        style={{ gridTemplateColumns: `repeat(${shelf.capacity}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: shelf.capacity }, (_, slotIndex) => {
          const bottle = bottleBySlot.get(slotIndex)
          if (!bottle) return <EmptySlot key={slotIndex} shelfId={shelf.id} slotIndex={slotIndex} />
          const matchState = !matchingIds ? 'neutral' : matchingIds.has(bottle.id) ? 'match' : 'dim'
          return (
            <BottleSlot key={slotIndex} bottle={bottle} onSelect={onSelectBottle} matchState={matchState} />
          )
        })}
      </div>
    </div>
  )
}
