import { createContext } from 'react'

/** The resolved, applied theme. */
export type Theme = 'light' | 'dark'

/** The user's preference: an explicit theme, or follow the OS. */
export type ThemeMode = 'system' | 'light' | 'dark'

export interface ThemeContextValue {
  /** The effective theme currently applied to the document. */
  theme: Theme
  /** The user's stored preference. */
  mode: ThemeMode
  setMode: (mode: ThemeMode) => void
  /** Flip the resolved theme (light↔dark) as an explicit override. */
  toggle: () => void
}

export const ThemeContext = createContext<ThemeContextValue | null>(null)

export const THEME_STORAGE_KEY = 'office-request:theme-mode'
