import Lightbox, { type Shot } from '@/components/Lightbox'
import type { LayoutProps } from '@/lib/types'
import { detailHref } from '@/lib/types'

/**
 * An image grid with no titles and no cards. Every image from every item is
 * flattened into one wall, so a single "Daily drawings" item holding a hundred
 * images renders exactly the same as a hundred separate items would.
 */
export default function Gallery({ items, collection }: LayoutProps) {
  if (collection.mediaMode === 'none') return null

  const shots: Shot[] = items.flatMap((item) =>
    item.media
      .filter((m) => m.kind === 'image')
      .map((m) => ({ id: m.id, url: m.url, caption: m.caption, href: detailHref(item) })),
  )

  if (shots.length === 0) return null
  return <Lightbox shots={shots} columns={collection.columns} />
}
