import { useState } from 'react'
import type { Poc_orderlines } from '../../generated/models/Poc_orderlinesModel'
import type { MutationResult } from '../../data/types'
import {
  deleteOrder,
  deleteOrderLine,
  updateOrderLine,
  updateOrderNotes,
} from '../../data/mutations'

interface OrderLineEditorProps {
  orderId: string
  lines: Poc_orderlines[]
  notes: string | undefined
  /** Refresh detail + list after a line/notes change. */
  onChanged: () => void
  /** After the whole order is cancelled (collapse + list refresh). */
  onCancelled: () => void
}

/**
 * Owner edit controls for a Submitted order. Quantity ± and Remove apply
 * immediately (each a single mutation + refresh — the loaded order stays the
 * source of truth, no local diff to reconcile). Notes have an explicit Save.
 * The last remaining line can't be removed — cancelling the order is the path
 * to an empty order.
 */
export function OrderLineEditor({
  orderId,
  lines,
  notes,
  onChanged,
  onCancelled,
}: OrderLineEditorProps) {
  const [draftNotes, setDraftNotes] = useState(notes ?? '')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | undefined>(undefined)

  async function apply(result: Promise<MutationResult<unknown>>, after: () => void) {
    setError(undefined)
    setPending(true)
    const res = await result
    setPending(false)
    if (res.ok) after()
    else setError(res.error ?? 'Something went wrong.')
  }

  return (
    <div className="order-editor">
      <ul className="order-lines order-lines--edit">
        {lines.map((line) => {
          const qty = line.poc_quantity ?? 1
          return (
            <li key={line.poc_orderlineid} className="order-line">
              <span className="order-line__name">{line.poc_productname ?? 'Product'}</span>
              <div className="order-line__qty">
                <button
                  type="button"
                  onClick={() => apply(updateOrderLine(line.poc_orderlineid, qty - 1), onChanged)}
                  aria-label="Decrease quantity"
                  disabled={pending || qty <= 1}
                >
                  −
                </button>
                <span>{qty}</span>
                <button
                  type="button"
                  onClick={() => apply(updateOrderLine(line.poc_orderlineid, qty + 1), onChanged)}
                  aria-label="Increase quantity"
                  disabled={pending}
                >
                  +
                </button>
              </div>
              <button
                type="button"
                className="order-line__remove"
                onClick={() => apply(deleteOrderLine(line.poc_orderlineid), onChanged)}
                disabled={pending || lines.length <= 1}
                title={
                  lines.length <= 1
                    ? 'An order needs at least one item — cancel the order instead'
                    : undefined
                }
              >
                Remove
              </button>
            </li>
          )
        })}
      </ul>

      <label className="order-notes">
        Notes
        <textarea
          rows={2}
          value={draftNotes}
          onChange={(e) => setDraftNotes(e.target.value)}
          disabled={pending}
        />
      </label>

      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}

      <div className="order-editor__actions">
        <button
          type="button"
          onClick={() => apply(updateOrderNotes(orderId, draftNotes.trim()), onChanged)}
          disabled={pending}
        >
          Save notes
        </button>
        <button
          type="button"
          className="order-cancel"
          onClick={() => apply(deleteOrder(orderId), onCancelled)}
          disabled={pending}
        >
          Cancel order
        </button>
      </div>
    </div>
  )
}
