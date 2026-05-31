/**
 * Money formatter. Currency is hardcoded to USD for the MVP — records do carry
 * `transactioncurrencyidname`, but threading per-record currency through is out
 * of scope for now.
 */
export function formatMoney(value: number | undefined): string {
  return value == null
    ? ''
    : value.toLocaleString(undefined, { style: 'currency', currency: 'USD' })
}

/** Short, locale-aware date from a Dataverse ISO date string. */
export function formatDate(iso: string | undefined): string {
  return !iso ? '' : new Date(iso).toLocaleDateString()
}
