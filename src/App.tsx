import { useState } from 'react'
import { useCurrentUser } from './power/useCurrentUser'
import { useIsAdmin } from './power/useIsAdmin'
import { Catalog } from './features/catalog/Catalog'
import { MyOrdersView, AllOrdersView } from './features/orders/OrdersView'
import { CartProvider } from './features/cart/CartProvider'
import { CartButton } from './features/cart/CartButton'
import { CartDrawer } from './features/cart/CartDrawer'
import './App.css'

type View = 'catalog' | 'myorders' | 'allorders'

function App() {
  const { displayName } = useCurrentUser()
  const isAdmin = useIsAdmin()
  const [cartOpen, setCartOpen] = useState(false)
  const [view, setView] = useState<View>('catalog')

  // Guard a non-admin out of the admin-only view (e.g. if isAdmin resolves late).
  const activeView = view === 'allorders' && !isAdmin ? 'catalog' : view

  return (
    <CartProvider>
      <div className="app-shell">
        <header className="app-header">
          <h1>Office Request</h1>
          {isAdmin && <span className="admin-badge">Admin</span>}
          <nav className="app-tabs">
            <button type="button" aria-current={activeView === 'catalog'} onClick={() => setView('catalog')}>
              Catalog
            </button>
            <button type="button" aria-current={activeView === 'myorders'} onClick={() => setView('myorders')}>
              My Orders
            </button>
            {isAdmin && (
              <button type="button" aria-current={activeView === 'allorders'} onClick={() => setView('allorders')}>
                All Orders
              </button>
            )}
          </nav>
          <span className="app-header__user muted">{displayName}</span>
          <CartButton onOpen={() => setCartOpen(true)} />
        </header>
        <main className="app-main">
          {activeView === 'catalog' && <Catalog />}
          {activeView === 'myorders' && <MyOrdersView />}
          {activeView === 'allorders' && <AllOrdersView />}
        </main>
        <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
      </div>
    </CartProvider>
  )
}

export default App
