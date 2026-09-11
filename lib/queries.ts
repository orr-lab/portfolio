// Every read the public site performs. One file, so the rules about drafts and
// visibility are enforced in one place and cannot drift between pages.
import { sql } from './db'
import type { Collection, Item, Layout } from './types'

/** How many items each layout shows on the hub before the "All N →" link. */
export const HUB_LIMITS: Record<Layout, number> = {
  feature: 3, grid: 4, list: 6, gallery: 8, prose: 4, timeline: 5, index: 8,
}

function toCollection(r: any): Collection {
  return {
    id: r.id, slug: r.slug, title: r.title, blurb: r.blurb,
    layout: r.layout, columns: r.columns,
    showYear: r.show_year, showTags: r.show_tags, showBlurb: r.show_blurb,
    mediaMode: r.media_mode, sortMode: r.sort_mode, density: r.density,
    itemNounPlural: r.item_noun_plural, sortOrder: r.sort_order, visible: r.visible,
  }
}

function toItem(r: any): Item {
  return {
    id: r.id, collectionId: r.collection_id, slug: r.slug, title: r.title,
    subtitle: r.subtitle,
    blurb: r.blurb, body: r.body, tags: r.tags ?? [], year: r.year,
    dateLabel: r.date_label, url: r.url, urlLabel: r.url_label,
    featured: r.featured,
    status: r.status,
    sortOrder: r.sort_order,
    media: (r.media ?? []).map((m: any) => ({
      id: m.id, kind: m.kind, url: m.url, caption: m.caption,
    })),
  }
}

/** Collections in hub order. Hidden ones are for /admin only. */
export async function listCollections(includeHidden = false): Promise<Collection[]> {
  const rows = includeHidden
    ? await sql`select * from collections order by sort_order, title`
    : await sql`select * from collections where visible order by sort_order, title`
  return rows.map(toCollection)
}

export async function getCollection(slug: string): Promise<Collection | null> {
  const rows = await sql`select * from collections where slug = ${slug}`
  return rows.length ? toCollection(rows[0]) : null
}

/**
 * Published items with their media attached, media ordered by sort_order so
 * media[0] is the cover. Pass a collection id to scope it, or omit for the hub.
 */
export async function listPublishedItems(collectionId?: string): Promise<Item[]> {
  const rows = collectionId
    ? await sql`
        select i.*, coalesce(m.media, '[]'::json) as media
        from items i
        left join lateral (
          select json_agg(json_build_object(
            'id', x.id, 'kind', x.kind, 'url', x.url, 'caption', x.caption
          ) order by x.sort_order) as media
          from media x where x.item_id = i.id
        ) m on true
        where i.status = 'published' and i.collection_id = ${collectionId}
        order by i.sort_order, i.title`
    : await sql`
        select i.*, coalesce(m.media, '[]'::json) as media
        from items i
        left join lateral (
          select json_agg(json_build_object(
            'id', x.id, 'kind', x.kind, 'url', x.url, 'caption', x.caption
          ) order by x.sort_order) as media
          from media x where x.item_id = i.id
        ) m on true
        where i.status = 'published'
        order by i.sort_order, i.title`
  return rows.map(toItem)
}

export async function getFeaturedItem(): Promise<Item | null> {
  const rows = await sql`
    select i.*, coalesce(m.media, '[]'::json) as media
    from items i
    left join lateral (
      select json_agg(json_build_object(
        'id', x.id, 'kind', x.kind, 'url', x.url, 'caption', x.caption
      ) order by x.sort_order) as media
      from media x where x.item_id = i.id
    ) m on true
    where i.featured and i.status = 'published'
    limit 1`
  return rows.length ? toItem(rows[0]) : null
}

/** Applies the collection's sort_mode. Nulls always sort last, never first. */
export function sortItems(items: Item[], mode: Collection['sortMode']): Item[] {
  const out = [...items]
  const byYear = (dir: 1 | -1) => (a: Item, b: Item) => {
    // Array.sort is stable, so 0 keeps the order SQL already applied.
    if (a.year === null && b.year === null) return 0
    if (a.year === null) return 1
    if (b.year === null) return -1
    return (a.year - b.year) * dir
  }
  switch (mode) {
    case 'year_desc': return out.sort(byYear(-1))
    case 'year_asc': return out.sort(byYear(1))
    case 'alpha': return out.sort((a, b) => a.title.localeCompare(b.title))
    default: return out // 'manual' — already ordered by sort_order from SQL
  }
}

/**
 * A collection is empty for hub purposes when it has nothing to show. A gallery
 * with published items but no images is empty too: it would render a blank grid.
 */
export function hasRenderableContent(collection: Collection, items: Item[]): boolean {
  if (items.length === 0) return false
  if (collection.layout === 'gallery') {
    return items.some((i) => i.media.some((m) => m.kind === 'image'))
  }
  return true
}

/**
 * One item by slug, with its collection. Returns null for drafts and for items
 * with no body — body IS NULL means there is no detail page to serve.
 */
export async function getItemBySlug(
  slug: string,
): Promise<{ item: Item; collection: Collection } | null> {
  const rows = await sql`
    select i.*, coalesce(m.media, '[]'::json) as media
    from items i
    left join lateral (
      select json_agg(json_build_object(
        'id', x.id, 'kind', x.kind, 'url', x.url, 'caption', x.caption
      ) order by x.sort_order) as media
      from media x where x.item_id = i.id
    ) m on true
    where i.slug = ${slug} and i.status = 'published' and i.body is not null
    limit 1`
  if (!rows.length) return null

  const item = toItem(rows[0])
  const collections = await sql`select * from collections where id = ${item.collectionId}`
  if (!collections.length) return null
  return { item, collection: toCollection(collections[0]) }
}

/** Every item that has a detail page. Used to prerender /work/[slug]. */
export async function listItemsWithBody(): Promise<{ slug: string }[]> {
  const rows = await sql`
    select slug from items where status = 'published' and body is not null`
  return rows.map((r) => ({ slug: r.slug as string }))
}

/**
 * Collections the navigation should offer: visible, and actually holding
 * something to look at. This is the SQL statement of the same rule
 * hasRenderableContent() applies in memory — a gallery whose published items
 * carry no images is empty, because it would render a blank wall.
 *
 * Without this the bar offers a link to a section that was never rendered.
 */
export async function listNavCollections(): Promise<Collection[]> {
  const rows = await sql`
    select c.* from collections c
    where c.visible
      and exists (
        select 1 from items i
        where i.collection_id = c.id
          and i.status = 'published'
          and (
            c.layout <> 'gallery'
            or exists (select 1 from media m where m.item_id = i.id and m.kind = 'image')
          )
      )
    order by c.sort_order, c.title`
  return rows.map(toCollection)
}
