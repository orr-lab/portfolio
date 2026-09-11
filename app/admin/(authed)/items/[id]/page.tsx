import Link from 'next/link'
import { notFound } from 'next/navigation'
import ItemForm from '@/components/admin/ItemForm'
import MediaManager from '@/components/admin/MediaManager'
import PasteUrl from '@/components/admin/PasteUrl'
import { deleteItem } from '@/app/admin/actions'
import { getAdminItem, listAdminCollections } from '@/lib/admin'

type Props = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ collection?: string; saved?: string }>
}

export default async function ItemEditor({ params, searchParams }: Props) {
  const { id } = await params
  const { collection, saved } = await searchParams
  const isNew = id === 'new'

  const [item, collections] = await Promise.all([
    isNew ? Promise.resolve(null) : getAdminItem(id),
    listAdminCollections(),
  ])
  if (!isNew && !item) notFound()

  return (
    <main className="py-4">
      <div className="flex items-center justify-between gap-3">
        <Link href="/admin" className="text-sm text-dim">← Items</Link>
        {item && item.status === 'published' && (
          <Link href={`/${item.collectionSlug}`} className="text-sm text-dim">
            View on site ↗
          </Link>
        )}
      </div>

      <h1 className="mt-3 text-xl">{isNew ? 'New item' : item!.title}</h1>
      {saved && <p className="mt-2 text-sm text-accent">Saved.</p>}

      <ItemForm item={item} collections={collections} defaultCollectionId={collection} />

      {/* Media needs an item to hang off, so it appears once there is one. */}
      {item ? (
        <>
          <MediaManager
            itemId={item.id}
            media={item.media}
            galleryDefault={
              collections.find((c) => c.id === item.collectionId)?.layout === 'gallery'
            }
          />
          <PasteUrl itemId={item.id} />
        </>
      ) : (
        <p className="mt-12 border-t border-rule pt-6 text-sm text-dim">
          Save this item first, then photos and links can be added to it.
        </p>
      )}

      {item && (
        <form action={deleteItem} className="mt-10 border-t border-rule pt-5">
          <input type="hidden" name="id" value={item.id} />
          <button className="min-h-11 text-sm text-dim hover:text-accent">
            Delete this item
          </button>
          <p className="mt-1 text-xs text-dim opacity-70">
            Its media goes with it. There is no undo.
          </p>
        </form>
      )}
    </main>
  )
}
