// Five empty collections to begin from, each on a different layout so the
// differences are visible from the first day. Nothing is published yet and no
// items exist: the work is yours to add in /admin.
//
// Safe to re-run. Existing collections are left exactly as they are.
import { connect } from './client.ts'

const collections = [
  { slug: 'films', title: 'Films', blurb: 'Short films.',
    layout: 'feature', columns: 1, show_year: true, show_tags: true, show_blurb: true,
    media_mode: 'cover', sort_mode: 'manual', density: 'comfortable',
    item_noun_plural: 'films', sort_order: 1 },

  { slug: 'music', title: 'Music', blurb: 'Recordings and arrangements.',
    layout: 'list', columns: 1, show_year: true, show_tags: false, show_blurb: true,
    media_mode: 'player', sort_mode: 'manual', density: 'comfortable',
    item_noun_plural: 'pieces', sort_order: 2 },

  { slug: 'code', title: 'Code', blurb: 'Things I have built.',
    layout: 'grid', columns: 2, show_year: false, show_tags: true, show_blurb: true,
    media_mode: 'none', sort_mode: 'manual', density: 'comfortable',
    item_noun_plural: 'projects', sort_order: 3 },

  { slug: 'drawings', title: 'Drawings', blurb: 'Drawing practice.',
    layout: 'gallery', columns: 3, show_year: false, show_tags: false, show_blurb: true,
    media_mode: 'cover', sort_mode: 'manual', density: 'comfortable',
    item_noun_plural: 'drawings', sort_order: 4 },

  { slug: 'writing', title: 'Writing', blurb: null,
    layout: 'prose', columns: 1, show_year: true, show_tags: false, show_blurb: true,
    media_mode: 'none', sort_mode: 'year_desc', density: 'comfortable',
    item_noun_plural: 'pieces', sort_order: 5 },
]

const client = await connect()

for (const c of collections) {
  await client.query(
    `insert into collections
       (slug, title, blurb, layout, columns, show_year, show_tags, show_blurb,
        media_mode, sort_mode, density, item_noun_plural, sort_order, visible)
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13, true)
     on conflict (slug) do nothing`,
    [c.slug, c.title, c.blurb, c.layout, c.columns, c.show_year, c.show_tags,
     c.show_blurb, c.media_mode, c.sort_mode, c.density, c.item_noun_plural, c.sort_order],
  )
}

const rows = await client.query(
  `select sort_order, slug, layout, visible from collections order by sort_order`)
console.table(rows.rows)
console.log(`
Five collections ready, all empty. Two layouts are not used above — 'timeline'
and 'index' — and you can switch any collection to them in /admin.

Next: open /admin, sign in, and press "+ New item".

A collection with nothing published in it is hidden from the site entirely, so
none of these will appear until you add and publish something.`)
await client.end()
