import { useTranslation } from 'react-i18next'
import { NavLink } from 'react-router-dom'

const items = [
  { to: '/cellar', labelKey: 'nav.cellar', icon: '🍷' },
  { to: '/bottles/add', labelKey: 'nav.addBottle', icon: '➕' },
  { to: '/history', labelKey: 'nav.history', icon: '🕓' },
  { to: '/settings', labelKey: 'nav.settings', icon: '⚙️' },
] as const

export function BottomNav() {
  const { t } = useTranslation()

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-10 flex border-t border-cellar-700/20 bg-white"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            `flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 text-xs ${
              isActive ? 'text-wine-700 font-medium' : 'text-cellar-700'
            }`
          }
        >
          <span aria-hidden className="text-lg leading-none">
            {item.icon}
          </span>
          {t(item.labelKey)}
        </NavLink>
      ))}
    </nav>
  )
}
