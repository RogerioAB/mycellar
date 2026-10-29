import { useTranslation } from 'react-i18next'
import { LayoutEditor } from '../components/layout/LayoutEditor'
import { PhotoCalibrator } from '../components/layout/PhotoCalibrator'

export default function SettingsLayoutPage() {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col gap-8 px-4 py-6">
      <div>
        <h1 className="text-xl font-semibold text-cellar-900">{t('settingsLayout.shelvesTitle')}</h1>
        <p className="mt-1 text-sm text-cellar-700">{t('settingsLayout.shelvesHint')}</p>
        <div className="mt-4">
          <LayoutEditor />
        </div>
      </div>

      <div>
        <h1 className="text-xl font-semibold text-cellar-900">{t('settingsLayout.photoTitle')}</h1>
        <p className="mt-1 text-sm text-cellar-700">{t('settingsLayout.photoHint')}</p>
        <div className="mt-4">
          <PhotoCalibrator />
        </div>
      </div>
    </div>
  )
}
