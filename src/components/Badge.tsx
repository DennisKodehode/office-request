import type { ReactNode } from 'react'
import './badge.css'

type Tone =
  | 'accent'
  | 'neutral'
  | 'submitted'
  | 'approved'
  | 'assigned'
  | 'fulfilled'
  | 'rejected'

/** A small pill label — admin marker and order-status indicator. */
export function Badge({ tone = 'neutral', children }: { tone?: Tone; children: ReactNode }) {
  return <span className={`badge badge--${tone}`}>{children}</span>
}
