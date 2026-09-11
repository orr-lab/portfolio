import Link from 'next/link'
import { redirect } from 'next/navigation'
import { endSession, isAuthed } from '@/lib/session'

// Everything in this folder is behind the password. /admin/login sits outside
// it, which is what stops the guard from redirecting to itself forever.
export const metadata = { title: 'Admin', robots: { index: false, follow: false } }

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!(await isAuthed())) redirect('/admin/login')

  async function signOut() {
    'use server'
    await endSession()
    redirect('/admin/login')
  }

  return (
    <div className="mx-auto max-w-2xl px-4 pb-28">
      <header className="sticky top-0 z-20 flex items-center gap-5 border-b border-rule bg-bg/95 py-3 backdrop-blur">
        <Link href="/admin" className="text-base">Items</Link>
        <Link href="/admin/collections" className="text-base text-dim">Collections</Link>
        <Link href="/" className="ml-auto text-sm text-dim">Site ↗</Link>
      </header>
      {children}
      {/* Sign out lives down here, not in the sticky header: up there it sits a
          thumb's width from the nav links, and a mis-tap while editing would
          throw away everything typed. */}
      <form action={signOut} className="mt-16 border-t border-rule pt-5">
        <button className="min-h-11 text-sm text-dim hover:text-accent">Sign out</button>
      </form>
    </div>
  )
}
