import { FileLink } from '@/components/Media'
import AudioPlayer from '@/components/AudioPlayer'
import InlineEmbed from '@/components/InlineEmbed'
import { Blurb, DateText, ItemTitle, Links, Subtitle } from '@/components/Bits'
import type { LayoutProps } from '@/lib/types'
import { detailHref } from '@/lib/types'

/**
 * Above this many players on one page, embeds collapse to click-to-play.
 * Below it they are simply shown, because a handful of iframes costs little
 * and a tap-to-reveal on a three-item list is friction for nothing.
 */
const EAGER_EMBED_LIMIT = 8

/** Compact rows. For compositions. Must stay comfortable at forty items. */
export default function List({ items, collection }: LayoutProps) {
  const pad = collection.density === 'compact' ? 'py-3' : 'py-5'
  const showMedia = collection.mediaMode !== 'none'

  // Counted across the whole list, not per row: ten items holding one embed
  // each is the same weight on the page as one item holding ten.
  const totalEmbeds = showMedia
    ? items.reduce((n, i) => n + i.media.filter((m) => m.kind === 'embed').length, 0)
    : 0
  const eager = totalEmbeds <= EAGER_EMBED_LIMIT

  return (
    // divide-y puts a rule between rows and none after the last, which is what
    // stops the final row's border stacking with the next section's own rule
    // and reading as an empty row.
    <ul className="divide-y divide-rule">
      {items.map((item) => {
        const audio = showMedia ? item.media.filter((m) => m.kind === 'audio') : []
        const files = showMedia ? item.media.filter((m) => m.kind === 'file') : []
        // When an item has its own audio, that is how you hear it, and a video
        // player beside it is just a second copy of the same piece. The embed
        // steps back to a link. Without audio it stays a player.
        const audioWins = audio.length > 0
        const embeds = showMedia ? item.media.filter((m) => m.kind === 'embed') : []

        return (
          // The id is what lets the now-playing bar scroll back to this exact
          // row when the piece has no page of its own.
          <li key={item.id} id={`item-${item.slug}`} className={`section-anchor ${pad}`}>
            <div className="flex items-baseline justify-between gap-4">
              <div className="min-w-0">
                <span className="text-base"><ItemTitle item={item} /></span>
                {item.subtitle && <span className="ml-3 text-sm"><Subtitle item={item} /></span>}
              </div>
              {/* show_year false right-aligns nothing rather than leaving a gap:
                  DateText returns null, so this span collapses to zero width. */}
              <span className="shrink-0 text-sm">
                <DateText item={item} collection={collection} />
              </span>
            </div>

            <Blurb item={item} collection={collection} className="mt-1 text-sm text-dim" />

            {audio.map((m) => (
              <AudioPlayer
                key={m.id}
                media={m}
                title={item.title}
                // Its own page if it has one; otherwise back to this row.
                href={detailHref(item) ?? `/${collection.slug}#item-${item.slug}`}
              />
            ))}

            {!audioWins && embeds.map((m) => (
              <InlineEmbed key={m.id} url={m.url} label={m.caption ?? 'Listen'} eager={eager} />
            ))}

            {(files.length > 0 || (audioWins && embeds.length > 0)) && (
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                {audioWins && embeds.map((m) => (
                  <a key={m.id} href={m.url} target="_blank" rel="noreferrer"
                     className="text-sm text-dim underline underline-offset-4 hover:text-accent">
                    {m.caption ?? 'Watch'} ↗
                  </a>
                ))}
                {files.map((m) => <FileLink key={m.id} media={m} />)}
              </div>
            )}

            <Links item={item} className="mt-2" />
          </li>
        )
      })}
    </ul>
  )
}
