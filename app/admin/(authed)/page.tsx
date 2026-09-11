import Link from 'next/link'
import { listAdminCollections, listAdminItems } from '@/lib/admin'
import { moveItem, setFeatured, toggleStatus } from '@/app/admin/actions'

export default async function AdminItems({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  const [items, collections] = await Promise.all([listAdminItems(q), listAdminCollections()])

  return (
    <main className="py-4">
      {/* A plain GET form: searching is a link, so it needs no JavaScript and
          the result can be bookmarked or reloaded. */}
      <form className="flex gap-2">
        <input
          name="q"
          defaultValue={q ?? ''}
          placeholder="Search titles"
          aria-label="Search titles"
          className="min-h-12 w-full border border-rule bg-transparent px-4 text-base"
        />
        {q && (
          <Link href="/admin" className="flex min-h-12 items-center px-3 text-sm text-dim">
            Clear
          </Link>
        )}
      </form>

      {collections.map((c) => {
        const group = items.filter((i) => i.collectionId === c.id)
        if (q && group.length === 0) return null
        return (
          <section key={c.id} className="mt-8">
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="eyebrow">
                {c.title}
                {!c.visible && <span className="ml-2 normal-case tracking-normal">(hidden)</span>}
              </h2>
              <Link
                href={`/admin/items/new?collection=${c.id}`}
                className="text-sm text-accent"
              >
                + New
              </Link>
            </div>

            {group.length === 0 ? (
              <p className="mt-3 text-sm text-dim">Nothing here yet.</p>
            ) : (
              <ul className="mt-2">
                {group.map((item, index) => (
                  <li key={item.id} className="flex items-center gap-1 border-b border-rule py-1">
                    <Link href={`/admin/items/${item.id}`} className="min-w-0 flex-1 py-3">
                      <span className="block truncate text-base">
                        {item.featured && <span className="text-accent" title="Featured">★ </span>}
                        {item.title}
                      </span>
                      <span className="mt-0.5 block truncate text-xs text-dim">
                        {item.status === 'draft' ? 'Draft · ' : ''}
                        {item.media.length > 0 ? `${item.media.length} media · ` : ''}
                        /{item.slug}
                      </span>
                    </Link>

                    {/* Each control is its own form so the whole screen keeps
                        working with JavaScript switched off. */}
                    <form action={toggleStatus}>
                      <input type="hidden" name="id" value={item.id} />
                      <button
                        className={`min-h-11 min-w-11 text-xs ${item.status === 'published' ? 'text-accent' : 'text-dim'}`}
                        title={item.status === 'published' ? 'Unpublish' : 'Publish'}
                      >
                        {item.status === 'published' ? 'Live' : 'Draft'}
                      </button>
                    </form>

                    <form action={setFeatured}>
                      <input type="hidden" name="id" value={item.id} />
                      <input type="hidden" name="on" value={item.featured ? '0' : '1'} />
                      <button
                        className={`min-h-11 min-w-11 text-base ${item.featured ? 'text-accent' : 'text-dim'}`}
                        title={item.featured ? 'Remove featured' : 'Make featured'}
                      >
                        ★
                      </button>
                    </form>

                    <form action={moveItem}>
                      <input type="hidden" name="id" value={item.id} />
                      <input type="hidden" name="dir" value="up" />
                      <button
                        className="min-h-11 min-w-11 text-base text-dim disabled:opacity-25"
                        disabled={index === 0}
                        title="Move up"
                      >
                        ↑
                      </button>
                    </form>
                    <form action={moveItem}>
                      <input type="hidden" name="id" value={item.id} />
                      <input type="hidden" name="dir" value="down" />
                      <button
                        className="min-h-11 min-w-11 text-base text-dim disabled:opacity-25"
                        disabled={index === group.length - 1}
                        title="Move down"
                      >
                        ↓
                      </button>
                    </form>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )
      })}

      {q && items.length === 0 && (
        <p className="mt-8 text-dim">Nothing matches “{q}”.</p>
      )}
    </main>
  )
}
