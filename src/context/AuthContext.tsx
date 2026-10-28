import { useEffect, useState, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabaseClient'
import { AuthContext } from './auth-context'

async function ensureTermsAccepted(userId: string) {
  const { data } = await supabase
    .from('profiles')
    .select('terms_accepted_at')
    .eq('id', userId)
    .maybeSingle()

  if (data && data.terms_accepted_at === null) {
    await supabase.from('profiles').update({ terms_accepted_at: new Date().toISOString() }).eq('id', userId)
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
      if (data.session) void ensureTermsAccepted(data.session.user.id)
    })

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
      if (newSession) void ensureTermsAccepted(newSession.user.id)
    })

    return () => subscription.subscription.unsubscribe()
  }, [])

  return (
    <AuthContext.Provider value={{ session, user: session?.user ?? null, loading }}>
      {children}
    </AuthContext.Provider>
  )
}
