import { useContext } from 'react'
import { PowerContext } from './powerContext'

/**
 * The signed-in Power Platform user. Must be used within <PowerProvider>, which
 * guarantees a resolved session — so `user` is always present here.
 *
 * `user.objectId` (Entra object id) is the stable identity key; it is the value
 * written to `poc_requestedby` on order create and filtered on for "my orders".
 */
export function useCurrentUser() {
  const ctx = useContext(PowerContext)
  if (!ctx) {
    throw new Error('useCurrentUser must be used within <PowerProvider>')
  }
  const { user } = ctx
  const displayName = user.fullName ?? user.userPrincipalName ?? 'unknown user'
  return { user, displayName }
}
