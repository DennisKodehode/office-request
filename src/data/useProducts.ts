import { Poc_productsService } from '../generated'
import type { Poc_products } from '../generated/models/Poc_productsModel'
import { useIsAdmin } from '../power/useIsAdmin'
import { unwrap, useDataverseQuery } from './useDataverseQuery'
import type { QueryResult } from './types'

/**
 * The product catalog. Admins see every product; everyone else sees only
 * available ones (`poc_available eq true`). The user-vs-admin rule is a fixed
 * business rule, so it lives here rather than as a call-site option.
 */
export function useProducts(): QueryResult<Poc_products[]> {
  const isAdmin = useIsAdmin()
  return useDataverseQuery(
    () =>
      Poc_productsService.getAll(
        isAdmin ? undefined : { filter: 'poc_available eq true' },
      ).then(unwrap),
    [isAdmin],
  )
}
