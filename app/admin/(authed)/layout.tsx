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
      <header className="sticky top-0 z-20 flex items-center gap-4 border-b border-rule bg-bg/95 py-3 backdrop-blur">
        <Link href="/admin" className="text-base">Items</Link>
        <Link href="/admin/collections" className="text-base text-dim">Collections</Link>
        <Link href="/" className="ml-auto text-sm text-dim">Site ↗</Link>
        <form action={signOut}><button className="text-sm text-dim">Out</button></form>
      </header>
      {children}
    </div>
  )
}
