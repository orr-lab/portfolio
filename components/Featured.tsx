import Link from 'next/link'
import { Cover, EmbedPlayer, leadMedia } from '@/components/Media'
import type { Item } from '@/lib/types'
import { detailHref } from '@/lib/types'

/**
 * The one item with featured=true, directly under the hero. Not a card — no
 * border, no padding, nothing that makes it look like one of many.
 */
export default function Featured({ item }: { item: Item }) {
  const lead = leadMedia(item.media)
  const href = detailHref(item)

  return (
    <section className="pb-16 sm:pb-24">
      {lead?.kind === 'embed' && <EmbedPlayer media={lead} />}
      {lead?.kind === 'image' && (
        <div className="relative w-full overflow-hidden" style={{ aspectRatio: '16 / 9' }}>
          {/* priority: this is the largest image above the fold, so Next loads
              it immediately instead of waiting for it to scroll into view. */}
          <Cover media={lead} sizes="(max-width: 1024px) 100vw, 1024px" priority />
        </div>
      )}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-baseline sm:justify-between">
        <div>
          <h2 className="display text-3xl sm:text-4xl">{item.title}</h2>
          {item.subtitle && <p className="display mt-1 text-lg text-dim">{item.subtitle}</p>}
        </div>
        {(item.dateLabel ?? item.year) && (
          <p className="shrink-0 text-sm text-dim tabular-nums">
            {item.dateLabel ?? item.year}
          </p>
        )}
      </div>
      {item.blurb && <p className="mt-4 max-w-prose text-dim">{item.blurb}</p>}
      {href && (
        <Link href={href} className="mt-4 inline-block text-sm text-accent underline-offset-4 hover:underline">
          More about this film →
        </Link>
      )}
    </section>
  )
}
