import { useEffect, useState } from 'react'
import { getContext } from '@microsoft/power-apps/app'
import type { IContext } from '@microsoft/power-apps/app'
import { Poc_productsService } from './generated'
import './App.css'

// getContext() only resolves inside the Power Apps host. If the app is opened
// directly (e.g. http://localhost:3000 instead of the Local Play URL) there is
// no host to answer and the promise hangs forever — so we race it against a
// timeout and surface an actionable error instead of an endless spinner.
const CONNECT_TIMEOUT_MS = 10_000

const TIMEOUT = Symbol('timeout')

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T | typeof TIMEOUT> {
  return Promise.race([
    promise,
    new Promise<typeof TIMEOUT>((resolve) => setTimeout(() => resolve(TIMEOUT), ms)),
  ])
}

type BootstrapState =
  | { kind: 'loading' }
  | { kind: 'error'; message: string }
  | { kind: 'ready'; user: IContext['user']; productCount: number }

function App() {
  const [state, setState] = useState<BootstrapState>({ kind: 'loading' })

  useEffect(() => {
    let cancelled = false

    async function bootstrap() {
      try {
        // The powerApps() Vite plugin injects the SDK init script, so there is
        // no initialize() to call — awaiting getContext() confirms the host
        // connection is ready and gives us the signed-in user.
        const context = await withTimeout(getContext(), CONNECT_TIMEOUT_MS)
        if (context === TIMEOUT) {
          throw new Error(
            'Timed out connecting to the Power Apps host. Open the app via the ' +
              'Power Apps "Local Play" URL printed by `npm run dev`, not localhost directly.',
          )
        }

        // One real Dataverse read to prove the data layer is wired up.
        const result = await Poc_productsService.getAll()
        if (!result.success) {
          throw new Error(result.error?.message ?? 'Failed to read products')
        }

        if (cancelled) return
        setState({
          kind: 'ready',
          user: context.user,
          productCount: result.data.length,
        })
      } catch (err) {
        if (cancelled) return
        setState({
          kind: 'error',
          message: err instanceof Error ? err.message : String(err),
        })
      }
    }

    void bootstrap()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>Office Request</h1>
      </header>
      <main className="app-main">
        {state.kind === 'loading' && (
          <p className="muted">Connecting to Power Platform…</p>
        )}
        {state.kind === 'error' && (
          <p className="error" role="alert">
            Couldn’t connect: {state.message}
          </p>
        )}
        {state.kind === 'ready' && (
          <p className="muted">
            Connected as{' '}
            <strong>
              {state.user.fullName ??
                state.user.userPrincipalName ??
                'unknown user'}
            </strong>{' '}
            · {state.productCount} product
            {state.productCount === 1 ? '' : 's'} in catalog
          </p>
        )}
      </main>
    </div>
  )
}

export default App
