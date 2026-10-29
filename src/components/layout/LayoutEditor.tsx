import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useBottles } from '../../hooks/useBottles'
import { useShelves } from '../../hooks/useShelves'
import { supabase } from '../../lib/supabaseClient'
import type { Bottle, Shelf } from '../../types/bottle'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'

type PendingAction =
  | { type: 'capacity'; shelf: Shelf; newCapacity: number; affected: Bottle[] }
  | { type: 'remove'; shelf: Shelf; affected: Bottle[] }

export function LayoutEditor() {
  const { t } = useTranslation()
  const { shelves, loading: shelvesLoading, addShelf, updateShelfCapacity, removeShelf } = useShelves()
  const { bottles, loading: bottlesLoading, refetch: refetchBottles } = useBottles('active')
  const [capacityDrafts, setCapacityDrafts] = useState<Record<string, string>>({})
  const [pending, setPending] = useState<PendingAction | null>(null)
  const [applying, setApplying] = useState(false)
  const [newShelfCapacity, setNewShelfCapacity] = useState(5)
  const [addingShelf, setAddingShelf] = useState(false)

  const loading = shelvesLoading || bottlesLoading

  function bottlesOnShelf(shelfId: string) {
    return bottles.filter((b) => b.shelf_id === shelfId)
  }

  async function handleCapacitySave(shelf: Shelf) {
    const draft = capacityDrafts[shelf.id]
    const newCapacity = draft !== undefined ? Number(draft) : shelf.capacity
    if (!newCapacity || newCapacity === shelf.capacity) return

    const affected = bottlesOnShelf(shelf.id).filter((b) => (b.slot_index ?? 0) >= newCapacity)
    if (affected.length > 0) {
      setPending({ type: 'capacity', shelf, newCapacity, affected })
      return
    }
    await updateShelfCapacity(shelf.id, newCapacity)
  }

  async function handleRemove(shelf: Shelf) {
    const affected = bottlesOnShelf(shelf.id)
    if (affected.length > 0) {
      setPending({ type: 'remove', shelf, affected })
      return
    }
    await removeShelf(shelf.id)
  }

  async function confirmPending() {
    if (!pending) return
    setApplying(true)
    try {
      const ids = pending.affected.map((b) => b.id)
      await supabase.from('bottles').update({ shelf_id: null, slot_index: null }).in('id', ids)
      await refetchBottles()

      if (pending.type === 'capacity') {
        await updateShelfCapacity(pending.shelf.id, pending.newCapacity)
      } else {
        await removeShelf(pending.shelf.id)
      }
      setPending(null)
    } finally {
      setApplying(false)
    }
  }

  async function handleAddShelf() {
    setAddingShelf(true)
    try {
      await addShelf(newShelfCapacity)
      setNewShelfCapacity(5)
    } finally {
      setAddingShelf(false)
    }
  }

  if (loading) return <p className="text-sm text-cellar-700">{t('common.loading')}</p>

  return (
    <div className="flex flex-col gap-4">
      {pending && (
        <div className="rounded-lg border border-wine-400 bg-wine-50 p-3">
          <p className="text-sm font-medium text-wine-900">
            {pending.type === 'capacity' ? t('layoutEditor.affectedCapacity') : t('layoutEditor.affectedRemove')}
          </p>
          <ul className="mt-1 list-inside list-disc text-sm text-wine-700">
            {pending.affected.map((b) => (
              <li key={b.id}>{b.name}</li>
            ))}
          </ul>
          <div className="mt-3 flex gap-2">
            <Button variant="secondary" className="flex-1" onClick={() => setPending(null)}>
              {t('common.cancel')}
            </Button>
            <Button className="flex-1" disabled={applying} onClick={confirmPending}>
              {applying ? t('common.loading') : t('layoutEditor.unassignAndContinue')}
            </Button>
          </div>
        </div>
      )}

      <ul className="flex flex-col gap-3">
        {shelves.map((shelf, index) => (
          <li key={shelf.id} className="flex flex-col gap-2 rounded-lg border border-cellar-700/20 p-3">
            <div className="flex items-center gap-3">
              <span className="flex-1 text-sm font-medium text-cellar-900">
                {shelf.name ?? `Prateleira ${index + 1}`}
              </span>
              <div className="w-16 shrink-0">
                <Input
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={50}
                  className="px-2"
                  value={capacityDrafts[shelf.id] ?? shelf.capacity}
                  onChange={(e) => setCapacityDrafts((prev) => ({ ...prev, [shelf.id]: e.target.value }))}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" className="flex-1" onClick={() => handleCapacitySave(shelf)}>
                {t('common.save')}
              </Button>
              <Button variant="ghost" className="flex-1 text-wine-700" onClick={() => handleRemove(shelf)}>
                {t('common.delete')}
              </Button>
            </div>
          </li>
        ))}
      </ul>

      <div className="flex items-end gap-3 rounded-lg border border-dashed border-cellar-700/30 p-3">
        <label className="flex flex-1 flex-col gap-1.5">
          <span className="text-sm font-medium text-cellar-900">{t('layoutEditor.newShelfCapacity')}</span>
          <Input
            type="number"
            inputMode="numeric"
            min={1}
            max={50}
            value={newShelfCapacity}
            onChange={(e) => setNewShelfCapacity(Number(e.target.value))}
          />
        </label>
        <Button disabled={addingShelf} onClick={handleAddShelf}>
          {addingShelf ? t('common.loading') : t('layoutEditor.addShelf')}
        </Button>
      </div>
    </div>
  )
}
