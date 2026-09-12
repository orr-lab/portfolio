// The whole of /admin's security. One password from an env var, an httpOnly
// cookie, no library. This file only ever runs on the server, so the password
// never reaches the browser bundle.
import { cookies } from 'next/headers'
import { createHmac, timingSafeEqual } from 'node:crypto'

const COOKIE = 'ok_admin'
// A domain separator for the HMAC, not a secret. Changing it invalidates
// every existing session, which is why it carries a version rather than a name.
const PAYLOAD = 'portfolio-admin-v1'

function secret(): string {
  const p = process.env.ADMIN_PASSWORD
  if (!p) throw new Error('ADMIN_PASSWORD is not set. Run: vercel env add ADMIN_PASSWORD')
  return p
}

/**
 * The cookie value. Deriving it from the password means it cannot be forged
 * without knowing the password, needs no session store, and stops working the
 * moment the password is rotated.
 */
function tokenFor(password: string): string {
  return createHmac('sha256', password).update(PAYLOAD).digest('hex')
}

function sameString(a: string, b: string): boolean {
  const ab = Buffer.from(a)
  const bb = Buffer.from(b)
  if (ab.length !== bb.length) return false
  return timingSafeEqual(ab, bb)
}

/**
 * Compares HMACs rather than the raw strings. Both are always 64 hex
 * characters, so the comparison takes the same time whatever was typed and
 * leaks nothing about the real password's length.
 */
export function checkPassword(input: string): boolean {
  try {
    return sameString(tokenFor(input), tokenFor(secret()))
  } catch {
    return false
  }
}

export async function startSession(): Promise<void> {
  const jar = await cookies()
  jar.set(COOKIE, tokenFor(secret()), {
    httpOnly: true, // unreadable from JavaScript, so a script cannot steal it
    sameSite: 'lax',
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 30,
  })
}

export async function endSession(): Promise<void> {
  const jar = await cookies()
  jar.delete(COOKIE)
}

export async function isAuthed(): Promise<boolean> {
  const jar = await cookies()
  const value = jar.get(COOKIE)?.value
  if (!value) return false
  try {
    return sameString(value, tokenFor(secret()))
  } catch {
    return false
  }
}
