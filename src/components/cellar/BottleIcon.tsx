import type { WineType } from '../../types/bottle'

const COLORS: Record<WineType, string> = {
  tinto: '#6d1828',
  branco: '#e9d9a0',
  rose: '#e8a0a8',
  espumante: '#d4af37',
  fortificado: '#4a0f1b',
  outro: '#8a8577',
}

export function BottleIcon({ wineType, className = '' }: { wineType: WineType; className?: string }) {
  const color = COLORS[wineType]
  return (
    <svg viewBox="0 0 24 48" className={className} aria-hidden>
      <path
        d="M10 2h4v6c0 1.2.8 2 1.8 3 1.4 1.3 2.2 2.8 2.2 5.5V44a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2V16.5c0-2.7.8-4.2 2.2-5.5 1-.9 1.8-1.8 1.8-3V2Z"
        fill={color}
        stroke="rgba(0,0,0,0.25)"
        strokeWidth="1"
      />
      <rect x="10" y="1" width="4" height="4" rx="0.5" fill={color} />
    </svg>
  )
}
