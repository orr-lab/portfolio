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
