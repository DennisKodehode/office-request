import { useActionState, useEffect, useRef } from 'react'
import type { Poc_products } from '../../generated/models/Poc_productsModel'
import { PRODUCT_CATEGORY_OPTIONS, parseCategory } from '../../data/labels'
import { createProduct, updateProduct } from '../../data/mutations'
import { Button } from '../../components/Button'

interface ProductFormDialogProps {
  /** The product being edited, or null when adding a new one. */
  product: Poc_products | null
  onClose: () => void
  /** Called after a successful create/update so the parent can refetch + toast. */
  onSaved: (mode: 'add' | 'edit') => void
}

type FormResult = { error: string } | null

/**
 * Add/edit product form in a native <dialog>. Uses a React 19 form action +
 * useActionState for built-in pending/error handling. The same dialog handles
 * both modes — `product` null means add, otherwise edit (fields prefilled).
 */
export function ProductFormDialog({ product, onClose, onSaved }: ProductFormDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const isEdit = product !== null

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (!dialog.open) dialog.showModal()
    const handleCancel = (e: Event) => {
      e.preventDefault()
      onClose()
    }
    dialog.addEventListener('cancel', handleCancel)
    return () => dialog.removeEventListener('cancel', handleCancel)
  }, [onClose])

  const [result, submitAction, isPending] = useActionState<FormResult, FormData>(
    async (_prev, formData) => {
      const name = (formData.get('name') as string)?.trim()
      if (!name) return { error: 'Name is required.' }

      const priceRaw = (formData.get('price') as string)?.trim()
      const price = priceRaw === '' ? undefined : Number(priceRaw)
      if (price !== undefined && (Number.isNaN(price) || price < 0)) {
        return { error: 'Price must be a non-negative number.' }
      }

      const image = (formData.get('image') as string)?.trim()
      const description = (formData.get('description') as string)?.trim()

      const fields = {
        poc_product1: name,
        poc_category: parseCategory(formData.get('category') as string),
        poc_available: formData.get('available') === 'on',
        ...(price !== undefined && { poc_unitprice: price }),
        ...(image && { poc_image: image }),
        ...(description && { poc_description: description }),
      }

      const res = isEdit
        ? await updateProduct(product.poc_productid, fields)
        : await createProduct(fields)

      if (!res.ok) return { error: res.error ?? 'Save failed.' }
      onSaved(isEdit ? 'edit' : 'add')
      return null
    },
    null,
  )

  const defaultCategory =
    (product?.poc_category as number | undefined) ?? PRODUCT_CATEGORY_OPTIONS[0][0]

  return (
    <dialog ref={dialogRef} className="product-dialog">
      <form action={submitAction} className="product-form">
        <h2>{isEdit ? 'Edit product' : 'Add product'}</h2>

        <label className="field">
          Name
          <input name="name" type="text" defaultValue={product?.poc_product1 ?? ''} required />
        </label>

        <label className="field">
          Category
          <select name="category" defaultValue={defaultCategory}>
            {PRODUCT_CATEGORY_OPTIONS.map(([code, label]) => (
              <option key={code} value={code}>
                {label}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          Unit price (USD)
          <input
            name="price"
            type="number"
            min="0"
            step="0.01"
            defaultValue={product?.poc_unitprice ?? ''}
          />
        </label>

        <label className="field">
          Image URL
          <input name="image" type="url" defaultValue={product?.poc_image ?? ''} />
        </label>

        <label className="field">
          Description
          <textarea name="description" rows={3} defaultValue={product?.poc_description ?? ''} />
        </label>

        <label className="field field--row">
          <input
            name="available"
            type="checkbox"
            defaultChecked={product ? (product.poc_available ?? false) : true}
          />
          Available in catalog
        </label>

        {result?.error && (
          <p className="error" role="alert">
            {result.error}
          </p>
        )}

        <div className="product-form__actions">
          <Button variant="ghost" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" loading={isPending}>
            Save
          </Button>
        </div>
      </form>
    </dialog>
  )
}
