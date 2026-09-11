import Link from 'next/link'
import { notFound } from 'next/navigation'
import CollectionForm from '@/components/admin/CollectionForm'
import { getCollection, listPublishedItems, sortItems } from '@/lib/queries'

type Props = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ saved?: string }>
}

export default async function CollectionEditor({ params, searchParams }: Props) {
  const { id } = await params
  const { saved } = await searchParams
  const isNew = id === 'new'

  // getCollection takes a slug; look up by id for the editor.
  const { sql } = await import('@/lib/db')
  const rows = isNew ? [] : await sql`select slug from collections where id = ${id}`
  if (!isNew && rows.length === 0) notFound()

  const collection = isNew ? null : await getCollection(rows[0].slug as string)
  if (!isNew && !collection) notFound()

  // The three items the preview will draw. Fetched on the server; the preview
  // itself re-renders them in the browser as the flags change.
  const items = collection
    ? sortItems(await listPublishedItems(collection.id), collection.sortMode).slice(0, 3)
    : []

  return (
    <main className="py-4">
      <Link href="/admin/collections" className="text-sm text-dim">← Collections</Link>
      <h1 className="mt-3 text-xl">{isNew ? 'New collection' : collection!.title}</h1>
      {saved && <p className="mt-2 text-sm text-accent">Saved.</p>}
      <CollectionForm collection={collection} previewItems={items} />
    </main>
  )
}
