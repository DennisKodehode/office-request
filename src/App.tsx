import { useState } from 'react'
import { useCurrentUser } from './power/useCurrentUser'
import { useIsAdmin } from './power/useIsAdmin'
import { Catalog } from './features/catalog/Catalog'
import { MyOrdersView, AllOrdersView } from './features/orders/OrdersView'
import { CartProvider } from './features/cart/CartProvider'
import { CartDrawer } from './features/cart/CartDrawer'
import { AppSidebar } from './shell/AppSidebar'
import { Topbar } from './shell/Topbar'
import { viewTitle, type View } from './shell/navigation'
import './App.css'

function App() {
  const { displayName } = useCurrentUser()
  const isAdmin = useIsAdmin()
  const [cartOpen, setCartOpen] = useState(false)
  const [navOpen, setNavOpen] = useState(false)
  const [view, setView] = useState<View>('catalog')

  // Guard a non-admin out of the admin-only view (e.g. if isAdmin resolves late).
  const activeView = view === 'allorders' && !isAdmin ? 'catalog' : view

  return (
    <CartProvider>
      <div className="app-shell">
        <AppSidebar
          view={activeView}
          onSelectView={setView}
          isAdmin={isAdmin}
          displayName={displayName}
          mobileOpen={navOpen}
          onCloseMobile={() => setNavOpen(false)}
        />
        <div className="app-content">
          <Topbar
            title={viewTitle(activeView)}
            onOpenCart={() => setCartOpen(true)}
            onOpenNav={() => setNavOpen(true)}
          />
          <main className="app-main">
            {activeView === 'catalog' && <Catalog />}
            {activeView === 'myorders' && <MyOrdersView />}
            {activeView === 'allorders' && <AllOrdersView />}
          </main>
        </div>
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
