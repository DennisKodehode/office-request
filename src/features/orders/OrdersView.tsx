import { useState } from 'react'
import { useMyOrders, useAllOrders } from '../../data/useOrders'
import { useIsAdmin } from '../../power/useIsAdmin'
import type { QueryResult } from '../../data/types'
import type { Poc_orders } from '../../generated/models/Poc_ordersModel'
import { OrderRow } from './OrderRow'
import './orders.css'

/**
 * Orders list for either "My Orders" (user) or "All Orders" (admin). The two
 * wrappers below pick the data source so each calls only its own query hook
 * (hooks can't be conditional) — the shared list rendering lives in OrdersList.
 */
export function MyOrdersView() {
  return <OrdersList title="My orders" query={useMyOrders()} empty="You have no orders yet." />
}

export function AllOrdersView() {
  return <OrdersList title="All orders" query={useAllOrders()} empty="No orders yet." />
}

interface OrdersListProps {
  title: string
  query: QueryResult<Poc_orders[]>
  empty: string
}

function OrdersList({ title, query, empty }: OrdersListProps) {
  const isAdmin = useIsAdmin()
  const { data: orders, loading, error, refetch } = query
  const [openId, setOpenId] = useState<string | undefined>(undefined)
  const toggle = (id: string) => setOpenId((cur) => (cur === id ? undefined : id))

  return (
    <section className="orders">
      <h2>{title}</h2>

      {loading && orders === undefined && <p className="muted">Loading orders…</p>}
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      {orders && orders.length === 0 && <p className="muted">{empty}</p>}

      {orders && orders.length > 0 && (
        <ul className="orders__list">
          {orders.map((order) => (
            <OrderRow
              key={order.poc_orderid}
              order={order}
              isAdmin={isAdmin}
              open={openId === order.poc_orderid}
              onToggle={toggle}
              onListRefetch={refetch}
            />
          ))}
        </ul>
      )}
    </section>
  )
}
