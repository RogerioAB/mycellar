import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '../ui/Button'
import { useAuth } from '../../hooks/useAuth'
import { supabase } from '../../lib/supabaseClient'
import type { Bottle } from '../../types/bottle'

const CSV_COLUMNS: (keyof Bottle)[] = [
  'name',
  'wine_type',
  'grapes',
  'country',
  'region',
  'winery',
  'vintage_year',
  'rating',
  'tasting_notes',
  'status',
  'consumed_at',
  'created_at',
]

function toCsvValue(value: unknown): string {
  if (value === null || value === undefined) return ''
  const str = Array.isArray(value) ? value.join('; ') : String(value)
  if (/[",\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`
  return str
}

function buildCsv(bottles: Bottle[]): string {
  const header = CSV_COLUMNS.join(',')
  const rows = bottles.map((b) => CSV_COLUMNS.map((col) => toCsvValue(b[col])).join(','))
  return [header, ...rows].join('\n')
}

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export function ExportDataButton() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [exporting, setExporting] = useState(false)

  async function handleExport(format: 'csv' | 'json') {
    if (!user) return
    setExporting(true)
    try {
      const { data } = await supabase.from('bottles').select('*').eq('user_id', user.id).order('created_at')
      const bottles = data ?? []
      const date = new Date().toISOString().slice(0, 10)
      if (format === 'csv') {
        downloadFile(buildCsv(bottles), `mycellar-${date}.csv`, 'text/csv;charset=utf-8')
      } else {
        downloadFile(JSON.stringify(bottles, null, 2), `mycellar-${date}.json`, 'application/json')
      }
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="flex gap-3">
      <Button variant="secondary" disabled={exporting} onClick={() => handleExport('csv')}>
        {exporting ? t('common.loading') : t('settings.exportCsv')}
      </Button>
      <Button variant="secondary" disabled={exporting} onClick={() => handleExport('json')}>
        {exporting ? t('common.loading') : t('settings.exportJson')}
      </Button>
    </div>
  )
}
