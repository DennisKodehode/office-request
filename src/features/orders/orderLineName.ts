import type { Poc_orderlines } from '../../generated/models/Poc_orderlinesModel'

// The product name for a line isn't reliably in `poc_productname` (a read-only
// column that's empty in practice). Dataverse returns the lookup's display name
// as a formatted-value annotation alongside `_poc_product_value` (the SDK asks
// for it via Prefer: odata.include-annotations=*). The exact annotation key can
// vary by namespace, so we scan for any key that mentions the product lookup and
// a formatted value rather than hardcoding one.
function annotationName(line: Poc_orderlines): string | undefined {
  const record = line as unknown as Record<string, unknown>
  for (const [key, value] of Object.entries(record)) {
    const k = key.toLowerCase()
    if (
      typeof value === 'string' &&
      value &&
      k.includes('poc_product') &&
      k.includes('formattedvalue')
    ) {
      return value
    }
  }
  return undefined
}

/** Best-available display name for an order line's product. */
export function lineProductName(line: Poc_orderlines): string {
  return line.poc_productname || annotationName(line) || 'Product'
}
