import Link from 'next/link'
import { listAdminCollections, listAdminItems } from '@/lib/admin'
import { moveCollection, toggleCollectionVisible } from '@/app/admin/actions'
import { LAYOUT_DESCRIPTIONS } from '@/components/layouts'

export default async function AdminCollections() {
  const [collections, items] = await Promise.all([listAdminCollections(), listAdminItems()])

  return (
    <main className="py-4">
      <div className="flex items-baseline justify-between gap-3">
        <h1 className="text-xl">Collections</h1>
        <Link href="/admin/collections/new"
              className="flex min-h-9 shrink-0 items-center border border-rule px-3 text-sm text-accent">
          + Add
        </Link>
      </div>
      <p className="mt-1 text-xs text-dim opacity-70">
        A new kind of work is a row here. It never needs new code.
      </p>

      <ul className="mt-6 divide-y divide-rule">
        {collections.map((c, index) => {
          const count = items.filter((i) => i.collectionId === c.id).length
          return (
            <li key={c.id} className="flex items-center gap-1 py-1">
              <Link href={`/admin/collections/${c.id}`} className="min-w-0 flex-1 py-3">
                <span className="block truncate text-base">
                  {c.title}
                  {!c.visible && <span className="ml-2 text-xs text-dim">hidden</span>}
                </span>
                {/* Plain words, never the raw enum. */}
                <span className="mt-0.5 block truncate text-xs text-dim">
                  {LAYOUT_DESCRIPTIONS[c.layout]}
                </span>
                <span className="mt-0.5 block text-xs text-dim opacity-70">
                  /{c.slug} · {count} {count === 1 ? 'item' : 'items'}
                </span>
              </Link>

              <form action={toggleCollectionVisible}>
                <input type="hidden" name="id" value={c.id} />
                <button className={`min-h-11 min-w-11 text-xs ${c.visible ? 'text-accent' : 'text-dim'}`}
                        title={c.visible ? 'Hide' : 'Show'}>
                  {c.visible ? 'Shown' : 'Hidden'}
                </button>
              </form>
              <form action={moveCollection}>
                <input type="hidden" name="id" value={c.id} />
                <input type="hidden" name="dir" value="up" />
                <button className="min-h-11 min-w-10 text-dim disabled:opacity-25"
                        disabled={index === 0} title="Move up">↑</button>
              </form>
              <form action={moveCollection}>
                <input type="hidden" name="id" value={c.id} />
                <input type="hidden" name="dir" value="down" />
                <button className="min-h-11 min-w-10 text-dim disabled:opacity-25"
                        disabled={index === collections.length - 1} title="Move down">↓</button>
              </form>
            </li>
          )
        })}
      </ul>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-rule bg-bg/95 backdrop-blur">
        <div className="mx-auto flex max-w-2xl gap-3 px-4 py-3">
          <Link
            href="/admin/collections/new"
            className="flex min-h-12 flex-1 items-center justify-center border border-accent text-base text-accent"
          >
            + New collection
          </Link>
          <Link
            href="/admin"
            className="flex min-h-12 items-center justify-center border border-rule px-4 text-base text-dim"
          >
            Items
          </Link>
        </div>
      </div>
    </main>
  )
}
