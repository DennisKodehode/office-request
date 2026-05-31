/** The top-level views, switched by the sidebar nav (no router by design). */
export type View = 'catalog' | 'myorders' | 'allorders'

export interface NavItem {
  id: View
  label: string
  /** Stroke-path `d` for a 24×24 line icon, rendered by AppSidebar. */
  icon: string
  /** Only shown to admins (gated by useIsAdmin). */
  adminOnly?: boolean
}

/** Data-driven nav, rendered by AppSidebar. */
export const NAV_ITEMS: readonly NavItem[] = [
  {
    id: 'catalog',
    label: 'Catalog',
    icon: 'M4 5h6v6H4zM14 5h6v6h-6zM4 15h6v6H4zM14 15h6v6h-6z',
  },
  {
    id: 'myorders',
    label: 'My Orders',
    icon: 'M7 3h10v18H7zM10 8h4M10 12h4M10 16h4',
  },
  {
    id: 'allorders',
    label: 'All Orders',
    icon: 'M12 3 3 8l9 5 9-5zM3 13l9 5 9-5',
    adminOnly: true,
  },
]

/** Page title for the topbar. */
export function viewTitle(view: View): string {
  return NAV_ITEMS.find((i) => i.id === view)?.label ?? ''
}
