import { useTranslation } from 'react-i18next'
import { useBottles } from '../../hooks/useBottles'
import { useShelves } from '../../hooks/useShelves'
import { getOccupiedSet, isSlotOccupied } from '../../lib/slots'

export function SlotPicker({
  onPick,
  disabled,
}: {
  onPick: (shelfId: string, slotIndex: number) => void
  disabled?: boolean
}) {
  const { t } = useTranslation()
  const { shelves, loading: shelvesLoading } = useShelves()
  const { bottles, loading: bottlesLoading } = useBottles('active')
  const occupied = getOccupiedSet(bottles)

  if (shelvesLoading || bottlesLoading) return <p className="text-sm text-cellar-700">{t('common.loading')}</p>

  return (
    <div className="flex flex-col gap-2 rounded-lg bg-cellar-900 p-3">
      {shelves.map((shelf, index) => (
        <div key={shelf.id}>
          <p className="mb-1 text-xs font-medium text-cellar-50/60">
            {shelf.name ?? `Prateleira ${index + 1}`}
          </p>
          <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${shelf.capacity}, minmax(0, 1fr))` }}>
            {Array.from({ length: shelf.capacity }, (_, slotIndex) => {
              const taken = isSlotOccupied(occupied, shelf.id, slotIndex)
              return (
                <button
                  key={slotIndex}
                  type="button"
                  disabled={taken || disabled}
                  onClick={() => onPick(shelf.id, slotIndex)}
                  className={`aspect-[2/3] min-h-11 rounded-md border-2 border-dashed text-sm ${
                    taken
                      ? 'cursor-not-allowed border-cellar-700/20 text-cellar-50/20'
                      : 'border-cellar-50/30 text-cellar-50/60 hover:border-wine-400 hover:text-wine-400'
                  }`}
                >
                  {slotIndex + 1}
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
