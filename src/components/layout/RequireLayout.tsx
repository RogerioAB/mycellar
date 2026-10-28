import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useShelves } from '../../hooks/useShelves'

export function RequireLayout({ children }: { children: ReactNode }) {
  const { shelves, loading } = useShelves()
  if (loading) return null
  if (shelves.length === 0) return <Navigate to="/onboarding/layout" replace />
  return <>{children}</>
}
