import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { CartContext, type CartAddInput, type CartItem } from './cartContext'

/**
 * Holds the client-side cart (no Dataverse draft). Provided high in the tree so
 * both the header cart button/drawer and the catalog grid's add-to-cart can
 * reach it. Mirrors the src/power/ provider pattern.
 */
export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  const add = useCallback((product: CartAddInput, quantity: number) => {
    const qty = Math.max(1, Math.floor(quantity))
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === product.productId)
      if (existing) {
        return prev.map((i) =>
          i.productId === product.productId
            ? { ...i, quantity: i.quantity + qty }
            : i,
        )
      }
      return [...prev, { ...product, quantity: qty }]
    })
  }, [])

  const setQuantity = useCallback((productId: string, quantity: number) => {
    setItems((prev) =>
      quantity < 1
        ? prev.filter((i) => i.productId !== productId)
        : prev.map((i) => (i.productId === productId ? { ...i, quantity } : i)),
    )
  }, [])

  const remove = useCallback((productId: string) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId))
  }, [])

  const clear = useCallback(() => setItems([]), [])

  const { count, subtotal } = useMemo(() => {
    return items.reduce(
      (acc, i) => ({
        count: acc.count + i.quantity,
        subtotal: acc.subtotal + i.unitPrice * i.quantity,
      }),
      { count: 0, subtotal: 0 },
    )
  }, [items])

  const value = useMemo(
    () => ({ items, count, subtotal, add, setQuantity, remove, clear }),
    [items, count, subtotal, add, setQuantity, remove, clear],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
