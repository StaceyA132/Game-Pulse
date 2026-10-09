import { useEffect, useState } from 'react'

const STORAGE_KEY = 'gamepulse-theme'

// Light/dark theme. Starts from what index.html already applied (the saved
// choice, or the system setting) and remembers the user's choice.
export function useTheme() {
  const [theme, setTheme] = useState(() => document.documentElement.dataset.theme ?? 'light')

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    try {
      localStorage.setItem(STORAGE_KEY, theme)
    } catch {
      // Storage can be blocked (private mode); the theme still works for this visit.
    }
  }, [theme])

  return { theme, toggleTheme: () => setTheme((t) => (t === 'dark' ? 'light' : 'dark')) }
}
