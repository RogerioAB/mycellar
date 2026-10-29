import { useTranslation } from 'react-i18next'
import { SUPPORTED_LANGUAGES } from '../../i18n'
import { useAuth } from '../../hooks/useAuth'
import { supabase } from '../../lib/supabaseClient'
import type { PreferredLanguage } from '../../types/database.types'

const LANGUAGE_LABELS: Record<PreferredLanguage, string> = {
  'pt-BR': 'Português',
  en: 'English',
  es: 'Español',
}

export function LanguageSwitcher() {
  const { i18n } = useTranslation()
  const { user } = useAuth()

  async function handleChange(lang: PreferredLanguage) {
    await i18n.changeLanguage(lang)
    if (user) {
      await supabase.from('profiles').update({ preferred_language: lang }).eq('id', user.id)
    }
  }

  return (
    <div className="flex gap-2">
      {SUPPORTED_LANGUAGES.map((lang) => (
        <button
          key={lang}
          type="button"
          onClick={() => handleChange(lang)}
          className={`min-h-11 flex-1 rounded-lg border px-3 py-2 text-sm font-medium ${
            i18n.language === lang
              ? 'border-wine-700 bg-wine-700 text-white'
              : 'border-cellar-700/30 text-cellar-900'
          }`}
        >
          {LANGUAGE_LABELS[lang]}
        </button>
      ))}
    </div>
  )
}
