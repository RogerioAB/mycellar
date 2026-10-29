import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { AdBanner } from '../components/ads/AdBanner'
import { BottlePreview } from '../components/cellar/BottlePreview'
import { PhotoCellarView } from '../components/cellar/PhotoCellarView'
import { ShelfRow } from '../components/cellar/ShelfRow'
import { Button } from '../components/ui/Button'
import { useBottles } from '../hooks/useBottles'
import { useProfile } from '../hooks/useProfile'
import { useShelves } from '../hooks/useShelves'
import { supabase } from '../lib/supabaseClient'
import type { Bottle } from '../types/bottle'

export default function CellarPage() {
  const { t } = useTranslation()
  const { shelves, loading: shelvesLoading } = useShelves()
  const { bottles, loading: bottlesLoading, refetch: refetchBottles } = useBottles('active')
  const { profile, loading: profileLoading } = useProfile()
  const loading = shelvesLoading || bottlesLoading || profileLoading
  const unplaced = bottles.filter((b) => b.shelf_id === null)
  const [preview, setPreview] = useState<{ bottle: Bottle; originRect: DOMRect } | null>(null)

  const calibrated = shelves.length > 0 && shelves.every((s) => s.slot_positions.length === s.capacity)
  const usePhotoMode = profile?.display_mode === 'photo' && !!profile.background_image_url && calibrated

  function handleSelectBottle(bottle: Bottle, originRect: DOMRect) {
    setPreview({ bottle, originRect })
  }

  async function handleConsume(bottle: Bottle) {
    await supabase
      .from('bottles')
      .update({ status: 'consumed', consumed_at: new Date().toISOString(), shelf_id: null, slot_index: null })
      .eq('id', bottle.id)
    await refetchBottles()
    setPreview(null)
  }

  return (
    <div className="bg-cellar-900 text-cellar-50">
      <div className="flex items-center justify-between px-4 py-6">
        <h1 className="text-xl font-semibold">{t('nav.cellar')}</h1>
        <Button variant="ghost" className="text-cellar-50" onClick={() => supabase.auth.signOut()}>
          {t('auth.logout')}
        </Button>
      </div>

      {loading ? (
        <p className="px-4 text-cellar-50/60">{t('common.loading')}</p>
      ) : (
        <div className="flex flex-col gap-3">
          {unplaced.length > 0 && (
            <div className="mx-4 rounded-xl border border-wine-400/60 bg-wine-900/40 p-3 text-sm">
              <p className="font-medium">{t('cellar.unplacedTitle', { count: unplaced.length })}</p>
              <ul className="mt-1 flex flex-col gap-1">
                {unplaced.map((b) => (
                  <li key={b.id}>
                    <Link to={`/bottles/${b.id}`} className="underline">
                      {b.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {usePhotoMode ? (
            <PhotoCellarView
              backgroundImageUrl={profile!.background_image_url!}
              shelves={shelves}
              bottles={bottles}
              onSelectBottle={handleSelectBottle}
            />
          ) : (
            <div className="flex flex-col gap-3 px-4">
              {shelves.map((shelf, index) => (
                <ShelfRow
                  key={shelf.id}
                  shelf={shelf}
                  index={index}
                  bottles={bottles}
                  onSelectBottle={handleSelectBottle}
                />
              ))}
            </div>
          )}
        </div>
      )}

      <div className="px-4 py-6">
        <AdBanner />
      </div>

      {preview && (
        <BottlePreview
          bottle={preview.bottle}
          originRect={preview.originRect}
          onClose={() => setPreview(null)}
          onConsume={handleConsume}
        />
      )}
    </div>
  )
}
