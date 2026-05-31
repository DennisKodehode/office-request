import { useState } from 'react'
import type { Poc_products } from '../../generated/models/Poc_productsModel'
import { categoryLabel } from '../../data/labels'
import type { ProductCategory } from '../../data/labels'
import { formatMoney } from '../../data/format'
import { Badge } from '../../components/Badge'
import { Button } from '../../components/Button'
import { useCart } from '../cart/useCart'

interface ProductCardProps {
  product: Poc_products
  isAdmin: boolean
  onEdit: (product: Poc_products) => void
  onToggleAvailability: (product: Poc_products) => void
  busy: boolean
}

/**
 * A single catalog product. Read-only for users; admins get an Edit /
 * availability-toggle footer. Unavailable products are dimmed (admins only —
 * users never receive unavailable rows).
 */
export function ProductCard({
  product,
  isAdmin,
  onEdit,
  onToggleAvailability,
  busy,
}: ProductCardProps) {
  const { add } = useCart()
  const [imageFailed, setImageFailed] = useState(false)
  const [qty, setQty] = useState(1)
  const available = product.poc_available ?? false
  const showImage = !!product.poc_image && !imageFailed
  const name = product.poc_product1 ?? 'Untitled product'

  function handleAdd() {
    add(
      { productId: product.poc_productid, name, unitPrice: product.poc_unitprice ?? 0 },
      qty,
    )
    setQty(1)
  }

  return (
    <article className={`product-card${available ? '' : ' product-card--unavailable'}`}>
      <div className="product-card__image">
        {showImage ? (
          <img src={product.poc_image} alt={name} onError={() => setImageFailed(true)} />
        ) : (
          <span className="product-card__image-fallback" aria-hidden="true">
            No image
          </span>
        )}
        {isAdmin && !available && (
          <span className="product-card__tag">
            <Badge tone="rejected">Unavailable</Badge>
          </span>
        )}
      </div>

      <div className="product-card__body">
        {product.poc_category != null && (
          <span className="product-card__category">
            {categoryLabel(product.poc_category as ProductCategory)}
          </span>
        )}
        <h3 className="product-card__name">{name}</h3>
        {product.poc_description && (
          <p className="product-card__description">{product.poc_description}</p>
        )}
        <div className="product-card__price">
          {product.poc_unitprice != null ? formatMoney(product.poc_unitprice) : '—'}
        </div>

        <div className="product-card__buy">
          <div className="qty-stepper">
            <button
              type="button"
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              aria-label="Decrease quantity"
              disabled={!available || qty <= 1}
            >
              −
            </button>
            <span>{qty}</span>
            <button
              type="button"
              onClick={() => setQty((q) => q + 1)}
              aria-label="Increase quantity"
              disabled={!available}
            >
              +
            </button>
          </div>
          <Button variant="primary" size="sm" onClick={handleAdd} disabled={!available}>
            Add
          </Button>
        </div>
      </div>

      {isAdmin && (
        <div className="product-card__actions">
          <Button variant="ghost" size="sm" onClick={() => onEdit(product)} disabled={busy}>
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onToggleAvailability(product)}
            loading={busy}
          >
            {available ? 'Hide' : 'Show'}
          </Button>
        </div>
      )}
    </article>
  )
}
