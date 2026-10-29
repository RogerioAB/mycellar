import { useCallback, useEffect, useState } from 'react'
import { useAuth } from './useAuth'
import { supabase } from '../lib/supabaseClient'
import type { Profile } from '../types/bottle'

export function useProfile() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  const refetch = useCallback(async () => {
    if (!user) {
      setProfile(null)
      setLoading(false)
      return
    }
    setLoading(true)
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle()
    setProfile(data)
    setLoading(false)
  }, [user])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- busca inicial de dados no mount
    void refetch()
  }, [refetch])

  async function updateProfile(patch: Partial<Profile>) {
    if (!user) throw new Error('not authenticated')
    const { error } = await supabase.from('profiles').update(patch).eq('id', user.id)
    if (error) throw error
    await refetch()
  }

  return { profile, loading, refetch, updateProfile }
}
