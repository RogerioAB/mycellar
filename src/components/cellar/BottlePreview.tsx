import { useEffect, useState, type CSSProperties } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { useLabelPhotoUrl } from '../../hooks/useLabelPhotoUrl'
import type { Bottle } from '../../types/bottle'
import { BottleIcon } from './BottleIcon'

export function BottlePreview({
  bottle,
  originRect,
  onClose,
  onConsume,
}: {
  bottle: Bottle
  originRect: DOMRect
  onClose: () => void
  onConsume: (bottle: Bottle) => Promise<void>
}) {
  const { t } = useTranslation()
  const photoUrl = useLabelPhotoUrl(bottle.label_photo_url)
  const [expanded, setExpanded] = useState(false)
  const [consuming, setConsuming] = useState(false)

  useEffect(() => {
    const frame = requestAnimationFrame(() => setExpanded(true))
    return () => cancelAnimationFrame(frame)
  }, [])

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  function handleClose() {
    setExpanded(false)
    setTimeout(onClose, 250)
  }

  async function handleConsume() {
    setConsuming(true)
    try {
      await onConsume(bottle)
    } finally {
      setConsuming(false)
    }
  }

  const collapsedStyle: CSSProperties = {
    top: originRect.top,
    left: originRect.left,
    width: originRect.width,
    height: originRect.height,
    borderRadius: 8,
  }
  const expandedStyle: CSSProperties = {
    top: '50%',
    left: '50%',
    width: 'min(78vw, 300px)',
    height: 'min(62vh, 440px)',
    transform: 'translate(-50%, -50%)',
    borderRadius: 16,
  }

  return (
    <div className="fixed inset-0 z-50" onClick={handleClose}>
      <div
        className={`absolute inset-0 bg-black transition-opacity duration-300 ${expanded ? 'opacity-70' : 'opacity-0'}`}
      />
      <div
        onClick={(e) => e.stopPropagation()}
        style={expanded ? expandedStyle : collapsedStyle}
        className="fixed flex flex-col items-center justify-center gap-3 overflow-hidden bg-cellar-800 p-5 shadow-2xl transition-all duration-300 ease-out"
      >
        {photoUrl ? (
          <img src={photoUrl} alt="" className="max-h-[55%] rounded-lg object-contain" />
        ) : (
          <BottleIcon wineType={bottle.wine_type} className="h-1/2" />
        )}

        {expanded && (
          <div className="flex flex-col items-center gap-2 text-center text-cellar-50">
            <p className="font-semibold">{bottle.name}</p>
            {bottle.vintage_year && <p className="text-sm text-cellar-50/70">{bottle.vintage_year}</p>}

            <div className="mt-2 flex items-center gap-5">
              <button
                type="button"
                onClick={handleClose}
                aria-label={t('bottlePreview.putBack')}
                title={t('bottlePreview.putBack')}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-cellar-900/60 text-xl hover:bg-cellar-900"
              >
                ↩️
              </button>
              <button
                type="button"
                disabled={consuming}
                onClick={handleConsume}
                aria-label={t('bottlePreview.consume')}
                title={t('bottlePreview.consume')}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-cellar-900/60 text-xl hover:bg-cellar-900 disabled:opacity-50"
              >
                🥂
              </button>
              <Link
                to={`/bottles/${bottle.id}`}
                aria-label={t('bottlePreview.details')}
                title={t('bottlePreview.details')}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-cellar-900/60 text-xl hover:bg-cellar-900"
              >
                ℹ️
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
