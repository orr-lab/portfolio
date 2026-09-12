// Shapes that mirror the database. Postgres gives snake_case; everything above
// lib/queries.ts speaks camelCase, and the mapping happens in one place.

export type Layout =
  | 'feature' | 'grid' | 'list' | 'gallery' | 'prose' | 'timeline' | 'index'

export type MediaKind = 'image' | 'video' | 'audio' | 'file' | 'embed' | 'link'
export type MediaMode = 'cover' | 'player' | 'none'
export type SortMode = 'manual' | 'year_desc' | 'year_asc' | 'alpha'
export type Density = 'comfortable' | 'compact'

export type Media = {
  id: string
  kind: MediaKind
  url: string
  caption: string | null
  /** True pixel size, when known. Null for embeds, links and older rows. */
  width: number | null
  height: number | null
  /** ISO date the image was made, when known. Drives the numbering below. */
  takenOn: string | null
  /** Where this picture or file came from, if anywhere. */
  linkUrl: string | null
  /** Length of an audio or video file in seconds, measured at upload. */
  durationSeconds: number | null
}

export type Item = {
  id: string
  collectionId: string
  slug: string
  title: string
  subtitle: string | null
  blurb: string | null
  body: string | null
  tags: string[]
  year: number | null
  dateLabel: string | null
  url: string | null
  urlLabel: string | null
  featured: boolean
  status: 'draft' | 'published'
  sortOrder: number
  /** Ordered by sort_order. The first entry is the cover, by definition. */
  media: Media[]
}

export type Collection = {
  id: string
  slug: string
  title: string
  blurb: string | null
  layout: Layout
  columns: 1 | 2 | 3
  showYear: boolean
  showTags: boolean
  showBlurb: boolean
  mediaMode: MediaMode
  sortMode: SortMode
  density: Density
  itemNounPlural: string | null
  sortOrder: number
  visible: boolean
}

/** Every layout receives exactly this, so all seven compose with all flags. */
export type LayoutProps = {
  items: Item[]
  collection: Collection
}

/** The cover is the first media row, but only when the collection shows one. */
export function cover(item: Item, collection: Collection): Media | null {
  if (collection.mediaMode === 'none') return null
  return item.media[0] ?? null
}

/** What a layout should print for a date: the label wins, the year is fallback. */
export function dateText(item: Item, collection: Collection): string | null {
  if (!collection.showYear) return null
  return item.dateLabel ?? (item.year === null ? null : String(item.year))
}

/** body IS NULL means the item has no detail page and links nowhere internal. */
export function detailHref(item: Item): string | null {
  return item.body ? `/work/${item.slug}` : null
}
