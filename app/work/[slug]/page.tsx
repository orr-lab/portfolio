import Link from 'next/link'
import { notFound } from 'next/navigation'
import Footer from '@/components/Footer'
import type { Metadata } from 'next'
import NavBar from '@/components/NavBar'
import Lightbox, { type Shot } from '@/components/Lightbox'
import { Cover, EmbedPlayer, FileLink } from '@/components/Media'
import AudioPlayer from '@/components/AudioPlayer'
import { getItemBySlug, listItemsWithBody, listNavCollections } from '@/lib/queries'
import { renderMarkdown } from '@/lib/markdown'

type Props = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  return listItemsWithBody()
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const found = await getItemBySlug(slug)
  if (!found) return {}
  return {
    title: `${found.item.title} — Orr Knaan`,
    description: found.item.blurb ?? undefined,
  }
}

export default async function WorkPage({ params }: Props) {
  const { slug } = await params
  const found = await getItemBySlug(slug)

  // No body means no detail page. Drafts are not public either.
  if (!found) notFound()

  const { item, collection } = found
  const collections = await listNavCollections()
  const html = await renderMarkdown(item.body!)

  const embeds = item.media.filter((m) => m.kind === 'embed')
  const images = item.media.filter((m) => m.kind === 'image')
  const audio = item.media.filter((m) => m.kind === 'audio')
  const files = item.media.filter((m) => m.kind === 'file')

  const { captionFor, numberByDate } = await import('@/lib/sequence')
  const numbers = numberByDate(images)
  const shots: Shot[] = images.map((m) => ({
    id: m.id, url: m.url, caption: captionFor(m, numbers),
    linkUrl: m.linkUrl, width: m.width, height: m.height, href: null,
  }))

  return (
    <>
      <NavBar collections={collections} mode="page" activeSlug={collection.slug} />
      <div className="mx-auto max-w-3xl px-6 sm:px-8">
        <header className="pt-12 pb-10 sm:pt-16">
          <Link
            href={`/${collection.slug}`}
            className="text-sm text-dim underline-offset-4 hover:text-accent"
          >
            ← {collection.title}
          </Link>
          <h1 className="display mt-6 text-3xl text-balance sm:text-4xl">{item.title}</h1>
          {item.subtitle && <p className="display mt-2 text-xl text-dim">{item.subtitle}</p>}
          {(item.dateLabel ?? item.year) && (
            <p className="mt-3 text-sm text-dim tabular-nums">{item.dateLabel ?? item.year}</p>
          )}
          {item.tags.length > 0 && (
            <ul className="mt-4 flex flex-wrap gap-x-3 gap-y-1">
              {item.tags.map((t) => (
                <li key={t} className="text-xs tracking-wide text-dim uppercase">{t}</li>
              ))}
            </ul>
          )}
        </header>

        {embeds.map((m) => <div key={m.id} className="mb-10"><EmbedPlayer media={m} /></div>)}

        {/* The body is markdown Orr wrote in /admin, rendered on the server.
            .prose in globals.css gives the generated tags their typography. */}
        <article className="prose" dangerouslySetInnerHTML={{ __html: html }} />

        {audio.length > 0 && (
          <div className="mt-10">{audio.map((m) => (
              <AudioPlayer key={m.id} media={m} title={item.title} href={`/work/${item.slug}`} />
            ))}</div>
        )}

        {/* An item's own images render as a gallery too, so one item holding a
            hundred drawings works here exactly as it does on /[collection]. */}
        {shots.length > 1 && <div className="mt-12"><Lightbox shots={shots} columns={3} /></div>}
        {shots.length === 1 && (
          <div className="relative mt-12 w-full overflow-hidden" style={{ aspectRatio: '3 / 2' }}>
            <Cover media={images[0]} sizes="(max-width: 768px) 100vw, 768px" />
          </div>
        )}

        {(files.length > 0 || item.url) && (
          <div className="mt-10 flex flex-wrap gap-x-6 gap-y-2 border-t border-rule pt-6">
            {item.url && (
              <a href={item.url} target="_blank" rel="noreferrer"
                 className="text-sm text-accent underline-offset-4 hover:underline">
                {item.urlLabel ?? item.url.replace(/^https?:\/\//, '')} ↗
              </a>
            )}
            {files.map((m) => <FileLink key={m.id} media={m} />)}
          </div>
        )}

        <div className="mt-14"><Footer /></div>
      </div>
    </>
  )
}
