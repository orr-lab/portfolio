import Link from 'next/link'
import Hero from '@/components/Hero'
import NavBar from '@/components/NavBar'
import Featured from '@/components/Featured'
import Portrait from '@/components/Portrait'
import { layoutFor } from '@/components/layouts'
import {
  HUB_LIMITS, getFeaturedItem, hasRenderableContent,
  listCollections, listPublishedItems, sortItems,
} from '@/lib/queries'

export default async function Hub() {
  // Three independent queries, so they run at the same time rather than in turn.
  const [collections, allItems, featured] = await Promise.all([
    listCollections(),
    listPublishedItems(),
    getFeaturedItem(),
  ])

  const sections = collections
    .map((collection) => {
      const all = sortItems(
        allItems.filter((i) => i.collectionId === collection.id),
        collection.sortMode,
      )
      // The featured item already appears above, so it is dropped here. It still
      // shows normally on /[collection].
      const rest = featured ? all.filter((i) => i.id !== featured.id) : all
      const limit = HUB_LIMITS[collection.layout]
      return { collection, shown: rest.slice(0, limit), total: all.length, limit }
    })
    .filter((s) => hasRenderableContent(s.collection, s.shown))

  return (
    <>
      <div className="mx-auto max-w-4xl px-6 sm:px-8">
        <NavBar collections={sections.map((s) => s.collection)} mode="hub" />
        <Hero />
        {/* The bar appears once this scrolls out of view. */}
        <div id="hero-sentinel" aria-hidden />
        {featured && <Featured item={featured} />}

        {sections.map(({ collection, shown, total, limit }) => {
          const Layout = layoutFor(collection.layout)
          if (!Layout) return null
          return (
            <section
              key={collection.id}
              id={collection.slug}
              // scroll-margin keeps the heading clear of the sticky bar.
              className="scroll-mt-20 border-t border-rule py-14 sm:py-20"
            >
              <h2 className="text-sm tracking-widest uppercase text-dim">{collection.title}</h2>
              {collection.blurb && <p className="mt-2 mb-8 text-lg">{collection.blurb}</p>}
              <Layout items={shown} collection={collection} />
              {/* Only shown when there is genuinely more, which also guarantees
                  the count is plural and the noun reads correctly. */}
              {total > limit && (
                <Link
                  href={`/${collection.slug}`}
                  className="mt-8 inline-block text-sm text-accent underline-offset-4 hover:underline"
                >
                  All {total} {collection.itemNounPlural ?? 'items'} →
                </Link>
              )}
            </section>
          )
        })}

        {/* Marks where the sections stop, so the bar can light the last one. */}
        <div id="sections-end" aria-hidden />
      </div>

      {/* Outside the column on purpose: this one runs edge to edge. */}
      <Portrait />

      <div className="mx-auto max-w-4xl px-6 sm:px-8">
        <footer className="py-10 text-sm text-dim">{new Date().getFullYear()}</footer>
      </div>
    </>
  )
}
