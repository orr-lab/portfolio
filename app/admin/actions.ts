'use server'
// Server actions: functions the browser can invoke but which only ever execute
// on the server. Each one is reachable as its own HTTP endpoint, so the guard
// on the /admin pages does NOT protect them — every action checks the session
// itself. That check is the security boundary, not the redirect in the layout.

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { sql } from '@/lib/db'
import { isAuthed } from '@/lib/session'
import { slugify, slugProblem } from '@/lib/slug'
import { slugTaken } from '@/lib/admin'

async function requireAuth() {
  if (!(await isAuthed())) redirect('/admin/login')
}

/**
 * Clears the cache for the public site. Deliberately everything: the nav bar
 * is built from the collections table and appears on every page, and
 * publishing an item can change whether its collection is listed at all, so
 * almost any write here can alter almost any page.
 */
function revalidateSite() {
  revalidatePath('/', 'layout')
}

export type SaveState = { error: string } | null

function str(fd: FormData, key: string): string {
  return String(fd.get(key) ?? '').trim()
}
function orNull(fd: FormData, key: string): string | null {
  const v = str(fd, key)
  return v === '' ? null : v
}

export async function saveItem(_prev: SaveState, fd: FormData): Promise<SaveState> {
  await requireAuth()

  const id = str(fd, 'id')
  const isNew = id === '' || id === 'new'
  const collectionId = str(fd, 'collectionId')
  const title = str(fd, 'title')
  if (!title) return { error: 'A title is required.' }
  if (!collectionId) return { error: 'Pick a collection.' }

  // Auto-generate only from Latin script. A Hebrew title yields '' and the
  // slug has to be typed, which slugProblem() says out loud.
  const slug = str(fd, 'slug') || slugify(title)
  const problem = slugProblem(slug, 'item')
  if (problem) return { error: problem }
  if (await slugTaken(slug, isNew ? undefined : id)) {
    return { error: `The slug "${slug}" is already used by another item.` }
  }

  const yearRaw = str(fd, 'year')
  let year: number | null = null
  if (yearRaw) {
    const n = Number(yearRaw)
    if (!Number.isInteger(n) || n < 1900 || n > 2200) {
      return { error: 'Year must be a whole number between 1900 and 2200.' }
    }
    year = n
  }

  const tags = str(fd, 'tags').split(',').map((t) => t.trim()).filter(Boolean)
  const values = [
    collectionId, slug, title, orNull(fd, 'subtitle'), orNull(fd, 'blurb'),
    orNull(fd, 'body'), tags, year, orNull(fd, 'dateLabel'),
    orNull(fd, 'url'), orNull(fd, 'urlLabel'),
  ]

  let itemId = id
  if (isNew) {
    const rows = await sql.query(
      `insert into items
         (collection_id, slug, title, subtitle, blurb, body, tags, year,
          date_label, url, url_label, status, sort_order)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,'draft',
               coalesce((select max(sort_order) + 1 from items where collection_id = $1), 1))
       returning id`,
      values,
    )
    itemId = (rows as { id: string }[])[0].id
  } else {
    await sql.query(
      `update items set collection_id=$1, slug=$2, title=$3, subtitle=$4, blurb=$5,
         body=$6, tags=$7, year=$8, date_label=$9, url=$10, url_label=$11
       where id=$12`,
      [...values, id],
    )
  }

  revalidateSite()
  redirect(`/admin/items/${itemId}?saved=1`)
}

export async function deleteItem(fd: FormData) {
  await requireAuth()
  // media rows cascade with the item, by the foreign key.
  await sql.query(`delete from items where id = $1`, [str(fd, 'id')])
  revalidateSite()
  redirect('/admin')
}

export async function toggleStatus(fd: FormData) {
  await requireAuth()
  await sql.query(
    `update items
     set status = case when status = 'published' then 'draft' else 'published' end
     where id = $1`,
    [str(fd, 'id')],
  )
  revalidateSite()
}

export async function setFeatured(fd: FormData) {
  await requireAuth()
  const id = str(fd, 'id')
  const on = str(fd, 'on') === '1'

  if (!on) {
    await sql.query(`update items set featured = false where id = $1`, [id])
  } else {
    // Clear first, then set, inside one transaction. The partial unique index
    // would reject the second update if the order were reversed, which is the
    // point of having it.
    await sql.transaction([
      sql`update items set featured = false where featured`,
      sql`update items set featured = true where id = ${id}`,
    ])
  }
  revalidateSite()
}

export async function moveItem(fd: FormData) {
  await requireAuth()
  const id = str(fd, 'id')
  const dir = str(fd, 'dir') === 'up' ? -1 : 1

  const rows = (await sql.query(
    `select id from items
     where collection_id = (select collection_id from items where id = $1)
     order by sort_order, title`,
    [id],
  )) as { id: string }[]

  const order = rows.map((r) => r.id)
  const at = order.indexOf(id)
  const to = at + dir
  if (at < 0 || to < 0 || to >= order.length) return

  ;[order[at], order[to]] = [order[to], order[at]]

  // Renumber the whole collection from the swapped order. Cheap at this size
  // and it leaves no duplicate or gapped sort_order behind to bite later.
  await sql.query(
    `update items as i set sort_order = u.ord
     from (select * from unnest($1::uuid[], $2::int[]) as t(id, ord)) u
     where i.id = u.id`,
    [order, order.map((_, i) => i + 1)],
  )
  revalidateSite()
}

/* ---------- media ---------------------------------------------------------- */

/** image/video/audio by content type, anything else a downloadable file. */
function kindForType(contentType: string): 'image' | 'video' | 'audio' | 'file' {
  if (contentType.startsWith('image/')) return 'image'
  if (contentType.startsWith('video/')) return 'video'
  if (contentType.startsWith('audio/')) return 'audio'
  return 'file'
}

/**
 * Records an uploaded file. `atTop` gives it the lowest sort_order, which is
 * what an ongoing gallery wants: the newest drawing appears first and, because
 * the cover is defined as the first media row, becomes the cover for free.
 */
export async function addUploadedMedia(
  itemId: string, url: string, contentType: string, atTop: boolean,
  width?: number | null, height?: number | null, takenOn?: string | null,
) {
  await requireAuth()
  const kind = kindForType(contentType)
  const position = atTop
    ? `coalesce((select min(sort_order) - 1 from media where item_id = $1), 0)`
    : `coalesce((select max(sort_order) + 1 from media where item_id = $1), 0)`
  await sql.query(
    `insert into media (item_id, kind, url, width, height, taken_on, sort_order)
     values ($1, $2, $3, $4, $5, $6, ${position})`,
    [itemId, kind, url, width ?? null, height ?? null, takenOn ?? null],
  )
  revalidateSite()
}

/** The date shown under a drawing. Editable, because a file's timestamp is a
    good guess and not a fact — a rescanned sketch carries the scan's date. */
export async function setMediaDate(fd: FormData) {
  await requireAuth()
  await sql.query(`update media set taken_on = $2 where id = $1`,
    [str(fd, 'id'), orNull(fd, 'takenOn')])
  revalidateSite()
}

/** A pasted URL: a player if it is a YouTube/Vimeo link, otherwise a link. */
export async function addPastedUrl(fd: FormData): Promise<void> {
  await requireAuth()
  const itemId = str(fd, 'itemId')
  const url = str(fd, 'url')
  const caption = orNull(fd, 'caption')
  if (!url) return

  const { isEmbeddable } = await import('@/lib/embed')
  const kind = isEmbeddable(url) ? 'embed' : 'link'
  await sql.query(
    `insert into media (item_id, kind, url, caption, sort_order)
     values ($1, $2, $3, $4,
             coalesce((select max(sort_order) + 1 from media where item_id = $1), 0))`,
    [itemId, kind, url, caption],
  )
  revalidateSite()
}

export async function setMediaCaption(fd: FormData) {
  await requireAuth()
  await sql.query(`update media set caption = $2 where id = $1`,
    [str(fd, 'id'), orNull(fd, 'caption')])
  revalidateSite()
}

export async function deleteMedia(fd: FormData) {
  await requireAuth()
  const id = str(fd, 'id')
  const rows = (await sql.query(`select url from media where id = $1`, [id])) as { url: string }[]
  await sql.query(`delete from media where id = $1`, [id])

  // Drop the stored file too, or deleting a row would quietly leave the bytes
  // behind for ever. Only our own store, and never fatal.
  const url = rows[0]?.url
  if (url?.includes('.public.blob.vercel-storage.com')) {
    try {
      const { del } = await import('@vercel/blob')
      await del(url)
    } catch {
      // The row is already gone; a stranded blob is not worth failing over.
    }
  }
  revalidateSite()
}

export async function moveMedia(fd: FormData) {
  await requireAuth()
  const id = str(fd, 'id')
  const dir = str(fd, 'dir') === 'up' ? -1 : 1

  const rows = (await sql.query(
    `select id from media
     where item_id = (select item_id from media where id = $1)
     order by sort_order, id`,
    [id],
  )) as { id: string }[]

  const order = rows.map((r) => r.id)
  const at = order.indexOf(id)
  const to = at + dir
  if (at < 0 || to < 0 || to >= order.length) return
  ;[order[at], order[to]] = [order[to], order[at]]

  await sql.query(
    `update media as m set sort_order = u.ord
     from (select * from unnest($1::uuid[], $2::int[]) as t(id, ord)) u
     where m.id = u.id`,
    [order, order.map((_, i) => i + 1)],
  )
  revalidateSite()
}

/* ---------- collections ---------------------------------------------------- */

export async function saveCollection(_prev: SaveState, fd: FormData): Promise<SaveState> {
  await requireAuth()

  const id = str(fd, 'id')
  const isNew = id === '' || id === 'new'
  const title = str(fd, 'title')
  if (!title) return { error: 'A title is required.' }

  const slug = str(fd, 'slug') || slugify(title)
  // slugProblem rejects the reserved names too: /[collection] sits at the site
  // root, so a collection slugged "admin" would be unreachable for ever.
  const problem = slugProblem(slug, 'collection')
  if (problem) return { error: problem }

  const { collectionSlugTaken } = await import('@/lib/admin')
  if (await collectionSlugTaken(slug, isNew ? undefined : id)) {
    return { error: `The slug "${slug}" is already used by another collection.` }
  }

  const columns = Number(str(fd, 'columns')) || 1
  const values = [
    slug, title, orNull(fd, 'blurb'), str(fd, 'layout'), columns,
    fd.get('showYear') === 'on', fd.get('showTags') === 'on', fd.get('showBlurb') === 'on',
    str(fd, 'mediaMode'), str(fd, 'sortMode'), str(fd, 'density'),
    orNull(fd, 'itemNounPlural'), fd.get('visible') === 'on',
  ]

  let collectionId = id
  if (isNew) {
    const rows = await sql.query(
      `insert into collections
         (slug, title, blurb, layout, columns, show_year, show_tags, show_blurb,
          media_mode, sort_mode, density, item_noun_plural, visible, sort_order)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,
               coalesce((select max(sort_order) + 1 from collections), 1))
       returning id`,
      values,
    )
    collectionId = (rows as { id: string }[])[0].id
  } else {
    await sql.query(
      `update collections set slug=$1, title=$2, blurb=$3, layout=$4, columns=$5,
         show_year=$6, show_tags=$7, show_blurb=$8, media_mode=$9, sort_mode=$10,
         density=$11, item_noun_plural=$12, visible=$13
       where id=$14`,
      [...values, id],
    )
  }

  revalidateSite()
  redirect(`/admin/collections/${collectionId}?saved=1`)
}

export async function moveCollection(fd: FormData) {
  await requireAuth()
  const id = str(fd, 'id')
  const dir = str(fd, 'dir') === 'up' ? -1 : 1

  const rows = (await sql.query(
    `select id from collections order by sort_order, title`,
  )) as { id: string }[]
  const order = rows.map((r) => r.id)
  const at = order.indexOf(id)
  const to = at + dir
  if (at < 0 || to < 0 || to >= order.length) return
  ;[order[at], order[to]] = [order[to], order[at]]

  await sql.query(
    `update collections as c set sort_order = u.ord
     from (select * from unnest($1::uuid[], $2::int[]) as t(id, ord)) u
     where c.id = u.id`,
    [order, order.map((_, i) => i + 1)],
  )
  revalidateSite()
}

export async function toggleCollectionVisible(fd: FormData) {
  await requireAuth()
  await sql.query(`update collections set visible = not visible where id = $1`, [str(fd, 'id')])
  revalidateSite()
}
