import { useCurrentUser } from './power/useCurrentUser'
import { useIsAdmin } from './power/useIsAdmin'
import { Catalog } from './features/catalog/Catalog'
import './App.css'

function App() {
  const { displayName } = useCurrentUser()
  const isAdmin = useIsAdmin()

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>Office Request</h1>
        {isAdmin && <span className="admin-badge">Admin</span>}
        <span className="app-header__user muted">{displayName}</span>
      </header>
      <main className="app-main">
        <Catalog />
      </main>
    </div>
  )
}

export default App
