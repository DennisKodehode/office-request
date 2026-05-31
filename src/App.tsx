import { useCurrentUser } from './power/useCurrentUser'
import { useIsAdmin } from './power/useIsAdmin'
import { useProducts } from './data/useProducts'
import { useMyOrders } from './data/useOrders'
import './App.css'

function App() {
  const { displayName } = useCurrentUser()
  const isAdmin = useIsAdmin()
  const products = useProducts()
  const myOrders = useMyOrders()

  // Temporary proof-of-hooks readout — real catalog/orders UI lands in Phase 3+.
  const dataLine =
    products.error || myOrders.error
      ? `Error: ${products.error ?? myOrders.error}`
      : products.loading || myOrders.loading
        ? 'Loading data…'
        : `${products.data?.length ?? 0} products · ${myOrders.data?.length ?? 0} of my orders`

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>Office Request</h1>
        {isAdmin && <span className="admin-badge">Admin</span>}
      </header>
      <main className="app-main">
        <p className="muted">
          Signed in as <strong>{displayName}</strong>
        </p>
        <p className="muted">{dataLine}</p>
      </main>
    </div>
  )
}

export default App
