import { sql } from '@/lib/db'

// Phase a placeholder. Its job is to prove the chain Next → Neon → seeded rows
// is real. The hub proper arrives in phase b and replaces this entirely.

// An async component: it runs on the server, awaits the database directly, and
// ships only the finished HTML. There is no loading state and no fetch call.
export default async function Page() {
  const rows = await sql`
    select c.slug, c.title, c.layout, c.visible,
           count(i.id) filter (where i.status = 'published') as published
    from collections c
    left join items i on i.collection_id = c.id
    group by c.id
    order by c.sort_order
  `

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-2xl">Orr Knaan</h1>
      <p className="mt-2 text-dim">I make things across film, music, code and drawing.</p>
      <table className="mt-10 w-full text-left text-sm">
        <tbody>
          {/* .map turns each row into a list of elements. `key` lets React tell
              them apart across re-renders, so it must be unique and stable. */}
          {rows.map((c) => (
            <tr key={c.slug} className="border-t border-rule">
              <td className="py-2">{c.title}</td>
              <td className="py-2 text-dim">{c.layout}</td>
              <td className="py-2 text-dim">{c.published} published</td>
              <td className="py-2 text-accent">{c.visible ? '' : 'hidden'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  )
}
