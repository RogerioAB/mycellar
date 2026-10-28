import { useState, type FormEvent } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { supabase } from '../lib/supabaseClient'

export default function SignupPage() {
  const { t } = useTranslation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError(t('auth.passwordsDontMatch'))
      return
    }

    setSubmitting(true)
    const { data, error } = await supabase.auth.signUp({ email, password })
    setSubmitting(false)

    if (error) {
      setError(error.message)
      return
    }

    if (!data.session) {
      // Projeto exige confirmação por email antes de criar sessão;
      // terms_accepted_at é gravado no primeiro login (ver AuthContext).
      setAwaitingConfirmation(true)
    }
  }

  async function handleGoogleSignup() {
    setError(null)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/cellar` },
    })
    if (error) setError(error.message)
  }

  if (awaitingConfirmation) {
    return (
      <div className="mx-auto flex min-h-full max-w-sm flex-col justify-center px-6 py-10 text-center">
        <h1 className="text-2xl font-semibold text-cellar-900">{t('auth.signup')}</h1>
        <p className="mt-4 text-cellar-700">{t('auth.checkYourEmail')}</p>
      </div>
    )
  }

  return (
    <div className="mx-auto flex min-h-full max-w-sm flex-col justify-center px-6 py-10">
      <h1 className="text-2xl font-semibold text-cellar-900">{t('auth.signup')}</h1>

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
          autoComplete="new-password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Input
          type="password"
          placeholder={t('auth.confirmPassword')}
          autoComplete="new-password"
          required
          minLength={6}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        <label className="flex items-start gap-2 text-sm text-cellar-700">
          <input
            type="checkbox"
            className="mt-0.5 h-5 w-5 shrink-0 accent-wine-700"
            checked={termsAccepted}
            onChange={(e) => setTermsAccepted(e.target.checked)}
            required
          />
          <span>
            <Trans
              i18nKey="auth.acceptTerms"
              components={{
                terms: <Link to="/terms" target="_blank" className="underline" />,
                privacy: <Link to="/privacy" target="_blank" className="underline" />,
              }}
            />
          </span>
        </label>

        {error && <p className="text-sm text-wine-700">{error}</p>}

        <Button type="submit" disabled={submitting || !termsAccepted}>
          {submitting ? t('common.loading') : t('auth.signup')}
        </Button>
      </form>

      <div className="my-4 flex items-center gap-3 text-sm text-cellar-700">
        <div className="h-px flex-1 bg-cellar-700/20" />
        {t('auth.orContinueWith')}
        <div className="h-px flex-1 bg-cellar-700/20" />
      </div>

      <Button variant="secondary" onClick={handleGoogleSignup} type="button">
        {t('auth.loginWithGoogle')}
      </Button>

      <p className="mt-6 text-center text-sm text-cellar-700">
        {t('auth.alreadyHaveAccount')}{' '}
        <Link to="/login" className="font-medium text-wine-700 underline">
          {t('auth.login')}
        </Link>
      </p>
    </div>
  )
}
