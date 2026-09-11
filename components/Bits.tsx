import Link from 'next/link'
import type { Collection, Item } from '@/lib/types'
import { dateText, detailHref } from '@/lib/types'

/** Title, linked to its detail page only when the item has a body. */
export function ItemTitle({ item, className = '' }: { item: Item; className?: string }) {
  const href = detailHref(item)
  // Link does client-side navigation between pages instead of a full reload.
  return href
    ? <Link href={href} className={`${className} hover:text-accent`}>{item.title}</Link>
    : <span className={className}>{item.title}</span>
}

/** Hebrew title, "arr. for piano" — whatever sits just under the title. */
export function Subtitle({ item }: { item: Item }) {
  if (!item.subtitle) return null
  return <span className="text-dim">{item.subtitle}</span>
}

/** date_label if present, else year, and nothing at all when show_year is off. */
export function DateText({ item, collection }: { item: Item; collection: Collection }) {
  const text = dateText(item, collection)
  if (!text) return null
  return <span className="tabular-nums text-dim">{text}</span>
}

export function Tags({ item, collection }: { item: Item; collection: Collection }) {
  if (!collection.showTags || item.tags.length === 0) return null
  return (
    <ul className="mt-3 flex flex-wrap gap-x-3 gap-y-1">
      {item.tags.map((t) => (
        <li key={t} className="text-xs tracking-wide text-dim uppercase">{t}</li>
      ))}
    </ul>
  )
}

/** Falls back to the host when a link has no caption, so it is never bare. */
function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

/**
 * Every outbound link an item has: its own url first, then any 'link' media
 * rows. That is what lets a project point at both the live site and its
 * source without the schema growing a column per kind of link.
 */
export function Links({ item, className = '' }: { item: Item; className?: string }) {
  const extra = item.media.filter((m) => m.kind === 'link')
  if (!item.url && extra.length === 0) return null
  return (
    <div className={`flex flex-wrap gap-x-4 gap-y-1 ${className}`}>
      {item.url && (
        <a
          href={item.url}
          target="_blank"
          rel="noreferrer"
          className="text-sm text-accent underline-offset-4 hover:underline"
        >
          {item.urlLabel ?? hostOf(item.url)} ↗
        </a>
      )}
      {extra.map((m) => (
        <a
          key={m.id}
          href={m.url}
          target="_blank"
          rel="noreferrer"
          className="text-sm text-dim underline underline-offset-4 hover:text-accent"
        >
          {m.caption ?? hostOf(m.url)} ↗
        </a>
      ))}
    </div>
  )
}

export function Blurb({ item, collection, className = '' }: {
  item: Item; collection: Collection; className?: string
}) {
  if (!collection.showBlurb || !item.blurb) return null
  return <p className={`text-pretty ${className}`}>{item.blurb}</p>
}
