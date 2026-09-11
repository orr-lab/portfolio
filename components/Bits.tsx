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

export function ExternalLink({ item }: { item: Item }) {
  if (!item.url) return null
  return (
    <a
      href={item.url}
      className="text-sm text-accent underline-offset-4 hover:underline"
      target="_blank"
      rel="noreferrer"
    >
      {item.urlLabel ?? item.url.replace(/^https?:\/\//, '')} ↗
    </a>
  )
}

export function Blurb({ item, collection, className = '' }: {
  item: Item; collection: Collection; className?: string
}) {
  if (!collection.showBlurb || !item.blurb) return null
  return <p className={`text-pretty ${className}`}>{item.blurb}</p>
}
