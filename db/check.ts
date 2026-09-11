// Asserts the invariants in CLAUDE.md are enforced by the DATABASE, not by
// hope. Everything runs inside a transaction that is rolled back, so this is
// safe against the live database. Run: npm run db:check
import { connect } from './client.ts'

const client = await connect()
let pass = 0
let fail = 0

/** Expect a statement to be rejected. Savepoints keep the outer txn usable. */
async function rejects(name: string, sql: string, params: unknown[] = []) {
  await client.query('savepoint s')
  try {
    await client.query(sql, params)
    await client.query('rollback to savepoint s')
    console.log(`  FAIL  ${name} — was allowed, should have been rejected`)
    fail++
  } catch (err) {
    await client.query('rollback to savepoint s')
    console.log(`  ok    ${name} — ${(err as Error).message.split('\n')[0]}`)
    pass++
  }
}

async function is(name: string, actual: unknown, expected: unknown) {
  if (String(actual) === String(expected)) {
    console.log(`  ok    ${name} — ${actual}`)
    pass++
  } else {
    console.log(`  FAIL  ${name} — got ${actual}, expected ${expected}`)
    fail++
  }
}

await client.query('begin')

console.log('\nitems columns')
const cols = await client.query(`
  select column_name, data_type, is_nullable
  from information_schema.columns where table_name = 'items'
  order by ordinal_position`)
console.table(cols.rows)

console.log('\nconstraints hold')

await rejects(
  'only one featured item site-wide',
  `insert into items (collection_id, slug, title, blurb, featured, status)
   select collection_id, 'second-featured', 'Second', 'x', true, 'published'
   from items where slug = 'safe-house'`)

await rejects(
  "collection slug 'admin' is reserved",
  `insert into collections (slug, title) values ('admin', 'Admin')`)

await rejects(
  'collection slug must be url-safe',
  `insert into collections (slug, title) values ('Not A Slug', 'Nope')`)

await rejects(
  'layout must be one of the seven',
  `insert into collections (slug, title, layout) values ('eighth', 'Eighth', 'carousel')`)

await rejects(
  'media kind must be known',
  `insert into media (item_id, kind, url)
   select id, 'hologram', 'https://x' from items where slug = 'safe-house'`)

await rejects(
  'status must be draft or published',
  `update items set status = 'maybe' where slug = 'safe-house'`)

await rejects(
  'a collection with items cannot be deleted',
  `delete from collections where slug = 'films'`)

console.log('\nbehaviour')

// Cover rule: first media row by sort_order, including negative sort_orders.
const item = (await client.query(`select id from items where slug = 'daily-drawings'`)).rows[0].id
await client.query(
  `insert into media (item_id, kind, url, sort_order) values ($1,'image','https://a/1.png',0)`, [item])
await client.query(
  `insert into media (item_id, kind, url, sort_order)
   values ($1,'image','https://a/2.png', (select coalesce(min(sort_order),0) - 1 from media where item_id = $1))`,
  [item])
const cover = await client.query(
  `select url from media where item_id = $1 order by sort_order limit 1`, [item])
await is('newest gallery upload becomes the cover', cover.rows[0].url, 'https://a/2.png')

const before = (await client.query(`select updated_at from items where slug = 'this-site'`)).rows[0].updated_at
await client.query(`update items set title = 'This site ' where slug = 'this-site'`)
const after = (await client.query(`select updated_at from items where slug = 'this-site'`)).rows[0].updated_at
await is('updated_at trigger fires on write', after > before, 'true')

await client.query(`delete from items where slug = 'daily-drawings'`)
const orphans = await client.query(`select count(*)::int as n from media where item_id = $1`, [item])
await is('media cascade-deletes with its item', orphans.rows[0].n, 0)

await client.query('rollback')

console.log(`\n${pass} passed, ${fail} failed`)
await client.end()
process.exit(fail === 0 ? 0 : 1)
