import { useOrder } from '../../data/useOrder'
import { useCurrentUser } from '../../power/useCurrentUser'
import { STATUS_SUBMITTED, statusLabel } from '../../data/labels'
import type { OrderStatus } from '../../data/labels'
import { OrderStatusControls } from './OrderStatusControls'
import { OrderLineEditor } from './OrderLineEditor'
import { lineProductName } from './orderLineName'

interface OrderDetailProps {
  orderId: string
  isAdmin: boolean
  /** Refresh the parent list (status badge) after any change here. */
  onListRefetch: () => void
  /** Collapse this row (used after the order is cancelled). */
  onCollapse: () => void
}

/**
 * Expanded order detail: lazily loads the order + its lines (only when a row is
 * open, so one line-query fires per opened order). Shows lines (name + qty — no
 * money, since lines carry no unit price). Admins get next-step status buttons;
 * the owner gets edit controls while the order is still Submitted.
 */
export function OrderDetail({ orderId, isAdmin, onListRefetch, onCollapse }: OrderDetailProps) {
  const { data, loading, error, refetch } = useOrder(orderId)
  const { user } = useCurrentUser()

  if (loading && data === undefined) {
    return <p className="muted">Loading order…</p>
  }
  if (error) {
    return (
      <p className="error" role="alert">
        Couldn’t load order items: {error}
      </p>
    )
  }
  if (!data) return null

  const { order, lines } = data
  const status = order.poc_status as OrderStatus | undefined
  const isSubmitted = status === STATUS_SUBMITTED
  const isOwner = order.poc_requestedby === user.objectId
  const canEdit = isSubmitted && (isOwner || isAdmin)

  function afterChange() {
    refetch()
    onListRefetch()
  }

  function afterCancel() {
    onCollapse()
    onListRefetch()
  }

  return (
    <div className="order-detail">
      {!canEdit && (
        <ul className="order-lines">
          {lines.length === 0 && <li className="muted">This order has no items.</li>}
          {lines.map((line) => (
            <li key={line.poc_orderlineid} className="order-line">
              <span className="order-line__name">{lineProductName(line)}</span>
              <span className="order-line__qty-read">Qty {line.poc_quantity ?? 0}</span>
            </li>
          ))}
        </ul>
      )}

      {order.poc_notes && !canEdit && (
        <p className="order-detail__notes">
          <span className="muted">Notes: </span>
          {order.poc_notes}
        </p>
      )}

      {isAdmin && status != null && (
        <OrderStatusControls orderId={orderId} status={status} onChanged={afterChange} />
      )}

      {canEdit && (
        <OrderLineEditor
          orderId={orderId}
          lines={lines}
          notes={order.poc_notes}
          onChanged={afterChange}
          onCancelled={afterCancel}
        />
      )}

      {!canEdit && !isAdmin && status != null && (
        <p className="muted order-detail__locked">
          This order is {statusLabel(status).toLowerCase()} and can no longer be changed.
        </p>
      )}
    </div>
  )
}
