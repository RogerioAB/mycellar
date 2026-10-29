import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { AdBanner } from '../components/ads/AdBanner'
import { Button } from '../components/ui/Button'
import { useBottles } from '../hooks/useBottles'
import { supabase } from '../lib/supabaseClient'

export default function HistoryPage() {
  const { t, i18n } = useTranslation()
  const { bottles, loading, refetch } = useBottles('consumed')

  async function handleReactivate(id: string) {
    await supabase.from('bottles').update({ status: 'active', consumed_at: null }).eq('id', id)
    await refetch()
  }

  return (
    <div className="px-4 py-6">
      <h1 className="text-xl font-semibold text-cellar-900">{t('nav.history')}</h1>

      {loading ? (
        <p className="mt-4 text-cellar-700">{t('common.loading')}</p>
      ) : bottles.length === 0 ? (
        <p className="mt-4 text-cellar-700">{t('history.empty')}</p>
      ) : (
        <ul className="mt-4 flex flex-col gap-3">
          {bottles.map((bottle) => (
            <li key={bottle.id} className="rounded-lg border border-cellar-700/20 p-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <Link to={`/bottles/${bottle.id}`} className="font-medium text-cellar-900 underline">
                    {bottle.name}
                  </Link>
                  {bottle.vintage_year && <span className="text-cellar-700"> ({bottle.vintage_year})</span>}
                  {bottle.consumed_at && (
                    <p className="mt-1 text-xs text-cellar-700">
                      {t('history.consumedOn', {
                        date: new Date(bottle.consumed_at).toLocaleDateString(i18n.language),
                      })}
                    </p>
                  )}
                </div>
                <Button variant="secondary" onClick={() => handleReactivate(bottle.id)}>
                  {t('bottle.reactivate')}
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-6">
        <AdBanner />
      </div>
    </div>
  )
}
