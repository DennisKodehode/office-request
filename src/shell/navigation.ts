/** The top-level views, switched by the header tabs (no router by design). */
export type View = 'catalog' | 'myorders' | 'allorders'

export interface NavItem {
  id: View
  label: string
  /** Only shown to admins (gated by useIsAdmin). */
  adminOnly?: boolean
}

/** Data-driven nav tabs, rendered by AppHeader. */
export const NAV_ITEMS: readonly NavItem[] = [
  { id: 'catalog', label: 'Catalog' },
  { id: 'myorders', label: 'My Orders' },
  { id: 'allorders', label: 'All Orders', adminOnly: true },
]
