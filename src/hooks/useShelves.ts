import { useCallback, useEffect, useState } from 'react'
import { useAuth } from './useAuth'
import { supabase } from '../lib/supabaseClient'
import type { Shelf } from '../types/bottle'

export function useShelves() {
  const { user } = useAuth()
  const [shelves, setShelves] = useState<Shelf[]>([])
  const [loading, setLoading] = useState(true)

  const refetch = useCallback(async () => {
    if (!user) {
      setShelves([])
      setLoading(false)
      return
    }
    setLoading(true)
    const { data } = await supabase
      .from('shelves')
      .select('*')
      .eq('user_id', user.id)
      .order('shelf_index', { ascending: true })
    setShelves(data ?? [])
    setLoading(false)
  }, [user])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- busca inicial de dados no mount
    void refetch()
  }, [refetch])

  async function createShelves(count: number, capacity: number) {
    if (!user) throw new Error('not authenticated')
    const rows = Array.from({ length: count }, (_, i) => ({
      user_id: user.id,
      shelf_index: i,
      capacity,
    }))
    const { error } = await supabase.from('shelves').insert(rows)
    if (error) throw error
    await refetch()
  }

  return { shelves, loading, refetch, createShelves }
}
