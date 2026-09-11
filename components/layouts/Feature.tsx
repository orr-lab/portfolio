import { Cover, EmbedPlayer, leadMedia } from '@/components/Media'
import { Blurb, DateText, ItemTitle, Links, Subtitle, Tags } from '@/components/Bits'
import type { LayoutProps } from '@/lib/types'

/** One item per row, full width, large player or cover. For films. */
export default function Feature({ items, collection }: LayoutProps) {
  return (
    <div className="space-y-14 sm:space-y-20">
      {items.map((item) => {
        const lead = collection.mediaMode === 'none' ? null : leadMedia(item.media)
        return (
          <article key={item.id}>
            {lead?.kind === 'embed' && <EmbedPlayer media={lead} />}
            {lead?.kind === 'image' && (
              <div className="relative w-full overflow-hidden" style={{ aspectRatio: '16 / 9' }}>
                <Cover media={lead} sizes="(max-width: 900px) 100vw, 900px" />
              </div>
            )}
            <div className={lead ? 'mt-5' : ''}>
              <h3 className="text-2xl sm:text-3xl">
                <ItemTitle item={item} />
              </h3>
              <div className="mt-1 flex flex-wrap items-baseline gap-x-3 text-sm">
                <Subtitle item={item} />
                <DateText item={item} collection={collection} />
              </div>
              <Blurb item={item} collection={collection} className="mt-3 max-w-prose text-dim" />
              <Tags item={item} collection={collection} />
              <Links item={item} className="mt-3" />
            </div>
          </article>
        )
      })}
    </div>
  )
}
