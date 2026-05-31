import type { Poc_orders } from '../generated/models/Poc_ordersModel'
import type { Poc_orderlines } from '../generated/models/Poc_orderlinesModel'

/**
 * Standard return shape for every data-query hook.
 *
 * `data === undefined` means "not loaded yet" (initial load, or an errored
 * load that never produced data). An empty array means "loaded successfully,
 * nothing matched" — consumers should branch on `loading` first, then on
 * `data?.length`.
 */
export interface QueryResult<T> {
  data: T | undefined
  /** True during the initial load and during every refetch. */
  loading: boolean
  /** Pre-stringified error message, or undefined when the last load succeeded. */
  error: string | undefined
  /** Re-runs the query without changing its inputs. */
  refetch: () => void
}

/** Normalized result of a mutation (create/update/delete). */
export interface MutationResult<T = unknown> {
  ok: boolean
  data?: T
  error?: string
}

/** An order header together with its order lines (fetched separately). */
export interface OrderWithLines {
  order: Poc_orders
  lines: Poc_orderlines[]
}
