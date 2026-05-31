import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  ThemeContext,
  THEME_STORAGE_KEY,
  type Theme,
  type ThemeMode,
} from './themeContext'

const DARK_QUERY = '(prefers-color-scheme: dark)'

/** Read the stored preference, guarded — the Power host iframe may block storage. */
function readStoredMode(): ThemeMode {
  try {
    const v = localStorage.getItem(THEME_STORAGE_KEY)
    if (v === 'light' || v === 'dark' || v === 'system') return v
  } catch {
    /* storage unavailable — fall through to system */
  }
  return 'system'
}

function systemTheme(): Theme {
  return typeof matchMedia !== 'undefined' && matchMedia(DARK_QUERY).matches
    ? 'dark'
    : 'light'
}

/**
 * Owns the light/dark theme. Initial mode comes from localStorage (guarded),
 * else 'system'. The effective theme is *derived* during render from mode +
 * the live OS preference (only the media-listener callback sets state, never the
 * effect body). It's written to <html data-theme> so the whole document —
 * including ::backdrop and native controls (via color-scheme in tokens.css) —
 * themes. Mounted outermost in main.tsx so even boot states are themed.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>(readStoredMode)
  const [systemPref, setSystemPref] = useState<Theme>(systemTheme)

  const theme: Theme = mode === 'system' ? systemPref : mode

  // Sync the resolved theme to the document (external system — the proper use
  // of an effect; not a setState-in-effect).
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  // Track OS preference changes; only matters while mode === 'system', but the
  // listener is cheap and keeping systemPref current avoids a flash on switch.
  useEffect(() => {
    if (typeof matchMedia === 'undefined') return
    const mq = matchMedia(DARK_QUERY)
    const onChange = () => setSystemPref(mq.matches ? 'dark' : 'light')
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  const setMode = useCallback((next: ThemeMode) => {
    setModeState(next)
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next)
    } catch {
      /* storage unavailable — preference holds for the session only */
    }
  }, [])

  const toggle = useCallback(() => {
    setMode(theme === 'dark' ? 'light' : 'dark')
  }, [theme, setMode])

  const value = useMemo(
    () => ({ theme, mode, setMode, toggle }),
    [theme, mode, setMode, toggle],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
