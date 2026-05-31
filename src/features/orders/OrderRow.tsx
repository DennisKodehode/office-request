import type { Poc_orders } from '../../generated/models/Poc_ordersModel'
import { statusLabel, statusTone } from '../../data/labels'
import type { OrderStatus } from '../../data/labels'
import { formatDate } from '../../data/format'
import { Badge } from '../../components/Badge'
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
    <li className={`order-row${open ? ' order-row--open' : ''}`}>
      <button
        type="button"
        className="order-row__summary"
        onClick={() => onToggle(id)}
        aria-expanded={open}
      >
        <span className="order-row__ref">{ref}</span>
        <Badge tone={statusTone(status)}>{statusLabel(status)}</Badge>
        <span className="muted order-row__date">
          {formatDate(order.poc_requesteddate ?? order.createdon)}
        </span>
        {isAdmin && <span className="muted order-row__by">{order.poc_requestedby}</span>}
        <span className={`order-row__chevron${open ? ' order-row__chevron--open' : ''}`} aria-hidden="true">
          ▸
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
