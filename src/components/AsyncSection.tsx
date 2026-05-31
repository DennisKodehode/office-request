import type { ReactNode } from 'react'
import type { QueryResult } from '../data/types'

interface AsyncSectionProps<T> {
  query: QueryResult<T>
  /** Shown when data is loaded but empty. */
  empty?: ReactNode
  /** Loading placeholder text (default "Loading…"). */
  loadingText?: string
  /** Override the empty check; defaults to "data is an empty array". */
  isEmpty?: (data: T) => boolean
  children: (data: T) => ReactNode
}

/**
 * Standard query-state wrapper so every screen renders loading / error / empty /
 * data consistently. Branches on `data === undefined` first (not loaded), so
 * once data exists it keeps rendering `children` during a refetch
 * (stale-while-revalidate). A transient refetch error while data already exists
 * is intentionally not surfaced here — that matches "keep showing stale data";
 * mutation errors are surfaced by the feature components that trigger them.
 */
export function AsyncSection<T>({
  query,
  empty,
  loadingText = 'Loading…',
  isEmpty,
  children,
}: AsyncSectionProps<T>) {
  const { data, loading, error } = query

  if (data === undefined) {
    if (loading) return <p className="muted">{loadingText}</p>
    if (error) {
      return (
        <p className="error" role="alert">
          {error}
        </p>
      )
    }
    return null
  }

  const empties = isEmpty ? isEmpty(data) : Array.isArray(data) && data.length === 0
  if (empties) return <>{empty}</>

  return <>{children(data)}</>
}
