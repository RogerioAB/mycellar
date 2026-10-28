import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { BottleForm, type BottleFormValues } from '../components/bottles/BottleForm'
import { PhotoCapture } from '../components/scan/PhotoCapture'
import { ScanPreviewForm } from '../components/scan/ScanPreviewForm'
import { useAuth } from '../hooks/useAuth'
import { useBottles, type BottleFields } from '../hooks/useBottles'
import { useLabelPhotoUrl } from '../hooks/useLabelPhotoUrl'
import { useShelves } from '../hooks/useShelves'
import { uploadLabelPhoto } from '../lib/labelPhoto'
import { listFreeSlots } from '../lib/slots'
import { supabase } from '../lib/supabaseClient'

type EntryMode = 'manual' | 'scan'
type ScanStatus = 'idle' | 'uploading' | 'done' | 'failed'

const SCAN_ERROR_KEYS: Record<string, string> = {
  rate_limited: 'scan.rateLimited',
  ai_not_configured: 'scan.notConfigured',
  photo_not_found: 'scan.genericError',
  ai_request_failed: 'scan.genericError',
  ai_no_extraction: 'scan.extractionFailed',
  unauthorized: 'scan.genericError',
}

export default function AddBottlePage() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { shelves } = useShelves()
  const { bottles, createBottles } = useBottles('active')
  const [mode, setMode] = useState<EntryMode>('manual')
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [scanStatus, setScanStatus] = useState<ScanStatus>('idle')
  const [scanPhotoPath, setScanPhotoPath] = useState<string | null>(null)
  const [scanFields, setScanFields] = useState<Partial<BottleFields> | null>(null)
  const [scanError, setScanError] = useState<string | null>(null)
  const scanPhotoUrl = useLabelPhotoUrl(scanPhotoPath)

  const preferredShelfId = searchParams.get('shelfId')
  const preferredSlot = searchParams.get('slot')
  const preferred =
    preferredShelfId && preferredSlot !== null
      ? { shelfId: preferredShelfId, slotIndex: Number(preferredSlot) }
      : undefined

  async function handlePhotoCaptured(file: File) {
    if (!user) return
    setScanStatus('uploading')
    setScanError(null)
    setScanFields(null)
    try {
      const path = await uploadLabelPhoto(user.id, file)
      setScanPhotoPath(path)

      const { data, error: invokeError } = await supabase.functions.invoke<{
        fields?: Partial<BottleFields>
        error?: string
      }>('scan-label', { body: { storagePath: path } })

      if (invokeError || !data || data.error) {
        // Em erro HTTP (status != 2xx), supabase-js não preenche `data` — o corpo
        // JSON com o código do erro vem em `invokeError.context` (a Response).
        let errorCode = data?.error
        if (!errorCode && invokeError && 'context' in invokeError) {
          const context = (invokeError as { context?: Response }).context
          errorCode = await context?.clone().json().then(
            (body: { error?: string }) => body.error,
            () => undefined,
          )
        }
        const key = errorCode ? SCAN_ERROR_KEYS[errorCode] : undefined
        setScanError(t(key ?? 'scan.extractionFailed'))
        setScanStatus('failed')
        return
      }

      setScanFields(data.fields ?? null)
      setScanStatus('done')
    } catch {
      setScanError(t('scan.genericError'))
      setScanStatus('failed')
    }
  }

  function resetScan() {
    setScanStatus('idle')
    setScanPhotoPath(null)
    setScanFields(null)
    setScanError(null)
    setPhotoFile(null)
  }

  async function handleSubmit(values: BottleFormValues) {
    if (!user) return
    setError(null)

    const freeSlots = listFreeSlots(shelves, bottles, preferred)
    if (freeSlots.length < values.quantity) {
      setError(t('addBottle.notEnoughSlots'))
      return
    }

    setSubmitting(true)
    try {
      const labelPhotoPath = photoFile
        ? await uploadLabelPhoto(user.id, photoFile)
        : (values.label_photo_url ?? null)

      const { quantity, ...fields } = values
      await createBottles({ ...fields, label_photo_url: labelPhotoPath }, freeSlots.slice(0, quantity))
      navigate('/cellar')
    } catch (err) {
      if (err instanceof Error && err.message === 'slot_conflict') {
        setError(t('addBottle.slotConflict'))
      } else {
        setError(t('auth.genericError'))
      }
    } finally {
      setSubmitting(false)
    }
  }

  function handleModeChange(next: EntryMode) {
    setMode(next)
    resetScan()
    setError(null)
  }

  return (
    <div className="px-4 py-6">
      <h1 className="text-xl font-semibold text-cellar-900">{t('addBottle.title')}</h1>

      <div className="mt-4 flex gap-2 rounded-lg bg-cellar-800/10 p-1">
        <button
          type="button"
          onClick={() => handleModeChange('manual')}
          className={`min-h-11 flex-1 rounded-md text-sm font-medium ${
            mode === 'manual' ? 'bg-white text-wine-700 shadow' : 'text-cellar-700'
          }`}
        >
          {t('addBottle.manualTab')}
        </button>
        <button
          type="button"
          onClick={() => handleModeChange('scan')}
          className={`min-h-11 flex-1 rounded-md text-sm font-medium ${
            mode === 'scan' ? 'bg-white text-wine-700 shadow' : 'text-cellar-700'
          }`}
        >
          {t('addBottle.scanTab')}
        </button>
      </div>

      <div className="mt-6">
        {mode === 'manual' ? (
          <>
            <p className="mb-4 text-sm text-cellar-700">{t('addBottle.manualHint')}</p>
            <BottleForm
              mode="create"
              showQuantity={!preferred}
              photoFile={photoFile}
              onPhotoFileChange={setPhotoFile}
              submitting={submitting}
              error={error}
              onSubmit={handleSubmit}
              onCancel={() => navigate('/cellar')}
            />
          </>
        ) : scanStatus === 'idle' || scanStatus === 'uploading' ? (
          <>
            <p className="mb-4 text-sm text-cellar-700">{t('scan.captureHint')}</p>
            <PhotoCapture onCapture={handlePhotoCaptured} disabled={scanStatus === 'uploading'} />
          </>
        ) : (
          <ScanPreviewForm
            photoUrl={scanPhotoUrl}
            extractedFields={scanPhotoPath ? { ...scanFields, label_photo_url: scanPhotoPath } : null}
            extractionError={scanError}
            showQuantity={!preferred}
            submitting={submitting}
            submitError={error}
            photoFile={photoFile}
            onPhotoFileChange={setPhotoFile}
            onSubmit={handleSubmit}
            onCancel={() => navigate('/cellar')}
            onRetryPhoto={resetScan}
          />
        )}
      </div>
    </div>
  )
}
