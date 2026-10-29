import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'
import { BottleForm, type BottleFormValues } from '../components/bottles/BottleForm'
import { SlotPicker } from '../components/bottles/SlotPicker'
import { Button } from '../components/ui/Button'
import { useAuth } from '../hooks/useAuth'
import { useLabelPhotoUrl } from '../hooks/useLabelPhotoUrl'
import { useShelves } from '../hooks/useShelves'
import { supabase } from '../lib/supabaseClient'
import { uploadLabelPhoto } from '../lib/labelPhoto'
import type { Bottle } from '../types/bottle'

const UNIQUE_VIOLATION = '23505'

export default function BottleDetailPage() {
  const { t } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()
  const { shelves } = useShelves()

  const [bottle, setBottle] = useState<Bottle | null>(null)
  const [loading, setLoading] = useState(true)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [statusChanging, setStatusChanging] = useState(false)
  const [pickingSlot, setPickingSlot] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [slotError, setSlotError] = useState<string | null>(null)

  const photoUrl = useLabelPhotoUrl(bottle?.label_photo_url ?? null)

  const load = useCallback(async () => {
    if (!id) return
    setLoading(true)
    const { data } = await supabase.from('bottles').select('*').eq('id', id).maybeSingle()
    setBottle(data)
    setLoading(false)
  }, [id])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- busca inicial de dados no mount
    void load()
  }, [load])

  async function handleSubmit(values: BottleFormValues) {
    if (!id || !user) return
    setError(null)
    setSubmitting(true)
    try {
      let labelPhotoPath = bottle?.label_photo_url ?? null
      if (photoFile) {
        labelPhotoPath = await uploadLabelPhoto(user.id, photoFile)
      }
      const { error } = await supabase
        .from('bottles')
        .update({
          name: values.name,
          wine_type: values.wine_type,
          grapes: values.grapes,
          country: values.country,
          region: values.region,
          winery: values.winery,
          vintage_year: values.vintage_year,
          rating: values.rating,
          tasting_notes: values.tasting_notes,
          label_photo_url: labelPhotoPath,
        })
        .eq('id', id)
      if (error) throw error
      navigate('/cellar')
    } catch {
      setError(t('auth.genericError'))
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete() {
    if (!id) return
    setDeleting(true)
    const { error } = await supabase.from('bottles').delete().eq('id', id)
    setDeleting(false)
    if (error) {
      setError(t('auth.genericError'))
      return
    }
    navigate('/cellar')
  }

  async function handleMarkConsumed() {
    if (!id) return
    setStatusChanging(true)
    const { error } = await supabase
      .from('bottles')
      .update({ status: 'consumed', consumed_at: new Date().toISOString(), shelf_id: null, slot_index: null })
      .eq('id', id)
    setStatusChanging(false)
    if (error) {
      setError(t('auth.genericError'))
      return
    }
    navigate('/history')
  }

  async function handleReactivate() {
    if (!id) return
    setStatusChanging(true)
    const { error } = await supabase
      .from('bottles')
      .update({ status: 'active', consumed_at: null })
      .eq('id', id)
    setStatusChanging(false)
    if (error) {
      setError(t('auth.genericError'))
      return
    }
    await load()
  }

  async function handlePickSlot(shelfId: string, slotIndex: number) {
    if (!id) return
    setSlotError(null)
    const { error } = await supabase
      .from('bottles')
      .update({ shelf_id: shelfId, slot_index: slotIndex })
      .eq('id', id)
    if (error) {
      setSlotError(error.code === UNIQUE_VIOLATION ? t('addBottle.slotConflict') : t('auth.genericError'))
      return
    }
    setPickingSlot(false)
    await load()
  }

  if (loading) {
    return (
      <div className="px-4 py-6">
        <p className="text-cellar-700">{t('common.loading')}</p>
      </div>
    )
  }

  if (!bottle) {
    return (
      <div className="px-4 py-6">
        <p className="text-cellar-700">{t('bottle.notFound')}</p>
      </div>
    )
  }

  const shelf = shelves.find((s) => s.id === bottle.shelf_id)
  const shelfIndex = shelves.findIndex((s) => s.id === bottle.shelf_id)

  return (
    <div className="px-4 py-6">
      <h1 className="text-xl font-semibold text-cellar-900">{bottle.name}</h1>

      <div className="mt-4 rounded-lg border border-cellar-700/20 p-3">
        <p className="text-sm font-medium text-cellar-900">{t('bottle.position')}</p>
        {bottle.shelf_id !== null && bottle.slot_index !== null ? (
          <p className="mt-1 text-sm text-cellar-700">
            {t('bottle.positionValue', {
              shelf: shelf?.name ?? `Prateleira ${shelfIndex + 1}`,
              slot: bottle.slot_index + 1,
            })}
          </p>
        ) : (
          <>
            <p className="mt-1 text-sm text-wine-700">{t('bottle.noPosition')}</p>
            {pickingSlot ? (
              <div className="mt-2">
                <SlotPicker onPick={handlePickSlot} />
                {slotError && <p className="mt-2 text-sm text-wine-700">{slotError}</p>}
                <Button variant="ghost" className="mt-2" onClick={() => setPickingSlot(false)}>
                  {t('common.cancel')}
                </Button>
              </div>
            ) : (
              <Button variant="secondary" className="mt-2" onClick={() => setPickingSlot(true)}>
                {t('bottle.choosePosition')}
              </Button>
            )}
          </>
        )}
      </div>

      <div className="mt-4">
        {bottle.status === 'active' ? (
          <Button variant="secondary" disabled={statusChanging} onClick={() => void handleMarkConsumed()}>
            {statusChanging ? t('common.loading') : t('bottle.markConsumed')}
          </Button>
        ) : (
          <Button variant="secondary" disabled={statusChanging} onClick={() => void handleReactivate()}>
            {statusChanging ? t('common.loading') : t('bottle.reactivate')}
          </Button>
        )}
      </div>

      <div className="mt-6">
        <BottleForm
          initial={{
            name: bottle.name,
            wine_type: bottle.wine_type,
            grapes: bottle.grapes,
            country: bottle.country,
            region: bottle.region,
            winery: bottle.winery,
            vintage_year: bottle.vintage_year,
            rating: bottle.rating,
            tasting_notes: bottle.tasting_notes,
            label_photo_url: bottle.label_photo_url,
          }}
          existingPhotoUrl={photoUrl}
          photoFile={photoFile}
          onPhotoFileChange={setPhotoFile}
          submitting={submitting}
          error={error}
          onSubmit={handleSubmit}
          onCancel={() => navigate('/cellar')}
        />
      </div>

      <div className="mt-8 border-t border-cellar-700/20 pt-4">
        {confirmingDelete ? (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-cellar-700">{t('bottle.confirmDelete')}</p>
            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={() => setConfirmingDelete(false)}>
                {t('common.cancel')}
              </Button>
              <Button
                className="flex-1 !bg-wine-900 hover:!bg-wine-700"
                disabled={deleting}
                onClick={handleDelete}
              >
                {deleting ? t('common.loading') : t('common.delete')}
              </Button>
            </div>
          </div>
        ) : (
          <Button variant="ghost" className="text-wine-700" onClick={() => setConfirmingDelete(true)}>
            {t('common.delete')}
          </Button>
        )}
      </div>
    </div>
  )
}
