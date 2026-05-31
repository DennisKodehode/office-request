import { useContext } from 'react'
import { CartContext, type CartContextValue } from './cartContext'

/** Access the cart. Must be used within <CartProvider>. */
export function useCart(): CartContextValue {
  const ctx = useContext(CartContext)
  if (!ctx) {
    throw new Error('useCart must be used within <CartProvider>')
  }
  return ctx
}
