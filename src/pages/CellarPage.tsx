import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { ShelfRow } from '../components/cellar/ShelfRow'
import { Button } from '../components/ui/Button'
import { useBottles } from '../hooks/useBottles'
import { useShelves } from '../hooks/useShelves'
import { supabase } from '../lib/supabaseClient'

export default function CellarPage() {
  const { t } = useTranslation()
  const { shelves, loading: shelvesLoading } = useShelves()
  const { bottles, loading: bottlesLoading } = useBottles('active')
  const loading = shelvesLoading || bottlesLoading
  const unplaced = bottles.filter((b) => b.shelf_id === null)

  return (
    <div className="bg-cellar-900 px-4 py-6 text-cellar-50">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">{t('nav.cellar')}</h1>
        <Button variant="ghost" className="text-cellar-50" onClick={() => supabase.auth.signOut()}>
          {t('auth.logout')}
        </Button>
      </div>

      {loading ? (
        <p className="text-cellar-50/60">{t('common.loading')}</p>
      ) : (
        <div className="flex flex-col gap-3">
          {unplaced.length > 0 && (
            <div className="rounded-xl border border-wine-400/60 bg-wine-900/40 p-3 text-sm">
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
          {shelves.map((shelf, index) => (
            <ShelfRow key={shelf.id} shelf={shelf} index={index} bottles={bottles} />
          ))}
        </div>
      )}
    </div>
  )
}
