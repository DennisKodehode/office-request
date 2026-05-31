import { Poc_orderlinesService, Poc_ordersService } from '../generated'
import { unwrap, useDataverseQuery } from './useDataverseQuery'
import type { OrderWithLines, QueryResult } from './types'

/**
 * A single order plus its order lines. The SDK has no `$expand`, so the lines
 * are a second query filtered by the order lookup.
 *
 * OData lookup-filter rule: `_poc_order_value` is a Guid column, so the id is
 * interpolated WITHOUT quotes (contrast the quoted string filter in useOrders).
 * Fetched sequentially so a failed/forbidden order fetch skips the line query
 * and attributes the error cleanly.
 */
export function useOrder(id: string | undefined): QueryResult<OrderWithLines> {
  return useDataverseQuery(async () => {
    if (!id) throw new Error('No order id')
    const order = await Poc_ordersService.get(id).then(unwrap)
    const lines = await Poc_orderlinesService.getAll({
      filter: `_poc_order_value eq ${id}`,
      orderBy: ['createdon asc'],
    }).then(unwrap)
    return { order, lines }
  }, [id])
}
