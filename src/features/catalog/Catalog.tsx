import { useState } from 'react'
import type { Poc_products } from '../../generated/models/Poc_productsModel'
import { useProducts } from '../../data/useProducts'
import { useIsAdmin } from '../../power/useIsAdmin'
import { setProductAvailability } from '../../data/mutations'
import { ProductCard } from './ProductCard'
import { ProductFormDialog } from './ProductFormDialog'
import './catalog.css'

type DialogState =
  | { mode: 'closed' }
  | { mode: 'add' }
  | { mode: 'edit'; product: Poc_products }

/**
 * The product catalog page. Users browse available products read-only; admins
 * additionally add/edit and toggle availability. All data flows through the
 * Phase 2 hooks/mutations; admin controls are gated by useIsAdmin().
 */
export function Catalog() {
  const isAdmin = useIsAdmin()
  const { data: products, loading, error, refetch } = useProducts()
  const [dialog, setDialog] = useState<DialogState>({ mode: 'closed' })
  const [togglingId, setTogglingId] = useState<string | undefined>(undefined)
  const [actionError, setActionError] = useState<string | undefined>(undefined)

  async function handleToggleAvailability(product: Poc_products) {
    setActionError(undefined)
    setTogglingId(product.poc_productid)
    const res = await setProductAvailability(
      product.poc_productid,
      !(product.poc_available ?? false),
    )
    setTogglingId(undefined)
    if (res.ok) refetch()
    else setActionError(res.error ?? 'Could not update availability.')
  }

  function handleSaved() {
    setDialog({ mode: 'closed' })
    refetch()
  }

  return (
    <section className="catalog">
      <div className="catalog__header">
        <h2>Catalog</h2>
        {isAdmin && (
          <button type="button" onClick={() => setDialog({ mode: 'add' })}>
            + Add product
          </button>
        )}
      </div>

      {actionError && (
        <p className="error" role="alert">
          {actionError}
        </p>
      )}

      {loading && products === undefined && <p className="muted">Loading catalog…</p>}
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      {products && products.length === 0 && (
        <p className="muted">
          No products yet.{isAdmin && ' Use “+ Add product” to create one.'}
        </p>
      )}

      {products && products.length > 0 && (
        <div className="catalog__grid">
          {products.map((product) => (
            <ProductCard
              key={product.poc_productid}
              product={product}
              isAdmin={isAdmin}
              onEdit={(p) => setDialog({ mode: 'edit', product: p })}
              onToggleAvailability={handleToggleAvailability}
              busy={togglingId === product.poc_productid}
            />
          ))}
        </div>
      )}

      {dialog.mode !== 'closed' && (
        <ProductFormDialog
          product={dialog.mode === 'edit' ? dialog.product : null}
          onClose={() => setDialog({ mode: 'closed' })}
          onSaved={handleSaved}
        />
      )}
    </section>
  )
}
