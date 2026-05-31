import { useContext } from 'react'
import { PowerContext } from './powerContext'

/**
 * Whether the signed-in user holds the "Office Request Admin" Dataverse role.
 *
 * This gate is cosmetic — it only hides/disables admin UI. Real enforcement is
 * Dataverse security roles, applied server-side regardless of what we render.
 * All admin UI consumes this hook, so the resolution mechanism (see
 * resolveIsAdmin.ts) can change without touching callers.
 */
export function useIsAdmin(): boolean {
  const ctx = useContext(PowerContext)
  if (!ctx) {
    throw new Error('useIsAdmin must be used within <PowerProvider>')
  }
  return ctx.isAdmin
}
