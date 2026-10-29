import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { ExportDataButton } from '../components/settings/ExportDataButton'
import { LanguageSwitcher } from '../components/settings/LanguageSwitcher'
import { Button } from '../components/ui/Button'
import { useInstallPrompt } from '../hooks/useInstallPrompt'
import { supabase } from '../lib/supabaseClient'

export default function SettingsPage() {
  const { t } = useTranslation()
  const { canInstall, promptInstall } = useInstallPrompt()

  return (
    <div className="flex flex-col gap-8 px-4 py-6">
      <h1 className="text-xl font-semibold text-cellar-900">{t('nav.settings')}</h1>

      <section>
        <h2 className="mb-2 text-sm font-medium text-cellar-900">{t('settings.layoutTitle')}</h2>
        <Link to="/settings/layout">
          <Button variant="secondary">{t('settings.editLayout')}</Button>
        </Link>
      </section>

      <section>
        <h2 className="mb-2 text-sm font-medium text-cellar-900">{t('settings.languageTitle')}</h2>
        <LanguageSwitcher />
      </section>

      <section>
        <h2 className="mb-2 text-sm font-medium text-cellar-900">{t('settings.exportTitle')}</h2>
        <p className="mb-2 text-sm text-cellar-700">{t('settings.exportHint')}</p>
        <ExportDataButton />
      </section>

      {canInstall && (
        <section>
          <h2 className="mb-2 text-sm font-medium text-cellar-900">{t('settings.installTitle')}</h2>
          <Button variant="secondary" onClick={promptInstall}>
            {t('settings.installCta')}
          </Button>
        </section>
      )}

      <section>
        <Button variant="ghost" className="text-wine-700" onClick={() => supabase.auth.signOut()}>
          {t('auth.logout')}
        </Button>
      </section>
    </div>
  )
}
