import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Navigate, useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { useShelves } from '../hooks/useShelves'

export default function OnboardingLayoutPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { shelves, loading, createShelves } = useShelves()
  const [shelfCount, setShelfCount] = useState(4)
  const [capacity, setCapacity] = useState(5)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  if (!loading && shelves.length > 0) return <Navigate to="/cellar" replace />

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await createShelves(shelfCount, capacity)
      navigate('/cellar')
    } catch {
      setError(t('onboarding.error'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-full max-w-sm flex-col justify-center px-6 py-10">
      <h1 className="text-2xl font-semibold text-cellar-900">{t('onboarding.title')}</h1>
      <p className="mt-2 text-cellar-700">{t('onboarding.subtitle')}</p>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-5">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-cellar-900">{t('onboarding.shelfCount')}</span>
          <Input
            type="number"
            inputMode="numeric"
            min={1}
            max={20}
            required
            value={shelfCount}
            onChange={(e) => setShelfCount(Number(e.target.value))}
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-cellar-900">{t('onboarding.capacityPerShelf')}</span>
          <Input
            type="number"
            inputMode="numeric"
            min={1}
            max={50}
            required
            value={capacity}
            onChange={(e) => setCapacity(Number(e.target.value))}
          />
          <span className="text-xs text-cellar-700">{t('onboarding.capacityHint')}</span>
        </label>

        {error && <p className="text-sm text-wine-700">{error}</p>}

        <Button type="submit" disabled={submitting}>
          {submitting ? t('common.loading') : t('onboarding.cta')}
        </Button>
      </form>
    </div>
  )
}
