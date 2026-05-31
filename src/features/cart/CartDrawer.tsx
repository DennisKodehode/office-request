import { useActionState, useEffect, useRef, useState } from 'react'
import { useCurrentUser } from '../../power/useCurrentUser'
import { createOrder, createOrderLine, deleteOrder } from '../../data/mutations'
import { formatMoney } from '../../data/format'
import { STATUS_SUBMITTED } from '../../data/labels'
import { Button } from '../../components/Button'
import { useToast } from '../../components/toast/useToast'
import { useCart } from './useCart'
import './cart.css'

interface CartDrawerProps {
  open: boolean
  onClose: () => void
  /** Jump to the My Orders view (offered after a successful submit). */
  onViewOrders: () => void
}

type SubmitResult =
  | { kind: 'error'; message: string }
  | { kind: 'success'; ref: string; itemCount: number }
  | null

/**
 * Slide-over cart panel. The inner panel holds the submit state machine; the
 * outer wrapper remounts it (via `sessionKey`, bumped on close) so a prior
 * submit's success confirmation never lingers into the next session
 * (useActionState can't be reset directly). Cart items live in CartProvider, so
 * the remount doesn't lose them.
 */
export function CartDrawer({ open, onClose, onViewOrders }: CartDrawerProps) {
  const [sessionKey, setSessionKey] = useState(0)

  const handleClose = () => {
    setSessionKey((k) => k + 1)
    onClose()
  }

  if (!open) return null
  return <CartDrawerPanel key={sessionKey} onClose={handleClose} onViewOrders={onViewOrders} />
}

function CartDrawerPanel({
  onClose,
  onViewOrders,
}: {
  onClose: () => void
  onViewOrders: () => void
}) {
  const { items, count, subtotal, setQuantity, remove, clear } = useCart()
  const { user } = useCurrentUser()
  const { notify } = useToast()
  const closeRef = useRef<HTMLButtonElement>(null)

  // Esc to close + focus the close button on open (plain-div dialog a11y).
  useEffect(() => {
    closeRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

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
        const message = header.error ?? 'Could not create order.'
        notify(message, 'error')
        return { kind: 'error', message }
      }
      const orderId = header.data.poc_orderid

      // 2) Create one line per item, sequentially. On any failure, roll back the
      // header so no half-order is left behind, and keep the cart for retry.
      for (const item of items) {
        const line = await createOrderLine(orderId, item.productId, item.quantity)
        if (!line.ok) {
          await deleteOrder(orderId)
          const message =
            'Could not add items to your order. Nothing was submitted; please try again.'
          notify(message, 'error')
          return { kind: 'error', message }
        }
      }

      // 3) Success — capture details before clearing the cart.
      const ref = `#${orderId.slice(0, 8).toUpperCase()}`
      const confirmation: SubmitResult = { kind: 'success', ref, itemCount: count }
      clear()
      notify(`Order ${ref} submitted.`, 'success')
      return confirmation
    },
    null,
  )

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
          <button
            ref={closeRef}
            type="button"
            className="cart-drawer__close"
            onClick={onClose}
            aria-label="Close cart"
          >
            ✕
          </button>
        </header>

        {result?.kind === 'success' ? (
          <div className="cart-drawer__body cart-success">
            <div className="cart-success__check" aria-hidden="true">
              ✓
            </div>
            <p className="cart-success__title">Order submitted</p>
            <p className="muted">
              <strong>{result.ref}</strong> · {result.itemCount} item
              {result.itemCount === 1 ? '' : 's'}
            </p>
            <div className="cart-success__actions">
              <Button variant="secondary" onClick={onClose}>
                Keep shopping
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  onViewOrders()
                  onClose()
                }}
              >
                View my orders
              </Button>
            </div>
          </div>
        ) : items.length === 0 ? (
          <div className="cart-drawer__body cart-drawer__empty">
            <p className="muted">Your cart is empty.</p>
            <p className="cart-empty__hint muted">Add products from the catalog to get started.</p>
          </div>
        ) : (
          <form action={submitAction} className="cart-drawer__body">
            <ul className="cart-lines">
              {items.map((item) => (
                <li key={item.productId} className="cart-line">
                  <div className="cart-line__info">
                    <span className="cart-line__name">{item.name}</span>
                    <span className="muted cart-line__unit">{formatMoney(item.unitPrice)} each</span>
                  </div>
                  <div className="qty-stepper">
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

            <label className="field cart-notes">
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

            <Button
              type="submit"
              variant="primary"
              block
              loading={isPending}
              disabled={count === 0}
            >
              Submit order
            </Button>
          </form>
        )}
      </aside>
    </div>
  )
}
