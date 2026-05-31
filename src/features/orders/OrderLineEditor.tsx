import { useState } from 'react'
import type { Poc_orderlines } from '../../generated/models/Poc_orderlinesModel'
import type { MutationResult } from '../../data/types'
import { lineProductName } from './orderLineName'
import {
  deleteOrder,
  deleteOrderLine,
  updateOrderLine,
  updateOrderNotes,
} from '../../data/mutations'
import { Button } from '../../components/Button'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import { useToast } from '../../components/toast/useToast'

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
 * source of truth). Notes have an explicit Save. The last remaining line can't
 * be removed — cancelling the order (confirm-gated) is the path to an empty
 * order.
 */
export function OrderLineEditor({
  orderId,
  lines,
  notes,
  onChanged,
  onCancelled,
}: OrderLineEditorProps) {
  const { notify } = useToast()
  const [draftNotes, setDraftNotes] = useState(notes ?? '')
  const [pending, setPending] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [cancelling, setCancelling] = useState(false)

  async function apply(
    result: Promise<MutationResult<unknown>>,
    after: () => void,
    successMsg?: string,
  ) {
    setPending(true)
    const res = await result
    setPending(false)
    if (res.ok) {
      after()
      if (successMsg) notify(successMsg, 'success')
    } else {
      notify(res.error ?? 'Something went wrong.', 'error')
    }
  }

  async function confirmCancel() {
    setCancelling(true)
    const res = await deleteOrder(orderId)
    setCancelling(false)
    setConfirming(false)
    if (res.ok) {
      onCancelled()
      notify('Order cancelled.', 'success')
    } else {
      notify(res.error ?? 'Could not cancel the order.', 'error')
    }
  }

  return (
    <div className="order-editor">
      <ul className="order-lines order-lines--edit">
        {lines.map((line) => {
          const qty = line.poc_quantity ?? 1
          return (
            <li key={line.poc_orderlineid} className="order-line">
              <span className="order-line__name">{lineProductName(line)}</span>
              <div className="qty-stepper">
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

      <label className="field order-notes">
        Notes
        <textarea
          rows={2}
          value={draftNotes}
          onChange={(e) => setDraftNotes(e.target.value)}
          disabled={pending}
        />
      </label>

      <div className="order-editor__actions">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => apply(updateOrderNotes(orderId, draftNotes.trim()), onChanged, 'Notes saved.')}
          disabled={pending}
        >
          Save notes
        </Button>
        <Button
          variant="danger"
          size="sm"
          onClick={() => setConfirming(true)}
          disabled={pending}
        >
          Cancel order
        </Button>
      </div>

      {confirming && (
        <ConfirmDialog
          title="Cancel this order?"
          message="This removes the order and its items. This can’t be undone."
          confirmLabel="Cancel order"
          cancelLabel="Keep order"
          destructive
          busy={cancelling}
          onConfirm={confirmCancel}
          onCancel={() => setConfirming(false)}
        />
      )}
    </div>
  )
}
