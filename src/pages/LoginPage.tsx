import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { supabase } from '../lib/supabaseClient'

export default function LoginPage() {
  const { t } = useTranslation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setSubmitting(false)
    if (error) setError(error.message)
  }

  async function handleGoogleLogin() {
    setError(null)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/cellar` },
    })
    if (error) setError(error.message)
  }

  return (
    <div className="mx-auto flex min-h-full max-w-sm flex-col justify-center px-6 py-10">
      <h1 className="text-2xl font-semibold text-cellar-900">{t('auth.login')}</h1>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <Input
          type="email"
          placeholder={t('auth.email')}
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          type="password"
          placeholder={t('auth.password')}
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <p className="text-sm text-wine-700">{error}</p>}

        <Button type="submit" disabled={submitting}>
          {submitting ? t('common.loading') : t('auth.login')}
        </Button>
      </form>

      <div className="my-4 flex items-center gap-3 text-sm text-cellar-700">
        <div className="h-px flex-1 bg-cellar-700/20" />
        {t('auth.orContinueWith')}
        <div className="h-px flex-1 bg-cellar-700/20" />
      </div>

      <Button variant="secondary" onClick={handleGoogleLogin} type="button">
        {t('auth.loginWithGoogle')}
      </Button>

      <p className="mt-6 text-center text-sm text-cellar-700">
        {t('auth.noAccountYet')}{' '}
        <Link to="/signup" className="font-medium text-wine-700 underline">
          {t('auth.signup')}
        </Link>
      </p>
    </div>
  )
}
