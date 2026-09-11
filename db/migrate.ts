// Applies db/migrations/*.sql in filename order, once each, inside a
// transaction. Re-running is safe: applied files are recorded and skipped.
import { readdir, readFile } from 'node:fs/promises'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { connect } from './client.ts'

const dir = join(dirname(fileURLToPath(import.meta.url)), 'migrations')
const client = await connect()

await client.query(`
  create table if not exists _migrations (
    name       text primary key,
    applied_at timestamptz not null default now()
  )
`)

const applied = new Set(
  (await client.query('select name from _migrations')).rows.map((r) => r.name),
)
const files = (await readdir(dir)).filter((f) => f.endsWith('.sql')).sort()

let ran = 0
for (const file of files) {
  if (applied.has(file)) {
    console.log(`  skip   ${file}`)
    continue
  }
  const sql = await readFile(join(dir, file), 'utf8')
  try {
    await client.query('begin')
    await client.query(sql)
    await client.query('insert into _migrations (name) values ($1)', [file])
    await client.query('commit')
    console.log(`  applied ${file}`)
    ran++
  } catch (err) {
    await client.query('rollback')
    console.error(`\n  FAILED  ${file}\n`)
    throw err
  }
}

console.log(ran === 0 ? '\nNothing to do — schema is current.' : `\n${ran} migration(s) applied.`)
await client.end()
