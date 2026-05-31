import { useState } from 'react'
import { useCurrentUser } from './power/useCurrentUser'
import { useIsAdmin } from './power/useIsAdmin'
import { Catalog } from './features/catalog/Catalog'
import { MyOrdersView, AllOrdersView } from './features/orders/OrdersView'
import { CartProvider } from './features/cart/CartProvider'
import { CartDrawer } from './features/cart/CartDrawer'
import { AppHeader } from './shell/AppHeader'
import type { View } from './shell/navigation'
import './App.css'

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
        <AppHeader
          view={activeView}
          onSelectView={setView}
          isAdmin={isAdmin}
          displayName={displayName}
          onOpenCart={() => setCartOpen(true)}
        />
        <main className="app-main">
          {activeView === 'catalog' && <Catalog />}
          {activeView === 'myorders' && <MyOrdersView />}
          {activeView === 'allorders' && <AllOrdersView />}
        </main>
        <CartDrawer
          open={cartOpen}
          onClose={() => setCartOpen(false)}
          onViewOrders={() => setView('myorders')}
        />
      </div>
    </CartProvider>
  )
}

export default App
