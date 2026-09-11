import { Blurb, ItemTitle, Subtitle } from '@/components/Bits'
import type { Item, LayoutProps } from '@/lib/types'

/**
 * A vertical rail with items grouped under a sticky year. For work where the
 * chronology is the story.
 *
 * Items with no year gather in a trailing "Undated" group rather than being
 * dropped or guessed at. With show_year off the markers disappear and the rail
 * runs continuously, so the flag still composes.
 */
export default function Timeline({ items, collection }: LayoutProps) {
  const groups = groupByYear(items)

  return (
    <div className="relative">
      {/* The rail itself: one hairline the whole column hangs off. */}
      <div className="absolute top-0 bottom-0 left-0 w-px bg-rule sm:left-24" aria-hidden />

      {groups.map((group) => (
        <section key={group.key} className="relative">
          {collection.showYear && (
            <h3
              className="sticky top-16 z-10 -mb-2 bg-bg py-2 text-sm tabular-nums text-dim sm:absolute sm:top-2 sm:left-0 sm:w-20 sm:text-right"
            >
              {group.label}
            </h3>
          )}
          <ul className="pl-5 sm:pl-32">
            {group.items.map((item) => (
              <li key={item.id} className="relative py-5">
                {/* The node on the rail, pulled back onto the hairline. */}
                <span
                  className="absolute top-7 -left-5 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-accent sm:-left-32 sm:translate-x-[-0.5px]"
                  aria-hidden
                />
                <div className="flex flex-wrap items-baseline gap-x-3">
                  <span className="text-base"><ItemTitle item={item} /></span>
                  <span className="text-sm"><Subtitle item={item} /></span>
                </div>
                {/* Only when it says more than the group marker already does. */}
                {item.dateLabel && item.dateLabel !== group.label && (
                  <div className="mt-1 text-sm text-dim tabular-nums">{item.dateLabel}</div>
                )}
                <Blurb item={item} collection={collection} className="mt-2 max-w-prose text-sm text-dim" />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}

type Group = { key: string; label: string; items: Item[] }

function groupByYear(items: Item[]): Group[] {
  const dated = new Map<number, Item[]>()
  const undated: Item[] = []

  for (const item of items) {
    if (item.year === null) undated.push(item)
    else {
      const bucket = dated.get(item.year)
      if (bucket) bucket.push(item)
      else dated.set(item.year, [item])
    }
  }

  // Newest first. The caller's sort_mode already ordered items inside a year.
  const groups: Group[] = [...dated.entries()]
    .sort((a, b) => b[0] - a[0])
    .map(([year, group]) => ({ key: String(year), label: String(year), items: group }))

  if (undated.length) groups.push({ key: 'undated', label: 'Undated', items: undated })
  return groups
}
