import { Outlet } from 'react-router-dom'
import { BottomNav } from './BottomNav'

export function AppShell() {
  return (
    <div className="min-h-full pb-20">
      <Outlet />
      <BottomNav />
    </div>
  )
}
