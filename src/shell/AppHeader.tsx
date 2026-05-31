import { CartButton } from '../features/cart/CartButton'
import { NAV_ITEMS, type View } from './navigation'

interface AppHeaderProps {
  view: View
  onSelectView: (view: View) => void
  isAdmin: boolean
  displayName: string
  onOpenCart: () => void
}

/**
 * App chrome: title, admin badge, the data-driven nav tabs (admin-only items
 * filtered by isAdmin), the signed-in user, and the cart button.
 */
export function AppHeader({
  view,
  onSelectView,
  isAdmin,
  displayName,
  onOpenCart,
}: AppHeaderProps) {
  const items = NAV_ITEMS.filter((item) => !item.adminOnly || isAdmin)

  return (
    <header className="app-header">
      <h1>Office Request</h1>
      {isAdmin && <span className="admin-badge">Admin</span>}
      <nav className="app-tabs">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            aria-current={view === item.id}
            onClick={() => onSelectView(item.id)}
          >
            {item.label}
          </button>
        ))}
      </nav>
      <span className="app-header__user muted">{displayName}</span>
      <CartButton onOpen={onOpenCart} />
    </header>
  )
}
