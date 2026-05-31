import { Badge } from '../components/Badge'
import { NAV_ITEMS, type View } from './navigation'

interface AppSidebarProps {
  view: View
  onSelectView: (view: View) => void
  isAdmin: boolean
  displayName: string
  /** Mobile: whether the off-canvas drawer is open. */
  mobileOpen: boolean
  onCloseMobile: () => void
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

/**
 * Left navigation sidebar: brand, the data-driven nav (admin items filtered by
 * isAdmin), and a footer with the signed-in user. On desktop it's a sticky
 * column; on mobile it's an off-canvas drawer toggled from the topbar.
 */
export function AppSidebar({
  view,
  onSelectView,
  isAdmin,
  displayName,
  mobileOpen,
  onCloseMobile,
}: AppSidebarProps) {
  const items = NAV_ITEMS.filter((item) => !item.adminOnly || isAdmin)

  return (
    <>
      <div
        className={`sidebar-scrim${mobileOpen ? ' sidebar-scrim--open' : ''}`}
        onClick={onCloseMobile}
        aria-hidden="true"
      />
      <aside className={`sidebar${mobileOpen ? ' sidebar--open' : ''}`}>
        <div className="sidebar__brand">
          <span className="sidebar__mark" aria-hidden="true" />
          <span className="sidebar__wordmark">Office Request</span>
        </div>

        <nav className="sidebar__nav" aria-label="Primary">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              className="sidebar__item"
              aria-current={view === item.id}
              onClick={() => {
                onSelectView(item.id)
                onCloseMobile()
              }}
            >
              <svg
                className="sidebar__icon"
                viewBox="0 0 24 24"
                width="18"
                height="18"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <path d={item.icon} />
              </svg>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar__footer">
          <span className="sidebar__avatar" aria-hidden="true">
            {initials(displayName)}
          </span>
          <span className="sidebar__user">
            <span className="sidebar__user-name">{displayName}</span>
            {isAdmin && <Badge tone="accent">Admin</Badge>}
          </span>
        </div>
      </aside>
    </>
  )
}
