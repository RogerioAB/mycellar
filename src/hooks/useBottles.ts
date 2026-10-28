import { useCallback, useEffect, useState } from 'react'
import { useAuth } from './useAuth'
import { supabase } from '../lib/supabaseClient'
import type { Bottle } from '../types/bottle'

export interface SlotRef {
  shelfId: string
  slotIndex: number
}

export interface BottleFields {
  name: string
  wine_type: Bottle['wine_type']
  grapes: string[] | null
  country: string | null
  region: string | null
  winery: string | null
  vintage_year: number | null
  rating: number | null
  tasting_notes: string | null
  label_photo_url: string | null
}

const UNIQUE_VIOLATION = '23505'

export function useBottles(status: Bottle['status'] = 'active') {
  const { user } = useAuth()
  const [bottles, setBottles] = useState<Bottle[]>([])
  const [loading, setLoading] = useState(true)

  const refetch = useCallback(async () => {
    if (!user) {
      setBottles([])
      setLoading(false)
      return
    }
    setLoading(true)
    const { data } = await supabase
      .from('bottles')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', status)
      .order('created_at', { ascending: false })
    setBottles(data ?? [])
    setLoading(false)
  }, [user, status])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- busca inicial de dados no mount
    void refetch()
  }, [refetch])

  async function createBottles(fields: BottleFields, slots: SlotRef[]) {
    if (!user) throw new Error('not authenticated')
    const rows = slots.map((slot) => ({
      user_id: user.id,
      ...fields,
      shelf_id: slot.shelfId,
      slot_index: slot.slotIndex,
    }))
    const { error } = await supabase.from('bottles').insert(rows)
    if (error) {
      if (error.code === UNIQUE_VIOLATION) {
        throw new Error('slot_conflict')
      }
      throw error
    }
    await refetch()
  }

  async function updateBottle(id: string, patch: Partial<BottleFields>) {
    const { error } = await supabase.from('bottles').update(patch).eq('id', id)
    if (error) throw error
    await refetch()
  }

  async function deleteBottle(id: string) {
    const { error } = await supabase.from('bottles').delete().eq('id', id)
    if (error) throw error
    await refetch()
  }

  return { bottles, loading, refetch, createBottles, updateBottle, deleteBottle }
}
