import { Cover } from '@/components/Media'
import { Blurb, DateText, ExternalLink, ItemTitle, Subtitle, Tags } from '@/components/Bits'
import type { LayoutProps } from '@/lib/types'
import { cover } from '@/lib/types'

// Tailwind scans source for whole class names, so these cannot be built from a
// variable at runtime — they have to be written out.
const COLUMNS = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
} as const

/** Cards with a cover on top. For code. */
export default function Grid({ items, collection }: LayoutProps) {
  const gap = collection.density === 'compact' ? 'gap-5' : 'gap-8'
  return (
    <div className={`grid ${COLUMNS[collection.columns]} ${gap}`}>
      {items.map((item) => {
        const image = cover(item, collection)
        return (
          <article key={item.id} className="flex flex-col border border-rule p-5">
            {/* media_mode 'none' renders a text card. It must not leave an
                empty image box where the cover would have been. */}
            {image && (
              <div className="relative mb-4 w-full overflow-hidden" style={{ aspectRatio: '3 / 2' }}>
                <Cover media={image} sizes="(max-width: 640px) 100vw, 400px" />
              </div>
            )}
            <h3 className="text-lg"><ItemTitle item={item} /></h3>
            <div className="mt-1 flex flex-wrap items-baseline gap-x-3 text-sm">
              <Subtitle item={item} />
              <DateText item={item} collection={collection} />
            </div>
            <Blurb item={item} collection={collection} className="mt-2 text-sm text-dim" />
            <Tags item={item} collection={collection} />
            <div className="mt-auto pt-4"><ExternalLink item={item} /></div>
          </article>
        )
      })}
    </div>
  )
}
