import { useRef, useState, type MouseEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { useProfile } from '../../hooks/useProfile'
import { useShelves } from '../../hooks/useShelves'
import { useSignedUrl } from '../../hooks/useSignedUrl'
import { getCellarPhotoUrl, uploadCellarPhoto } from '../../lib/cellarPhoto'
import { useAuth } from '../../hooks/useAuth'
import { Button } from '../ui/Button'

export function PhotoCalibrator() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const { profile, loading: profileLoading, updateProfile } = useProfile()
  const { shelves, loading: shelvesLoading, updateShelfSlotPositions } = useShelves()
  const photoUrl = useSignedUrl(profile?.background_image_url ?? null, getCellarPhotoUrl)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [pendingMarker, setPendingMarker] = useState<{ x: number; y: number } | null>(null)
  const imgRef = useRef<HTMLImageElement>(null)

  const loading = profileLoading || shelvesLoading

  const incompleteShelf = shelves.find((s) => s.slot_positions.length !== s.capacity)
  const allCalibrated = shelves.length > 0 && !incompleteShelf

  async function handleUpload(file: File) {
    if (!user) return
    setUploading(true)
    try {
      const path = await uploadCellarPhoto(user.id, file)
      await updateProfile({ background_image_url: path, display_mode: 'illustrated' })
    } finally {
      setUploading(false)
    }
  }

  async function handleImageClick(e: MouseEvent<HTMLImageElement>) {
    // Trava cliques repetidos enquanto a posição anterior ainda está salvando —
    // sem isso, um segundo toque antes do app responder visualmente duplicava
    // o ponto (o usuário tocava de novo achando que não tinha registrado).
    if (!incompleteShelf || !imgRef.current || saving) return

    const rect = imgRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100

    setSaving(true)
    setPendingMarker({ x, y })
    try {
      const next = [...incompleteShelf.slot_positions, { x, y }]
      await updateShelfSlotPositions(incompleteShelf.id, next)

      const stillIncomplete = shelves.some((s) => {
        const positions = s.id === incompleteShelf.id ? next : s.slot_positions
        return positions.length !== s.capacity
      })
      if (!stillIncomplete) {
        await updateProfile({ display_mode: 'photo' })
      }
    } finally {
      setPendingMarker(null)
      setSaving(false)
    }
  }

  async function handleRecalibrateShelf(shelfId: string) {
    await updateShelfSlotPositions(shelfId, [])
    await updateProfile({ display_mode: 'illustrated' })
  }

  async function handleRemovePhoto() {
    await updateProfile({ background_image_url: null, display_mode: 'illustrated' })
    await Promise.all(shelves.map((s) => updateShelfSlotPositions(s.id, [])))
  }

  if (loading) return <p className="text-sm text-cellar-700">{t('common.loading')}</p>

  if (!profile?.background_image_url) {
    return (
      <div className="flex flex-col gap-2">
        <p className="text-sm text-cellar-700">{t('photoCalibrator.uploadHint')}</p>
        <input
          type="file"
          accept="image/*"
          disabled={uploading}
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) void handleUpload(file)
          }}
          className="text-sm"
        />
        {uploading && <p className="text-sm text-cellar-700">{t('common.loading')}</p>}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {allCalibrated ? (
        <p className="text-sm text-wine-700">{t('photoCalibrator.complete')}</p>
      ) : (
        <p className="text-sm text-cellar-700">
          {t('photoCalibrator.calibratingHint', {
            shelf: incompleteShelf?.name ?? `Prateleira ${shelves.indexOf(incompleteShelf!) + 1}`,
            placed: incompleteShelf?.slot_positions.length ?? 0,
            total: incompleteShelf?.capacity ?? 0,
          })}
          {saving && ` ${t('photoCalibrator.saving')}`}
        </p>
      )}

      <div className="relative inline-block">
        {photoUrl && (
          <img
            ref={imgRef}
            src={photoUrl}
            alt=""
            onClick={handleImageClick}
            className={`w-full rounded-lg ${
              incompleteShelf && !saving ? 'cursor-crosshair' : ''
            } ${saving ? 'opacity-80' : ''}`}
          />
        )}
        {shelves.flatMap((shelf) =>
          shelf.slot_positions.map((pos, i) => (
            <span
              key={`${shelf.id}-${i}`}
              className="absolute flex h-6 w-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-wine-700 text-xs font-medium text-white shadow"
              style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
            >
              {i + 1}
            </span>
          )),
        )}
        {pendingMarker && (
          <span
            className="absolute flex h-6 w-6 -translate-x-1/2 -translate-y-1/2 animate-pulse items-center justify-center rounded-full bg-wine-700/50 text-xs font-medium text-white shadow"
            style={{ left: `${pendingMarker.x}%`, top: `${pendingMarker.y}%` }}
          >
            …
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {shelves.map((shelf, index) => (
          <Button key={shelf.id} variant="secondary" onClick={() => handleRecalibrateShelf(shelf.id)}>
            {t('photoCalibrator.recalibrate', { shelf: shelf.name ?? `Prateleira ${index + 1}` })}
          </Button>
        ))}
      </div>

      <Button variant="ghost" className="self-start text-wine-700" onClick={handleRemovePhoto}>
        {t('photoCalibrator.removePhoto')}
      </Button>
    </div>
  )
}
