'use client'

import { useEffect, useState } from 'react'
import { MoonIcon, SunIcon } from './Icons'

type Choice = 'light' | 'dark' | 'system'

/**
 * The site follows the operating system until someone says otherwise. Once they
 * do, the choice is written to `data-theme` on <html> and remembered, and the
 * CSS in globals.css treats "no attribute" as "follow the system".
 */
export default function ThemeToggle() {
  // Starts as null so the first render matches what the server sent; the real
  // value is read after mounting, which is the only place localStorage exists.
  const [choice, setChoice] = useState<Choice | null>(null)

  useEffect(() => {
    const stored = document.documentElement.dataset.theme as Choice | undefined
    setChoice(stored === 'light' || stored === 'dark' ? stored : 'system')
  }, [])

  function apply(next: Choice) {
    setChoice(next)
    const root = document.documentElement
    try {
      if (next === 'system') {
        delete root.dataset.theme
        localStorage.removeItem('theme')
      } else {
        root.dataset.theme = next
        localStorage.setItem('theme', next)
      }
    } catch {
      // Private browsing can refuse storage; the theme still changes for now.
    }
  }

  // Whether the page is currently dark, whatever the reason.
  const dark = choice === 'dark'
    || (choice === 'system'
      && typeof window !== 'undefined'
      && window.matchMedia('(prefers-color-scheme: dark)').matches)

  if (choice === null) {
    // Reserve the space so the footer does not shift when this resolves.
    return <span className="inline-flex h-11 w-24" aria-hidden />
  }

  return (
    <button
      type="button"
      onClick={() => apply(dark ? 'light' : 'dark')}
      className="inline-flex h-11 items-center gap-2 text-sm text-dim hover:text-accent"
      aria-label={`Switch to the ${dark ? 'light' : 'dark'} theme`}
    >
      {dark ? <SunIcon /> : <MoonIcon />}
      {dark ? 'Light' : 'Dark'}
    </button>
  )
}
