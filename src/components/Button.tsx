import type { ButtonHTMLAttributes, ReactNode } from 'react'
import './button.css'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  /** Full-width button. */
  block?: boolean
  /** Shows a spinner and disables the button. */
  loading?: boolean
  children: ReactNode
}

/**
 * The app's standard button. Token-driven variants + sizes, a consistent
 * focus ring (from index.css), hover/active feedback, and a loading state.
 */
export function Button({
  variant = 'secondary',
  size = 'md',
  block = false,
  loading = false,
  disabled,
  children,
  className,
  type = 'button',
  ...rest
}: ButtonProps) {
  const classes = [
    'btn',
    `btn--${variant}`,
    `btn--${size}`,
    block ? 'btn--block' : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button type={type} className={classes} disabled={disabled || loading} {...rest}>
      {loading && <span className="btn__spinner" aria-hidden="true" />}
      {children}
    </button>
  )
}
