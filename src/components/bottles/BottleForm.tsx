import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
import { Textarea } from '../ui/Textarea'
import { WINE_TYPES, type WineType } from '../../types/bottle'
import type { BottleFields } from '../../hooks/useBottles'

export interface BottleFormValues extends BottleFields {
  quantity: number
}

interface Props {
  mode: 'create' | 'edit'
  initial?: Partial<BottleFormValues>
  photoFile: File | null
  onPhotoFileChange: (file: File | null) => void
  existingPhotoUrl?: string | null
  submitting: boolean
  error?: string | null
  onSubmit: (values: BottleFormValues) => void
  onCancel?: () => void
  /** Mostra o campo de quantidade — só faz sentido quando não há um slot específico já escolhido. */
  showQuantity?: boolean
}

export function BottleForm({
  mode,
  initial,
  photoFile,
  onPhotoFileChange,
  existingPhotoUrl,
  submitting,
  error,
  onSubmit,
  onCancel,
  showQuantity = true,
}: Props) {
  const { t } = useTranslation()
  const [name, setName] = useState(initial?.name ?? '')
  const [wineType, setWineType] = useState<WineType>(initial?.wine_type ?? 'tinto')
  const [grapes, setGrapes] = useState((initial?.grapes ?? []).join(', '))
  const [country, setCountry] = useState(initial?.country ?? '')
  const [region, setRegion] = useState(initial?.region ?? '')
  const [winery, setWinery] = useState(initial?.winery ?? '')
  const [vintageYear, setVintageYear] = useState(initial?.vintage_year?.toString() ?? '')
  const [rating, setRating] = useState(initial?.rating?.toString() ?? '')
  const [tastingNotes, setTastingNotes] = useState(initial?.tasting_notes ?? '')
  const [quantity, setQuantity] = useState(initial?.quantity ?? 1)

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    onSubmit({
      name: name.trim(),
      wine_type: wineType,
      grapes: grapes.trim() ? grapes.split(',').map((g) => g.trim()).filter(Boolean) : null,
      country: country.trim() || null,
      region: region.trim() || null,
      winery: winery.trim() || null,
      vintage_year: vintageYear ? Number(vintageYear) : null,
      rating: rating ? Number(rating) : null,
      tasting_notes: tastingNotes.trim() || null,
      label_photo_url: initial?.label_photo_url ?? null,
      quantity,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-cellar-900">{t('bottle.name')}</span>
        <Input required value={name} onChange={(e) => setName(e.target.value)} />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-cellar-900">{t('bottle.type')}</span>
        <Select value={wineType} onChange={(e) => setWineType(e.target.value as WineType)}>
          {WINE_TYPES.map((type) => (
            <option key={type} value={type}>
              {t(`bottle.types.${type}`)}
            </option>
          ))}
        </Select>
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-cellar-900">{t('bottle.grapes')}</span>
        <Input
          value={grapes}
          onChange={(e) => setGrapes(e.target.value)}
          placeholder={t('bottle.grapesPlaceholder')}
        />
      </label>

      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-cellar-900">{t('bottle.country')}</span>
          <Input value={country} onChange={(e) => setCountry(e.target.value)} />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-cellar-900">{t('bottle.region')}</span>
          <Input value={region} onChange={(e) => setRegion(e.target.value)} />
        </label>
      </div>

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-cellar-900">{t('bottle.winery')}</span>
        <Input value={winery} onChange={(e) => setWinery(e.target.value)} />
      </label>

      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-cellar-900">{t('bottle.vintageYear')}</span>
          <Input
            type="number"
            inputMode="numeric"
            min={1900}
            max={2100}
            value={vintageYear}
            onChange={(e) => setVintageYear(e.target.value)}
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-cellar-900">{t('bottle.rating')}</span>
          <Input
            type="number"
            inputMode="decimal"
            min={0}
            max={5}
            step={0.5}
            value={rating}
            onChange={(e) => setRating(e.target.value)}
          />
        </label>
      </div>

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-cellar-900">{t('bottle.tastingNotes')}</span>
        <Textarea rows={3} value={tastingNotes} onChange={(e) => setTastingNotes(e.target.value)} />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-cellar-900">{t('bottle.photo')}</span>
        {existingPhotoUrl && !photoFile && (
          <img src={existingPhotoUrl} alt="" className="h-32 w-24 rounded-md object-cover" />
        )}
        <input
          type="file"
          accept="image/*"
          onChange={(e) => onPhotoFileChange(e.target.files?.[0] ?? null)}
          className="text-sm"
        />
      </label>

      {mode === 'create' && showQuantity && (
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-cellar-900">{t('bottle.quantity')}</span>
          <Input
            type="number"
            inputMode="numeric"
            min={1}
            max={50}
            required
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
          />
          <span className="text-xs text-cellar-700">{t('bottle.quantityHint')}</span>
        </label>
      )}

      {error && <p className="text-sm text-wine-700">{error}</p>}

      <div className="flex gap-3">
        {onCancel && (
          <Button type="button" variant="secondary" className="flex-1" onClick={onCancel}>
            {t('common.cancel')}
          </Button>
        )}
        <Button type="submit" className="flex-1" disabled={submitting}>
          {submitting ? t('common.loading') : t('common.save')}
        </Button>
      </div>
    </form>
  )
}
