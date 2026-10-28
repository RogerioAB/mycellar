import type { Database } from './database.types'

export type Bottle = Database['public']['Tables']['bottles']['Row']
export type Shelf = Database['public']['Tables']['shelves']['Row']
export type Profile = Database['public']['Tables']['profiles']['Row']

export const WINE_TYPES = ['tinto', 'branco', 'rose', 'espumante', 'fortificado', 'outro'] as const
export type WineType = (typeof WINE_TYPES)[number]
