import { useContext } from 'react'
import { ToastContext, type ToastContextValue } from './toastContext'

/** Show transient toast notifications. Must be used within <ToastProvider>. */
export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) {
    throw new Error('useToast must be used within <ToastProvider>')
  }
  return ctx
}
