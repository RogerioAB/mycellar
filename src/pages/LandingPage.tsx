import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export default function LandingPage() {
  const { t } = useTranslation()

  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-6 bg-cellar-900 px-6 text-center text-wine-50">
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
  )
}
