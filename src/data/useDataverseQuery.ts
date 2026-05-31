import { useCallback, useEffect, useState } from 'react'
import type { IOperationResult } from '@microsoft/power-apps/data'
import type { QueryResult } from './types'

/**
 * Turns the `{ success, data, error }` envelope into data-or-throw. Every hook's
 * error path funnels through here, so failures surface uniformly in the shared
 * query state machine below.
 */
export function unwrap<T>(result: IOperationResult<T>): T {
  if (!result.success) {
    throw result.error ?? new Error('Dataverse request failed')
  }
  return result.data
}

/** Doubles single quotes so a value is safe inside an OData string literal. */
export function escapeODataString(value: string): string {
  return value.replace(/'/g, "''")
}

interface QueryState<T> {
  data: T | undefined
  loading: boolean
  error: string | undefined
}

/**
 * Shared async state machine for Dataverse reads. Runs `queryFn` whenever `deps`
 * change (or `refetch()` is called) and owns loading/error/data. Uses the React
 * `ignore`/cancelled-flag cleanup pattern from the official docs, so it's
 * StrictMode-safe (the first mount's cleanup discards its in-flight result).
 *
 * State is only ever set from async callbacks or `refetch` (never synchronously
 * in the effect body), per react-hooks/set-state-in-effect. `loading` is true on
 * the initial load and on `refetch()`; a dependency-driven reload keeps showing
 * the previous data until the new result arrives (stale-while-revalidate). On
 * error, prior data is kept and the message is surfaced alongside it.
 *
 * Each caller MUST list everything its `queryFn` closure captures in `deps`.
 */
export function useDataverseQuery<T>(
  queryFn: () => Promise<T>,
  deps: readonly unknown[],
): QueryResult<T> {
  const [state, setState] = useState<QueryState<T>>({
    data: undefined,
    loading: true,
    error: undefined,
  })
  const [nonce, setNonce] = useState(0)

  const refetch = useCallback(() => {
    setState((s) => ({ ...s, loading: true, error: undefined }))
    setNonce((n) => n + 1)
  }, [])

  useEffect(() => {
    let cancelled = false

    queryFn()
      .then((result) => {
        if (!cancelled) setState({ data: result, loading: false, error: undefined })
      })
      .catch((err) => {
        if (!cancelled) {
          setState((s) => ({
            ...s,
            loading: false,
            error: err instanceof Error ? err.message : String(err),
          }))
        }
      })

    return () => {
      cancelled = true
    }
    // queryFn is intentionally excluded; callers declare its captures via deps.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, nonce])

  return { ...state, refetch }
}
