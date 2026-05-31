import { Poc_orderspoc_status as OrderStatusMap } from '../generated/models/Poc_ordersModel'
import { Poc_productspoc_category as CategoryMap } from '../generated/models/Poc_productsModel'

// The generated model exports each option-set as a same-named const AND type,
// which makes `keyof typeof <map>` resolve ambiguously under this tsconfig
// (verbatimModuleSyntax). So we state the option-set codes explicitly (stable
// Dataverse values) and read labels through a plain numeric-keyed view of the
// generated maps — keeping the human labels sourced from the generated data.

export type OrderStatus = 893960000 | 893960001 | 893960002 | 893960003 | 893960004
export type ProductCategory =
  | 893960000
  | 893960001
  | 893960002
  | 893960003
  | 893960004
  | 893960005

const statusLabels = OrderStatusMap as Record<number, string>
const categoryLabels = CategoryMap as Record<number, string>

/** Human label for an order status option-set value. */
export function statusLabel(code: OrderStatus | undefined): string {
  return code == null ? '' : statusLabels[Number(code)] ?? ''
}

/** Human label for a product category option-set value. */
export function categoryLabel(code: ProductCategory | undefined): string {
  return code == null ? '' : categoryLabels[Number(code)] ?? ''
}

/** Convert a string form value (e.g. a <select>) back to a typed status key. */
export function parseStatus(raw: string): OrderStatus {
  return Number(raw) as OrderStatus
}

/**
 * The admin status lifecycle in order:
 * Submitted → Approved → Rejected → Assigned → Fulfilled.
 */
export const ORDER_STATUS_FLOW: readonly OrderStatus[] = [
  893960000, // Submitted
  893960001, // Approved
  893960004, // Rejected
  893960002, // Assigned
  893960003, // Fulfilled
]
