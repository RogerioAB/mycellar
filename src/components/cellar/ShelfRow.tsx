import type { Bottle, Shelf } from '../../types/bottle'
import { BottleSlot } from './BottleSlot'
import { EmptySlot } from './EmptySlot'

export function ShelfRow({
  shelf,
  index,
  bottles,
}: {
  shelf: Shelf
  index: number
  bottles: Bottle[]
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
          return bottle ? (
            <BottleSlot key={slotIndex} bottle={bottle} />
          ) : (
            <EmptySlot key={slotIndex} shelfId={shelf.id} slotIndex={slotIndex} />
          )
        })}
      </div>
    </div>
  )
}
