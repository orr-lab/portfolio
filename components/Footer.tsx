import Link from 'next/link'
import ThemeToggle from './ThemeToggle'

/**
 * One footer for every page: the year, the theme switch, and the way in to
 * /admin. The admin link is deliberately here and deliberately plain — it is
 * password-gated and marked noindex, so the only thing hiding it would achieve
 * is making Orr type the URL every time.
 */
export default function Footer() {
  return (
    <footer className="flex flex-wrap items-center gap-x-6 gap-y-1 py-8 text-sm text-dim">
      <span className="tabular-nums">{new Date().getFullYear()}</span>
      <ThemeToggle />
      <Link href="/admin" className="inline-flex h-11 items-center hover:text-accent">
        Admin
      </Link>
    </footer>
  )
}
