import { useEffect, useState, type ReactNode } from 'react'
import { getContext } from '@microsoft/power-apps/app'
import type { IContext } from '@microsoft/power-apps/app'
import { PowerContext } from './powerContext'
import { resolveIsAdmin } from './resolveIsAdmin'
import { CONNECT_TIMEOUT_MS, TIMEOUT, withTimeout } from './withTimeout'

type BootstrapState =
  | { kind: 'loading' }
  | { kind: 'error'; message: string }
  | { kind: 'ready'; user: IContext['user']; isAdmin: boolean }

/**
 * Bootstraps the Power Platform connection once at the top of the tree:
 * resolves the host context (with a timeout guard), determines admin status,
 * and only renders children once a session is ready. Loading/error UX lives
 * here so leaf components can treat the session as always-present.
 */
export function PowerProvider({ children }: { children: ReactNode }) {
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

        // A role-check failure must not lock anyone out of the user-facing app —
        // non-admin is the normal case, so any error here defaults to false.
        let isAdmin = false
        try {
          isAdmin = await resolveIsAdmin(context.user.objectId)
        } catch (err) {
          console.warn('Admin role check failed; treating user as non-admin.', err)
        }

        if (cancelled) return
        setState({ kind: 'ready', user: context.user, isAdmin })
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

  if (state.kind === 'loading') {
    return (
      <div className="app-shell">
        <main className="app-main">
          <p className="muted">Connecting to Power Platform…</p>
        </main>
      </div>
    )
  }

  if (state.kind === 'error') {
    return (
      <div className="app-shell">
        <main className="app-main">
          <p className="error" role="alert">
            Couldn’t connect: {state.message}
          </p>
        </main>
      </div>
    )
  }

  return (
    <PowerContext.Provider value={{ user: state.user, isAdmin: state.isAdmin }}>
      {children}
    </PowerContext.Provider>
  )
}
