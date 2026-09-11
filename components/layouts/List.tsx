import { AudioPlayer, FileLink } from '@/components/Media'
import InlineEmbed from '@/components/InlineEmbed'
import { Blurb, DateText, ItemTitle, Subtitle } from '@/components/Bits'
import type { LayoutProps } from '@/lib/types'

/** Compact rows. For compositions. Must stay comfortable at forty items. */
export default function List({ items, collection }: LayoutProps) {
  const pad = collection.density === 'compact' ? 'py-3' : 'py-5'
  const showMedia = collection.mediaMode !== 'none'

  return (
    // No border-t: whatever sits above (a page header or a section heading)
    // already provides the rule, and doubling them reads as an empty row.
    <ul>
      {items.map((item) => {
        const audio = showMedia ? item.media.filter((m) => m.kind === 'audio') : []
        const files = showMedia ? item.media.filter((m) => m.kind === 'file') : []
        // Tapping one of these loads its player in place; until then a list of
        // forty compositions is still just text.
        const embeds = showMedia ? item.media.filter((m) => m.kind === 'embed') : []

        return (
          <li key={item.id} className={`border-b border-rule ${pad}`}>
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

            {audio.map((m) => <AudioPlayer key={m.id} media={m} />)}

            {embeds.map((m) => (
              <InlineEmbed key={m.id} url={m.url} label={m.caption ?? 'Listen'} />
            ))}

            {files.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                {files.map((m) => <FileLink key={m.id} media={m} />)}
              </div>
            )}
          </li>
        )
      })}
    </ul>
  )
}
