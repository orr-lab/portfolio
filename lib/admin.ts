// Reads that /admin needs and the public site must never use, because these
// include drafts. Keeping them in their own file makes that hard to confuse.
import { sql } from './db'
import type { Collection, Item } from './types'

export type AdminItem = Item & { collectionSlug: string; collectionTitle: string }

const MEDIA_JSON = `
  left join lateral (
    select json_agg(json_build_object(
      'id', x.id, 'kind', x.kind, 'url', x.url, 'caption', x.caption,
        'width', x.width, 'height', x.height,
        'takenOn', to_char(x.taken_on, 'YYYY-MM-DD'), 'linkUrl', x.link_url,
        'durationSeconds', x.duration_seconds
    ) order by x.sort_order) as media
    from media x where x.item_id = i.id
  ) m on true`

/* eslint-disable @typescript-eslint/no-explicit-any */
function toAdminItem(r: any): AdminItem {
  return {
    id: r.id, collectionId: r.collection_id, slug: r.slug, title: r.title,
    subtitle: r.subtitle, blurb: r.blurb, body: r.body, tags: r.tags ?? [],
    year: r.year, dateLabel: r.date_label, url: r.url, urlLabel: r.url_label,
    featured: r.featured, status: r.status, sortOrder: r.sort_order,
    media: (r.media ?? []).map((x: any) => ({
      id: x.id, kind: x.kind, url: x.url, caption: x.caption,
      width: x.width, height: x.height, takenOn: x.takenOn ?? null,
      linkUrl: x.linkUrl ?? null, durationSeconds: x.durationSeconds ?? null,
    })),
    collectionSlug: r.collection_slug, collectionTitle: r.collection_title,
  }
}

/** Every item, drafts included, optionally filtered by title or subtitle. */
export async function listAdminItems(q?: string): Promise<AdminItem[]> {
  const like = q && q.trim() ? `%${q.trim()}%` : null
  const rows = await sql.query(
    `select i.*, c.slug as collection_slug, c.title as collection_title,
            coalesce(m.media, '[]'::json) as media
     from items i
     join collections c on c.id = i.collection_id
     ${MEDIA_JSON}
     where $1::text is null or i.title ilike $1 or coalesce(i.subtitle, '') ilike $1
     order by c.sort_order, i.sort_order, i.title`,
    [like],
  )
  return (rows as any[]).map(toAdminItem)
}

export async function getAdminItem(id: string): Promise<AdminItem | null> {
  const rows = await sql.query(
    `select i.*, c.slug as collection_slug, c.title as collection_title,
            coalesce(m.media, '[]'::json) as media
     from items i
     join collections c on c.id = i.collection_id
     ${MEDIA_JSON}
     where i.id = $1`,
    [id],
  )
  const list = rows as any[]
  return list.length ? toAdminItem(list[0]) : null
}

/** True when some other item already owns this slug. */
export async function slugTaken(slug: string, exceptId?: string): Promise<boolean> {
  const rows = await sql.query(
    `select 1 from items where slug = $1 and ($2::uuid is null or id <> $2) limit 1`,
    [slug, exceptId ?? null],
  )
  return (rows as any[]).length > 0
}

export async function collectionSlugTaken(slug: string, exceptId?: string): Promise<boolean> {
  const rows = await sql.query(
    `select 1 from collections where slug = $1 and ($2::uuid is null or id <> $2) limit 1`,
    [slug, exceptId ?? null],
  )
  return (rows as any[]).length > 0
}

export async function listAdminCollections(): Promise<Collection[]> {
  const { listCollections } = await import('./queries')
  return listCollections(true)
}
