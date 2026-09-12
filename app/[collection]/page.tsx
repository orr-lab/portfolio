import { notFound } from 'next/navigation'
import Footer from '@/components/Footer'
import { site } from '@/site.config'
import type { Metadata } from 'next'
import NavBar from '@/components/NavBar'
import { layoutFor } from '@/components/layouts'
import {
  getCollection, listCollections, listNavCollections, listPublishedItems, sortItems,
} from '@/lib/queries'

// The folder name [collection] makes this one page serve /films, /music and
// every collection added later. `params` carries the matched segment.
type Props = { params: Promise<{ collection: string }> }

// Prerenders one page per visible collection at build time instead of on the
// first request. A collection added later still works; it just renders on demand.
export async function generateStaticParams() {
  const collections = await listNavCollections()
  return collections.map((c) => ({ collection: c.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { collection: slug } = await params
  const collection = await getCollection(slug)
  if (!collection) return {}
  return {
    title: `${collection.title} — ${site.name}`,
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
  const collections = await listNavCollections()

  return (
    <div className="mx-auto max-w-4xl px-6 sm:px-8">
      <NavBar collections={collections} mode="page" activeSlug={collection.slug} />
      <header className="border-b border-rule pt-20 pb-14 sm:pt-24 sm:pb-20">
        <h1 className="display text-3xl sm:text-4xl">{collection.title}</h1>
        {collection.blurb && <p className="mt-3 text-lg text-dim">{collection.blurb}</p>}
      </header>

      <main className="py-10 sm:py-14">
        {items.length === 0 || !Layout ? (
          <p className="text-dim">Nothing here yet.</p>
        ) : (
          <Layout items={items} collection={collection} />
        )}
      </main>

      <Footer />
    </div>
  )
}
