import type { Poc_orders } from '../../generated/models/Poc_ordersModel'
import { statusLabel } from '../../data/labels'
import type { OrderStatus } from '../../data/labels'
import { formatDate } from '../../data/format'
import { OrderDetail } from './OrderDetail'

interface OrderRowProps {
  order: Poc_orders
  isAdmin: boolean
  open: boolean
  onToggle: (id: string) => void
  onListRefetch: () => void
}

/**
 * One order in the list: a clickable summary (ref, status, date, and the
 * requester for admins) that expands in place to the full OrderDetail.
 */
export function OrderRow({ order, isAdmin, open, onToggle, onListRefetch }: OrderRowProps) {
  const id = order.poc_orderid
  const status = order.poc_status as OrderStatus | undefined
  const ref = `#${id.slice(0, 8).toUpperCase()}`

  return (
    <li className="order-row">
      <button
        type="button"
        className="order-row__summary"
        onClick={() => onToggle(id)}
        aria-expanded={open}
      >
        <span className="order-row__ref">{ref}</span>
        <span className={`order-badge order-badge--${status ?? 'unknown'}`}>
          {statusLabel(status)}
        </span>
        <span className="muted order-row__date">
          {formatDate(order.poc_requesteddate ?? order.createdon)}
        </span>
        {isAdmin && <span className="muted order-row__by">{order.poc_requestedby}</span>}
        <span className="order-row__chevron" aria-hidden="true">
          {open ? '▾' : '▸'}
        </span>
      </button>

      {open && (
        <OrderDetail
          orderId={id}
          isAdmin={isAdmin}
          onListRefetch={onListRefetch}
          onCollapse={() => onToggle(id)}
        />
      )}
    </li>
  )
}
