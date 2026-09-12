import Lightbox, { type Shot } from '@/components/Lightbox'
import type { LayoutProps } from '@/lib/types'
import { detailHref } from '@/lib/types'
import { captionFor, numberByDate } from '@/lib/sequence'

/**
 * An image grid with no titles and no cards. Every image from every item is
 * flattened into one wall, so a single "Daily drawings" item holding a hundred
 * images renders exactly the same as a hundred separate items would.
 */
export default function Gallery({ items, collection }: LayoutProps) {
  if (collection.mediaMode === 'none') return null

  const images = items.flatMap((item) =>
    item.media.filter((m) => m.kind === 'image').map((m) => ({ item, media: m })),
  )
  // Numbered across the whole wall, not per item, so one "Daily drawings" item
  // holding a hundred images numbers them 1 to 100.
  const numbers = numberByDate(images.map((x) => x.media))

  const shots: Shot[] = images.map(({ item, media: m }) => ({
    id: m.id,
    url: m.url,
    caption: captionFor(m, numbers),
    linkUrl: m.linkUrl,
    width: m.width,
    height: m.height,
    href: detailHref(item),
  }))

  if (shots.length === 0) return null
  return <Lightbox shots={shots} columns={collection.columns} />
}
