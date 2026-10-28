import imageCompression from 'browser-image-compression'
import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '../ui/Button'

export function PhotoCapture({ onCapture, disabled }: { onCapture: (file: File) => void; disabled?: boolean }) {
  const { t } = useTranslation()
  const inputRef = useRef<HTMLInputElement>(null)
  const [compressing, setCompressing] = useState(false)

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setCompressing(true)
    try {
      const compressed = await imageCompression(file, {
        maxWidthOrHeight: 1280,
        maxSizeMB: 1,
        useWebWorker: true,
      })
      onCapture(compressed)
    } finally {
      setCompressing(false)
    }
  }

  const busy = compressing || disabled

  return (
    <div className="flex flex-col items-center gap-4 rounded-xl border-2 border-dashed border-cellar-700/30 px-6 py-10 text-center">
      <p className="text-5xl" aria-hidden>
        📷
      </p>
      <p className="text-sm text-cellar-700">{t('scan.hint')}</p>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleChange}
        className="hidden"
      />
      <Button type="button" disabled={busy} onClick={() => inputRef.current?.click()}>
        {busy ? t('common.loading') : t('scan.takePhoto')}
      </Button>
    </div>
  )
}
