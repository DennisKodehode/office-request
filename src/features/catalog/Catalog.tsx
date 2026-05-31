import { useState, type ReactNode } from 'react'
import type { Poc_products } from '../../generated/models/Poc_productsModel'
import { useProducts } from '../../data/useProducts'
import { useIsAdmin } from '../../power/useIsAdmin'
import { setProductAvailability } from '../../data/mutations'
import { PRODUCT_CATEGORY_OPTIONS, type ProductCategory } from '../../data/labels'
import { AsyncSection } from '../../components/AsyncSection'
import { Button } from '../../components/Button'
import { useToast } from '../../components/toast/useToast'
import { ProductCard } from './ProductCard'
import { ProductFormDialog } from './ProductFormDialog'
import './catalog.css'

type DialogState =
  | { mode: 'closed' }
  | { mode: 'add' }
  | { mode: 'edit'; product: Poc_products }

type CategoryFilter = ProductCategory | 'all'

/**
 * The product catalog page. Users browse available products read-only; admins
 * additionally add/edit and toggle availability. Search + category filter run
 * client-side over the already-loaded list (no extra queries).
 */
export function Catalog() {
  const isAdmin = useIsAdmin()
  const { notify } = useToast()
  const products = useProducts()
  const { refetch } = products
  const [dialog, setDialog] = useState<DialogState>({ mode: 'closed' })
  const [togglingId, setTogglingId] = useState<string | undefined>(undefined)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<CategoryFilter>('all')

  async function handleToggleAvailability(product: Poc_products) {
    setTogglingId(product.poc_productid)
    const next = !(product.poc_available ?? false)
    const res = await setProductAvailability(product.poc_productid, next)
    setTogglingId(undefined)
    if (res.ok) {
      refetch()
      notify(next ? 'Product is now available.' : 'Product hidden from the catalog.', 'success')
    } else {
      notify(res.error ?? 'Could not update availability.', 'error')
    }
  }

  function handleSaved(mode: 'add' | 'edit') {
    setDialog({ mode: 'closed' })
    refetch()
    notify(mode === 'add' ? 'Product added.' : 'Product updated.', 'success')
  }

  function filterProducts(list: Poc_products[]): Poc_products[] {
    const q = search.trim().toLowerCase()
    return list.filter((p) => {
      const matchesText = !q || (p.poc_product1 ?? '').toLowerCase().includes(q)
      const matchesCat = category === 'all' || p.poc_category === category
      return matchesText && matchesCat
    })
  }

  return (
    <section className="catalog">
      <div className="catalog__header">
        <div>
          <h2>Catalog</h2>
          <p className="muted catalog__subtitle">Browse and order office equipment.</p>
        </div>
        {isAdmin && (
          <Button variant="primary" onClick={() => setDialog({ mode: 'add' })}>
            + Add product
          </Button>
        )}
      </div>

      <div className="catalog__toolbar">
        <input
          className="input catalog__search"
          type="search"
          placeholder="Search products…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search products"
        />
        <div className="catalog__chips" role="group" aria-label="Filter by category">
          <CategoryChip active={category === 'all'} onClick={() => setCategory('all')}>
            All
          </CategoryChip>
          {PRODUCT_CATEGORY_OPTIONS.map(([code, label]) => (
            <CategoryChip
              key={code}
              active={category === code}
              onClick={() => setCategory(code)}
            >
              {label}
            </CategoryChip>
          ))}
        </div>
      </div>

      <AsyncSection
        query={products}
        loadingText="Loading catalog…"
        empty={
          <p className="muted catalog__empty">
            No products yet.{isAdmin && ' Use “+ Add product” to create one.'}
          </p>
        }
      >
        {(list) => {
          const filtered = filterProducts(list)
          if (filtered.length === 0) {
            return <p className="muted catalog__empty">No products match your search.</p>
          }
          return (
            <div className="catalog__grid">
              {filtered.map((product) => (
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
          )
        }}
      </AsyncSection>

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

function CategoryChip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      className="catalog__chip"
      aria-pressed={active}
      onClick={onClick}
    >
      {children}
    </button>
  )
}
