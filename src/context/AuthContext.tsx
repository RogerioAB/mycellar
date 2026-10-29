import { useEffect, useState, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import i18n, { SUPPORTED_LANGUAGES } from '../i18n'
import { supabase } from '../lib/supabaseClient'
import { AuthContext } from './auth-context'

async function syncProfileOnLogin(userId: string) {
  const { data } = await supabase
    .from('profiles')
    .select('terms_accepted_at, preferred_language')
    .eq('id', userId)
    .maybeSingle()

  if (!data) return

  if (data.terms_accepted_at === null) {
    await supabase.from('profiles').update({ terms_accepted_at: new Date().toISOString() }).eq('id', userId)
  }

  if (
    data.preferred_language &&
    SUPPORTED_LANGUAGES.includes(data.preferred_language) &&
    data.preferred_language !== i18n.language
  ) {
    void i18n.changeLanguage(data.preferred_language)
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
      if (data.session) void syncProfileOnLogin(data.session.user.id)
    })

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
      if (newSession) void syncProfileOnLogin(newSession.user.id)
    })

    return () => subscription.subscription.unsubscribe()
  }, [])

  return (
    <AuthContext.Provider value={{ session, user: session?.user ?? null, loading }}>
      {children}
    </AuthContext.Provider>
  )
}
