import { useState } from 'react'
import type { OrderStatus } from '../../data/labels'
import { nextTransitions } from '../../data/labels'
import { setOrderStatus, deleteOrder } from '../../data/mutations'
import { Button } from '../../components/Button'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import { useToast } from '../../components/toast/useToast'

interface OrderStatusControlsProps {
  orderId: string
  status: OrderStatus
  /** Called after a successful status change (refresh detail + list). */
  onChanged: () => void
  /** Called after the order is deleted (collapse + list refresh). */
  onDeleted: () => void
}

/**
 * Admin controls: guided next-step status transitions (only valid moves, from
 * ORDER_STATUS_TRANSITIONS) plus a confirm-gated Delete. Terminal statuses still
 * allow delete.
 */
export function OrderStatusControls({
  orderId,
  status,
  onChanged,
  onDeleted,
}: OrderStatusControlsProps) {
  const { notify } = useToast()
  const [pending, setPending] = useState<OrderStatus | undefined>(undefined)
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const transitions = nextTransitions(status)

  async function go(to: OrderStatus, label: string) {
    setPending(to)
    const res = await setOrderStatus(orderId, to)
    setPending(undefined)
    if (res.ok) {
      onChanged()
      notify(`Order ${label.toLowerCase()}.`, 'success')
    } else {
      notify(res.error ?? 'Could not change status.', 'error')
    }
  }

  async function confirmDelete() {
    setDeleting(true)
    const res = await deleteOrder(orderId)
    setDeleting(false)
    setConfirming(false)
    if (res.ok) {
      onDeleted()
      notify('Order deleted.', 'success')
    } else {
      notify(res.error ?? 'Could not delete order.', 'error')
    }
  }

  return (
    <div className="order-actions">
      {transitions.map((t) => (
        <Button
          key={t.to}
          variant={t.label === 'Reject' ? 'danger' : 'primary'}
          size="sm"
          onClick={() => go(t.to, pastTense(t.label))}
          loading={pending === t.to}
          disabled={pending !== undefined}
        >
          {t.label}
        </Button>
      ))}
      <Button variant="ghost" size="sm" onClick={() => setConfirming(true)} disabled={pending !== undefined}>
        Delete
      </Button>

      {confirming && (
        <ConfirmDialog
          title="Delete this order?"
          message="This permanently removes the order and its items. This can’t be undone."
          confirmLabel="Delete order"
          destructive
          busy={deleting}
          onConfirm={confirmDelete}
          onCancel={() => setConfirming(false)}
        />
      )}
    </div>
  )
}

/** "Approve" -> "approved" etc., for the success toast. */
function pastTense(label: string): string {
  if (label === 'Approve') return 'Approved'
  if (label === 'Reject') return 'Rejected'
  if (label === 'Assign') return 'Assigned'
  if (label === 'Mark fulfilled') return 'Fulfilled'
  return label
}
