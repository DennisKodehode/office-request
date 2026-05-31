import { useState } from 'react'
import type { OrderStatus } from '../../data/labels'
import { nextTransitions } from '../../data/labels'
import { setOrderStatus } from '../../data/mutations'

interface OrderStatusControlsProps {
  orderId: string
  status: OrderStatus
  /** Called after a successful status change (refresh detail + list). */
  onChanged: () => void
}

/**
 * Admin status controls: only the valid next-step transitions for the current
 * status are offered (from ORDER_STATUS_TRANSITIONS), so illogical jumps aren't
 * possible. Terminal statuses render nothing.
 */
export function OrderStatusControls({ orderId, status, onChanged }: OrderStatusControlsProps) {
  const [pending, setPending] = useState<OrderStatus | undefined>(undefined)
  const [error, setError] = useState<string | undefined>(undefined)
  const transitions = nextTransitions(status)

  if (transitions.length === 0) return null

  async function go(to: OrderStatus) {
    setError(undefined)
    setPending(to)
    const res = await setOrderStatus(orderId, to)
    setPending(undefined)
    if (res.ok) onChanged()
    else setError(res.error ?? 'Could not change status.')
  }

  return (
    <div className="order-actions">
      {transitions.map((t) => (
        <button
          key={t.to}
          type="button"
          onClick={() => go(t.to)}
          disabled={pending !== undefined}
        >
          {pending === t.to ? 'Working…' : t.label}
        </button>
      ))}
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
