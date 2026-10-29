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

  async function addShelf(capacity: number, name?: string) {
    if (!user) throw new Error('not authenticated')
    const nextIndex = shelves.length > 0 ? Math.max(...shelves.map((s) => s.shelf_index)) + 1 : 0
    const { error } = await supabase
      .from('shelves')
      .insert({ user_id: user.id, shelf_index: nextIndex, capacity, name: name ?? null })
    if (error) throw error
    await refetch()
  }

  async function updateShelfCapacity(shelfId: string, capacity: number) {
    const { error } = await supabase.from('shelves').update({ capacity }).eq('id', shelfId)
    if (error) throw error
    await refetch()
  }

  async function removeShelf(shelfId: string) {
    const { error } = await supabase.from('shelves').delete().eq('id', shelfId)
    if (error) throw error
    await refetch()
  }

  async function updateShelfSlotPositions(shelfId: string, positions: { x: number; y: number }[]) {
    const { error } = await supabase.from('shelves').update({ slot_positions: positions }).eq('id', shelfId)
    if (error) throw error
    await refetch()
  }

  return {
    shelves,
    loading,
    refetch,
    createShelves,
    addShelf,
    updateShelfCapacity,
    removeShelf,
    updateShelfSlotPositions,
  }
}
