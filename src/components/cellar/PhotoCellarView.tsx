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
  matchingIds,
}: {
  backgroundImageUrl: string
  shelves: Shelf[]
  bottles: Bottle[]
  onSelectBottle: (bottle: Bottle, originRect: DOMRect) => void
  /** Quando definido, garrafas no conjunto ficam destacadas e as demais esmaecidas. */
  matchingIds?: Set<string> | null
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
            const matchState = !matchingIds ? 'neutral' : matchingIds.has(bottle.id) ? 'match' : 'dim'
            const markerClass =
              matchState === 'match'
                ? 'border-wine-400 ring-4 ring-wine-400/70 shadow-[0_0_14px_rgba(196,73,95,0.9)]'
                : matchState === 'dim'
                  ? 'border-white/40 opacity-30'
                  : 'border-white'
            return (
              <button
                key={`${shelf.id}-${slotIndex}`}
                type="button"
                title={bottle.name}
                style={style}
                onClick={(e) => onSelectBottle(bottle, e.currentTarget.getBoundingClientRect())}
                className={`absolute flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 shadow transition-all ${markerClass}`}
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
