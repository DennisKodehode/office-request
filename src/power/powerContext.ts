import { createContext } from 'react'
import type { IContext } from '@microsoft/power-apps/app'

/**
 * Resolved Power Platform session, provided once by <PowerProvider> after the
 * host connection succeeds. Consumers read it via useCurrentUser() / useIsAdmin()
 * and can assume it is non-null (the provider only renders children when ready).
 */
export interface PowerContextValue {
  user: IContext['user']
  isAdmin: boolean
}

export const PowerContext = createContext<PowerContextValue | null>(null)
