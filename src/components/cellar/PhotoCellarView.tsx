import { Link } from 'react-router-dom'
import { useSignedUrl } from '../../hooks/useSignedUrl'
import { getCellarPhotoUrl } from '../../lib/cellarPhoto'
import type { Bottle, Shelf } from '../../types/bottle'
import { BottleIcon } from './BottleIcon'

export function PhotoCellarView({
  backgroundImageUrl,
  shelves,
  bottles,
  onSelectBottle,
}: {
  backgroundImageUrl: string
  shelves: Shelf[]
  bottles: Bottle[]
  onSelectBottle: (bottle: Bottle, originRect: DOMRect) => void
}) {
  const photoUrl = useSignedUrl(backgroundImageUrl, getCellarPhotoUrl)
  const bottleByShelfSlot = new Map(bottles.map((b) => [`${b.shelf_id}:${b.slot_index}`, b]))

  if (!photoUrl) return null

  return (
    <div className="relative">
      <img src={photoUrl} alt="" className="w-full" />
      {shelves.flatMap((shelf) =>
        shelf.slot_positions.map((pos, slotIndex) => {
          const bottle = bottleByShelfSlot.get(`${shelf.id}:${slotIndex}`)
          const style = { left: `${pos.x}%`, top: `${pos.y}%` }

          if (bottle) {
            return (
              <button
                key={`${shelf.id}-${slotIndex}`}
                type="button"
                title={bottle.name}
                style={style}
                onClick={(e) => onSelectBottle(bottle, e.currentTarget.getBoundingClientRect())}
                className="absolute flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white shadow"
              >
                <BottleIcon wineType={bottle.wine_type} className="h-5 w-5" />
              </button>
            )
          }

          return (
            <Link
              key={`${shelf.id}-${slotIndex}`}
              to={`/bottles/add?shelfId=${shelf.id}&slot=${slotIndex}`}
              aria-label="Adicionar garrafa nesta posição"
              style={style}
              className="absolute flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-dashed border-white/70 bg-black/20 text-sm text-white/80"
            >
              +
            </Link>
          )
        }),
      )}
    </div>
  )
}
