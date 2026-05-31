import { createContext } from 'react'

/**
 * A line in the cart. Name + unit price are snapshotted when the item is added,
 * so the drawer renders without re-querying products and the price shown is the
 * one the user saw at add-time. `productId` is the poc_productid GUID — the only
 * field createOrderLine needs.
 */
export interface CartItem {
  productId: string
  name: string
  unitPrice: number
  quantity: number
}

/** Minimal product snapshot needed to add a cart line. */
export interface CartAddInput {
  productId: string
  name: string
  unitPrice: number
}

export interface CartContextValue {
  items: CartItem[]
  /** Sum of quantities across all lines (badge + empty check). */
  count: number
  /** Sum of unitPrice * quantity across all lines. */
  subtotal: number
  /** Add `quantity` of a product; increments the existing line if present. */
  add: (product: CartAddInput, quantity: number) => void
  /** Set a line's quantity; values < 1 remove the line. */
  setQuantity: (productId: string, quantity: number) => void
  remove: (productId: string) => void
  clear: () => void
}

export const CartContext = createContext<CartContextValue | null>(null)
