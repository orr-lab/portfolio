import Link from 'next/link'
import { redirect } from 'next/navigation'
import { checkPassword, isAuthed, startSession } from '@/lib/session'

export const metadata = { title: 'Admin', robots: { index: false, follow: false } }

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ bad?: string }>
}) {
  if (await isAuthed()) redirect('/admin')
  const { bad } = await searchParams

  // A server action: this function is defined here but only ever runs on the
  // server. The form posts straight to it, so the password is never handled by
  // browser JavaScript and the page works with JavaScript switched off.
  async function signIn(formData: FormData) {
    'use server'
    const password = String(formData.get('password') ?? '')
    if (!checkPassword(password)) redirect('/admin/login?bad=1')
    await startSession()
    redirect('/admin')
  }

  return (
    <main className="mx-auto max-w-sm px-5 py-16">
      <h1 className="text-xl">Admin</h1>
      <form action={signIn} className="mt-6">
        <label htmlFor="password" className="block text-sm text-dim">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          autoFocus
          required
          className="mt-2 w-full border border-rule bg-transparent px-4 py-3 text-base"
        />
        {bad && <p className="mt-3 text-sm text-accent">Wrong password.</p>}
        <button type="submit" className="mt-4 min-h-12 w-full border border-accent px-4 text-base text-accent">
          Sign in
        </button>
      </form>

      <Link
        href="/"
        className="mt-4 flex min-h-12 w-full items-center justify-center border border-rule px-4 text-base text-dim hover:border-accent hover:text-accent"
      >
        ← Back to the site
      </Link>
    </main>
  )
}
