import {
  ORDER_STATUS_STEPS,
  STATUS_REJECTED,
  statusLabel,
  type OrderStatus,
} from '../../data/labels'

/**
 * Read-only visual of an order's progress along the happy path
 * (Submitted → Approved → Assigned → Fulfilled). A rejected order is shown as a
 * single terminal state instead of the track.
 */
export function OrderStatusStepper({ status }: { status: OrderStatus }) {
  if (status === STATUS_REJECTED) {
    return (
      <div className="stepper stepper--rejected">
        <span className="stepper__dot stepper__dot--rejected" aria-hidden="true" />
        <span>{statusLabel(STATUS_REJECTED)}</span>
      </div>
    )
  }

  const currentIndex = ORDER_STATUS_STEPS.indexOf(status)

  return (
    <ol className="stepper" aria-label="Order progress">
      {ORDER_STATUS_STEPS.map((step, i) => {
        const state = i < currentIndex ? 'done' : i === currentIndex ? 'current' : 'upcoming'
        return (
          <li key={step} className={`stepper__step stepper__step--${state}`}>
            <span className="stepper__dot" aria-hidden="true">
              {state === 'done' ? '✓' : ''}
            </span>
            <span className="stepper__label">{statusLabel(step)}</span>
          </li>
        )
      })}
    </ol>
  )
}
