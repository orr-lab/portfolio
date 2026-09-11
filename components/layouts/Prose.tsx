import { DateText, ItemTitle } from '@/components/Bits'
import { excerpt } from '@/lib/markdown'
import type { LayoutProps } from '@/lib/types'

/**
 * Title, date, and the opening of the body. No image slot and no card border —
 * writing is not a product tile. For writing.
 */
export default function Prose({ items, collection }: LayoutProps) {
  const pad = collection.density === 'compact' ? 'py-6' : 'py-9'
  return (
    <div className="divide-y divide-rule">
      {items.map((item) => {
        // Falls back to the blurb when there is no body, so an item with only a
        // blurb still reads as a paragraph rather than an empty row.
        const opening = excerpt(item.body) || item.blurb || ''
        return (
          <article key={item.id} className={pad}>
            <h3 className="text-lg"><ItemTitle item={item} /></h3>
            <div className="mt-1 text-sm">
              <DateText item={item} collection={collection} />
            </div>
            {opening && <p className="mt-3 max-w-prose text-dim">{opening}</p>}
          </article>
        )
      })}
    </div>
  )
}
