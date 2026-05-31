import { CartButton } from '../features/cart/CartButton'
import { ThemeToggle } from '../theme/ThemeToggle'

interface TopbarProps {
  title: string
  onOpenCart: () => void
  /** Mobile: open the sidebar drawer. */
  onOpenNav: () => void
}

/** Slim bar atop the content column: hamburger (mobile), page title, theme toggle, cart. */
export function Topbar({ title, onOpenCart, onOpenNav }: TopbarProps) {
  return (
    <header className="topbar">
      <button
        type="button"
        className="topbar__hamburger"
        onClick={onOpenNav}
        aria-label="Open navigation"
      >
        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
          <path
            d="M4 7h16M4 12h16M4 17h16"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
          />
        </svg>
      </button>
      <h1 className="topbar__title">{title}</h1>
      <div className="topbar__actions">
        <ThemeToggle />
        <CartButton onOpen={onOpenCart} />
      </div>
    </header>
  )
}
