import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { layoutFor } from '@/components/layouts'
import { getCollection, listCollections, listPublishedItems, sortItems } from '@/lib/queries'

// The folder name [collection] makes this one page serve /films, /music and
// every collection added later. `params` carries the matched segment.
type Props = { params: Promise<{ collection: string }> }

// Prerenders one page per visible collection at build time instead of on the
// first request. A collection added later still works; it just renders on demand.
export async function generateStaticParams() {
  const collections = await listCollections()
  return collections.map((c) => ({ collection: c.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { collection: slug } = await params
  const collection = await getCollection(slug)
  if (!collection) return {}
  return {
    title: `${collection.title} — Orr Knaan`,
    description: collection.blurb ?? undefined,
  }
}

export default async function CollectionPage({ params }: Props) {
  const { collection: slug } = await params
  const collection = await getCollection(slug)

  // A hidden collection is not a public page. notFound() renders the 404.
  if (!collection || !collection.visible) notFound()

  const items = sortItems(await listPublishedItems(collection.id), collection.sortMode)
  const Layout = layoutFor(collection.layout)

  return (
    <div className="mx-auto max-w-4xl px-6 sm:px-8">
      <header className="border-b border-rule py-14 sm:py-20">
        <h1 className="text-3xl tracking-tight sm:text-4xl">{collection.title}</h1>
        {collection.blurb && <p className="mt-3 text-lg text-dim">{collection.blurb}</p>}
      </header>

      <main className="py-12 sm:py-16">
        {items.length === 0 || !Layout ? (
          <p className="text-dim">Nothing here yet.</p>
        ) : (
          <Layout items={items} collection={collection} />
        )}
      </main>

      <footer className="border-t border-rule py-10 text-sm text-dim">
        {new Date().getFullYear()}
      </footer>
    </div>
  )
}
