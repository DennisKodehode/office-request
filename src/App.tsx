import { useCurrentUser } from './power/useCurrentUser'
import { useIsAdmin } from './power/useIsAdmin'
import './App.css'

function App() {
  const { displayName } = useCurrentUser()
  const isAdmin = useIsAdmin()

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
      </main>
    </div>
  )
}

export default App
