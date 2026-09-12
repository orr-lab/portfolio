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

/** "June 2026", from a Y-M-D string, with no timezone able to shift it. */
export function formatMonth(iso: string): string {
  const [y, m] = iso.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString('en-GB', {
    month: 'long', year: 'numeric', timeZone: 'UTC',
  })
}

export type Group<T> = { key: string; label: string | null; items: T[] }

/**
 * Splits a gallery into months, but only once it is worth it.
 *
 * Grouping two months of drawings would add headings that carry no
 * information and break a short wall into stubs. It earns its place once there
 * are enough images to scroll past and enough months for the headings to be
 * telling you something — so below either threshold the wall stays whole.
 *
 * Undated images gather in a trailing unlabelled group rather than being
 * dropped or given a month they might not belong to.
 */
export function groupByMonth<T extends { takenOn: string | null }>(
  media: T[], minImages = 15, minMonths = 2,
): Group<T>[] {
  const months = new Set(media.filter((m) => m.takenOn).map((m) => m.takenOn!.slice(0, 7)))
  if (media.length <= minImages || months.size <= minMonths) {
    return [{ key: 'all', label: null, items: media }]
  }

  const byMonth = new Map<string, T[]>()
  const undated: T[] = []
  for (const m of media) {
    if (!m.takenOn) { undated.push(m); continue }
    const key = m.takenOn.slice(0, 7)
    const bucket = byMonth.get(key)
    if (bucket) bucket.push(m)
    else byMonth.set(key, [m])
  }

  // Newest month first, matching how the images themselves are ordered.
  const groups: Group<T>[] = [...byMonth.entries()]
    .sort((a, b) => (a[0] < b[0] ? 1 : -1))
    .map(([key, items]) => ({ key, label: formatMonth(`${key}-01`), items }))

  if (undated.length) groups.push({ key: 'undated', label: 'Undated', items: undated })
  return groups
}
