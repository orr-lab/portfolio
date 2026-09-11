import type { Media } from './types'

/**
 * Numbers a set of images by date, oldest first. The number is derived rather
 * than stored: it is a position in a sequence, so storing it would mean
 * renumbering every row on each insert and leave room for two rows to claim
 * the same day. Derived, it cannot disagree with the dates.
 *
 * Images with no date get no number instead of a guessed one.
 */
export function numberByDate(media: Media[]): Map<string, number> {
  const dated = media
    .filter((m) => m.takenOn)
    .sort((a, b) => (a.takenOn! < b.takenOn! ? -1 : a.takenOn! > b.takenOn! ? 1 : 0))
  return new Map(dated.map((m, i) => [m.id, i + 1]))
}

/** "11 Jun 2026". Parsed from the Y-M-D parts so no timezone can shift it. */
export function formatDay(iso: string | null): string | null {
  if (!iso) return null
  const [y, m, d] = iso.split('-').map(Number)
  if (!y || !m || !d) return null
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC',
  })
}

/** The line under a drawing: its number, its date, or both. */
export function captionFor(
  media: Media, numbers: Map<string, number>,
): string | null {
  const n = numbers.get(media.id)
  const day = formatDay(media.takenOn)
  const parts = [n ? `#${n}` : null, day].filter(Boolean)
  const own = media.caption?.trim()
  if (own) parts.push(own)
  return parts.length ? parts.join(' · ') : null
}
