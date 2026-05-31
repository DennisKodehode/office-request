import { useState } from 'react'
import { useCurrentUser } from './power/useCurrentUser'
import { useIsAdmin } from './power/useIsAdmin'
import { Catalog } from './features/catalog/Catalog'
import { CartProvider } from './features/cart/CartProvider'
import { CartButton } from './features/cart/CartButton'
import { CartDrawer } from './features/cart/CartDrawer'
import './App.css'

function App() {
  const { displayName } = useCurrentUser()
  const isAdmin = useIsAdmin()
  const [cartOpen, setCartOpen] = useState(false)

  return (
    <CartProvider>
      <div className="app-shell">
        <header className="app-header">
          <h1>Office Request</h1>
          {isAdmin && <span className="admin-badge">Admin</span>}
          <span className="app-header__user muted">{displayName}</span>
          <CartButton onOpen={() => setCartOpen(true)} />
        </header>
        <main className="app-main">
          <Catalog />
        </main>
        <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
      </div>
    </CartProvider>
  )
}

export default App
