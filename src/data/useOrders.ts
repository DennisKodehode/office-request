import { Poc_ordersService } from '../generated'
import type { Poc_orders } from '../generated/models/Poc_ordersModel'
import { useCurrentUser } from '../power/useCurrentUser'
import { escapeODataString, unwrap, useDataverseQuery } from './useDataverseQuery'
import type { QueryResult } from './types'

/**
 * The signed-in user's own orders, newest first. Scoped by `poc_requestedby`
 * (a free-text string holding the user's Entra objectId) — note this is a UI
 * filter, not a security boundary; real scoping is Dataverse read privileges.
 */
export function useMyOrders(): QueryResult<Poc_orders[]> {
  const { user } = useCurrentUser()
  const objectId = user.objectId ?? ''
  return useDataverseQuery(
    () =>
      Poc_ordersService.getAll({
        filter: `poc_requestedby eq '${escapeODataString(objectId)}'`,
        orderBy: ['createdon desc'],
      }).then(unwrap),
    [objectId],
  )
}

/** Every order, newest first. For admin views. */
export function useAllOrders(): QueryResult<Poc_orders[]> {
  return useDataverseQuery(
    () => Poc_ordersService.getAll({ orderBy: ['createdon desc'] }).then(unwrap),
    [],
  )
}
