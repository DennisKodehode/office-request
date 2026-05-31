import { useCart } from './useCart'

/** Header button that opens the cart drawer and shows the item count. */
export function CartButton({ onOpen }: { onOpen: () => void }) {
  const { count } = useCart()
  return (
    <button type="button" className="cart-button" onClick={onOpen}>
      Cart
      {count > 0 && <span className="cart-button__badge">{count}</span>}
    </button>
  )
}
