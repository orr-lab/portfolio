import { DateText, ItemTitle } from '@/components/Bits'
import type { LayoutProps } from '@/lib/types'

/**
 * One line per item: title left, date right. No blurb, no media, no card.
 * For credits, screenings, schooling — things that are a fact, not a piece.
 */
export default function Index({ items, collection }: LayoutProps) {
  const pad = collection.density === 'compact' ? 'py-2' : 'py-3'
  return (
    <ul className="divide-y divide-rule">
      {items.map((item) => (
        <li key={item.id} className={`flex items-baseline justify-between gap-6 ${pad}`}>
          <span className="min-w-0"><ItemTitle item={item} /></span>
          {/* Collapses to nothing when show_year is off, leaving no gap. */}
          <span className="shrink-0 text-sm">
            <DateText item={item} collection={collection} />
          </span>
        </li>
      ))}
    </ul>
  )
}
