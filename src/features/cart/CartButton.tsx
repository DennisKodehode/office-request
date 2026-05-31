import { useCart } from './useCart'

/** Header button that opens the cart drawer and shows the item count. */
export function CartButton({ onOpen }: { onOpen: () => void }) {
  const { count } = useCart()
  return (
    <button type="button" className="cart-button" onClick={onOpen} aria-label={`Cart, ${count} item${count === 1 ? '' : 's'}`}>
      <svg className="cart-button__icon" viewBox="0 0 24 24" aria-hidden="true" width="18" height="18">
        <path
          d="M3 3h2l2.4 12.2a1 1 0 0 0 1 .8h8.2a1 1 0 0 0 1-.8L21 7H6"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <circle cx="9.5" cy="20" r="1.4" fill="currentColor" />
        <circle cx="17.5" cy="20" r="1.4" fill="currentColor" />
      </svg>
      <span>Cart</span>
      {count > 0 && <span className="cart-button__badge">{count}</span>}
    </button>
  )
}
