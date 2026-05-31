import { Poc_orderspoc_status as OrderStatusMap } from '../generated/models/Poc_ordersModel'
import { Poc_productspoc_category as CategoryMap } from '../generated/models/Poc_productsModel'

// The generated model exports each option-set as a same-named const AND type,
// which makes `keyof typeof <map>` resolve ambiguously under this tsconfig
// (verbatimModuleSyntax). So we state the option-set codes explicitly (stable
// Dataverse values) and read labels through a plain numeric-keyed view of the
// generated maps — keeping the human labels sourced from the generated data.

export type OrderStatus = 893960000 | 893960001 | 893960002 | 893960003 | 893960004

/** The "Submitted" status code — the only status a user may edit/cancel in. */
export const STATUS_SUBMITTED: OrderStatus = 893960000
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

/** Convert a string form value (e.g. a <select>) back to a typed category key. */
export function parseCategory(raw: string): ProductCategory {
  return Number(raw) as ProductCategory
}

/** All product categories as [code, label] pairs, for building a <select>. */
export const PRODUCT_CATEGORY_OPTIONS: readonly (readonly [ProductCategory, string])[] =
  Object.entries(categoryLabels).map(
    ([code, label]) => [Number(code) as ProductCategory, label] as const,
  )

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

/**
 * Allowed admin status transitions, rendered as guided next-step buttons.
 * Unlike ORDER_STATUS_FLOW (a display ordering), this is the real graph.
 * Terminal states (Fulfilled, Rejected) map to an empty array.
 */
export const ORDER_STATUS_TRANSITIONS: Record<
  OrderStatus,
  readonly { readonly to: OrderStatus; readonly label: string }[]
> = {
  893960000: [
    { to: 893960001, label: 'Approve' },
    { to: 893960004, label: 'Reject' },
  ], // Submitted
  893960001: [{ to: 893960002, label: 'Assign' }], // Approved
  893960002: [{ to: 893960003, label: 'Mark fulfilled' }], // Assigned
  893960003: [], // Fulfilled (terminal)
  893960004: [], // Rejected (terminal)
}

/** Valid next-step transitions for a status (empty when terminal/unknown). */
export function nextTransitions(
  status: OrderStatus | undefined,
): readonly { readonly to: OrderStatus; readonly label: string }[] {
  return status == null ? [] : ORDER_STATUS_TRANSITIONS[status] ?? []
}
