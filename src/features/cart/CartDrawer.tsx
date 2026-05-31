import { useActionState, useEffect, useRef } from 'react'
import { useCurrentUser } from '../../power/useCurrentUser'
import { createOrder, createOrderLine, deleteOrder } from '../../data/mutations'
import { formatMoney } from '../../data/format'
import { useCart } from './useCart'
import './cart.css'

interface CartDrawerProps {
  open: boolean
  onClose: () => void
}

// Submitted status code (see src/data/labels.ts ORDER_STATUS_FLOW).
const STATUS_SUBMITTED = 893960000

type SubmitResult =
  | { kind: 'error'; message: string }
  | { kind: 'success'; ref: string; itemCount: number }
  | null

/**
 * Slide-over cart panel. Lists lines with quantity steppers + remove, an order
 * notes field, the total, and a submit that creates the order header + one line
 * per item (see the non-atomic algorithm below). On success it shows a
 * confirmation, then clears the cart and closes.
 */
export function CartDrawer({ open, onClose }: CartDrawerProps) {
  const { items, count, subtotal, setQuantity, remove, clear } = useCart()
  const { user } = useCurrentUser()
  const closeRef = useRef<HTMLButtonElement>(null)

  // Esc to close + focus the close button when opened (plain-div dialog a11y).
  useEffect(() => {
    if (!open) return
    closeRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  const [result, submitAction, isPending] = useActionState<SubmitResult, FormData>(
    async (_prev, formData) => {
      if (items.length === 0) return { kind: 'error', message: 'Your cart is empty.' }

      const requestedBy = user.objectId
      if (!requestedBy) {
        return { kind: 'error', message: 'Could not identify your account; please reload.' }
      }

      const notes = (formData.get('notes') as string)?.trim()

      // 1) Create the order header. Not atomic with the lines below.
      const header = await createOrder({
        poc_requestedby: requestedBy,
        poc_status: STATUS_SUBMITTED,
        poc_requesteddate: new Date().toISOString(),
        ...(notes && { poc_notes: notes }),
      })
      if (!header.ok || !header.data?.poc_orderid) {
        return { kind: 'error', message: header.error ?? 'Could not create order.' }
      }
      const orderId = header.data.poc_orderid

      // 2) Create one line per item, sequentially. On any failure, roll back the
      // header so no half-order is left behind, and keep the cart for retry.
      for (const item of items) {
        const line = await createOrderLine(orderId, item.productId, item.quantity)
        if (!line.ok) {
          await deleteOrder(orderId)
          return {
            kind: 'error',
            message: 'Could not add items to your order. Nothing was submitted; please try again.',
          }
        }
      }

      // 3) Success — capture details before clearing the cart.
      const confirmation: SubmitResult = {
        kind: 'success',
        ref: `#${orderId.slice(0, 8).toUpperCase()}`,
        itemCount: count,
      }
      clear()
      return confirmation
    },
    null,
  )

  if (!open) return null

  return (
    <div className="cart-overlay" onClick={onClose}>
      <aside
        className="cart-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="cart-drawer__header">
          <h2>Your cart</h2>
          <button ref={closeRef} type="button" onClick={onClose} aria-label="Close cart">
            ✕
          </button>
        </header>

        {result?.kind === 'success' ? (
          <div className="cart-drawer__body">
            <p className="cart-success" role="status">
              ✓ Order submitted — <strong>{result.ref}</strong> ({result.itemCount} item
              {result.itemCount === 1 ? '' : 's'})
            </p>
            <button type="button" onClick={onClose}>
              Done
            </button>
          </div>
        ) : items.length === 0 ? (
          <div className="cart-drawer__body">
            <p className="muted">Your cart is empty.</p>
          </div>
        ) : (
          <form action={submitAction} className="cart-drawer__body">
            <ul className="cart-lines">
              {items.map((item) => (
                <li key={item.productId} className="cart-line">
                  <div className="cart-line__info">
                    <span className="cart-line__name">{item.name}</span>
                    <span className="muted">{formatMoney(item.unitPrice)}</span>
                  </div>
                  <div className="cart-line__qty">
                    <button
                      type="button"
                      onClick={() => setQuantity(item.productId, item.quantity - 1)}
                      aria-label={`Decrease ${item.name}`}
                      disabled={isPending}
                    >
                      −
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => setQuantity(item.productId, item.quantity + 1)}
                      aria-label={`Increase ${item.name}`}
                      disabled={isPending}
                    >
                      +
                    </button>
                  </div>
                  <span className="cart-line__subtotal">
                    {formatMoney(item.unitPrice * item.quantity)}
                  </span>
                  <button
                    type="button"
                    className="cart-line__remove"
                    onClick={() => remove(item.productId)}
                    aria-label={`Remove ${item.name}`}
                    disabled={isPending}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>

            <label className="cart-notes">
              Order notes
              <textarea name="notes" rows={2} disabled={isPending} />
            </label>

            <div className="cart-drawer__total">
              <span>Total</span>
              <strong>{formatMoney(subtotal)}</strong>
            </div>

            {result?.kind === 'error' && (
              <p className="error" role="alert">
                {result.message}
              </p>
            )}

            <button type="submit" className="cart-submit" disabled={isPending || count === 0}>
              {isPending ? 'Submitting…' : 'Submit order'}
            </button>
          </form>
        )}
      </aside>
    </div>
  )
}
