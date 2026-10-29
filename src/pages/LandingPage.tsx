import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { AdBanner } from '../components/ads/AdBanner'

export default function LandingPage() {
  const { t } = useTranslation()

  return (
    <div className="flex min-h-full flex-col bg-cellar-900 text-wine-50">
      <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
        <h1 className="text-4xl font-semibold">{t('app.name')}</h1>
        <p className="max-w-sm text-cellar-700">
          Organize sua adega, acompanhe cada garrafa e nunca mais esqueça o que tem guardado.
        </p>
        <div className="flex gap-3">
          <Link to="/login" className="rounded-lg bg-wine-700 px-5 py-3 font-medium text-white">
            {t('auth.login')}
          </Link>
          <Link to="/signup" className="rounded-lg border border-wine-700 px-5 py-3 font-medium">
            {t('auth.signup')}
          </Link>
        </div>
      </div>

      <div className="px-6 py-4">
        <AdBanner />
      </div>

      <footer className="flex justify-center gap-4 px-6 py-4 text-xs text-cellar-700">
        <Link to="/terms" className="underline">
          {t('footer.terms')}
        </Link>
        <Link to="/privacy" className="underline">
          {t('footer.privacy')}
        </Link>
      </footer>
    </div>
  )
}
