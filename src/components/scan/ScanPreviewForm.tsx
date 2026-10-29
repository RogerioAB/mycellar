import { useTranslation } from 'react-i18next'
import { BottleForm, type BottleFormValues } from '../bottles/BottleForm'
import { Button } from '../ui/Button'
import type { BottleFields } from '../../hooks/useBottles'

interface Props {
  photoUrl: string | null
  extractedFields: Partial<BottleFields> | null
  extractionError: string | null
  submitting: boolean
  submitError: string | null
  photoFile: File | null
  onPhotoFileChange: (file: File | null) => void
  onSubmit: (values: BottleFormValues) => void
  onCancel: () => void
  onRetryPhoto: () => void
}

export function ScanPreviewForm({
  photoUrl,
  extractedFields,
  extractionError,
  submitting,
  submitError,
  photoFile,
  onPhotoFileChange,
  onSubmit,
  onCancel,
  onRetryPhoto,
}: Props) {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col gap-4">
      {extractionError ? (
        <p className="text-sm text-wine-700">{extractionError}</p>
      ) : (
        <p className="text-sm text-cellar-700">{t('scan.reviewHint')}</p>
      )}

      <Button type="button" variant="ghost" className="self-start" onClick={onRetryPhoto}>
        {t('scan.retakePhoto')}
      </Button>

      <BottleForm
        key={photoUrl ?? 'scan'}
        initial={extractedFields ?? undefined}
        existingPhotoUrl={photoUrl}
        photoFile={photoFile}
        onPhotoFileChange={onPhotoFileChange}
        submitting={submitting}
        error={submitError}
        onSubmit={onSubmit}
        onCancel={onCancel}
      />
    </div>
  )
}
