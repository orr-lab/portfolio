'use client'
// 'use client' marks this file as running in the browser. Everything else on
// the site renders on the server only; this needs clicks and key presses.

import { useCallback, useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { iconForUrl, serviceNameFor } from './Icons'

export type Shot = {
  id: string
  url: string
  caption: string | null
  href: string | null
  /** Where this image came from, if anywhere. */
  linkUrl: string | null
  width: number | null
  height: number | null
}

/**
 * A link to wherever an image came from: its service's mark AND that service's
 * name. The mark alone was a 14px dot with nothing to read and nothing much to
 * hit — it has to be big enough for a thumb and say where it goes.
 */
function SourceLink({ href, big = false }: { href: string; big?: boolean }) {
  const Icon = iconForUrl(href)
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      // Inside the lightbox this sits on a click-to-close backdrop.
      onClick={(e) => e.stopPropagation()}
      className={
        big
          ? 'inline-flex min-h-11 items-center gap-2 px-3 text-sm text-[#cfcabf] underline-offset-4 hover:text-accent'
          : 'inline-flex min-h-11 items-center gap-1.5 text-xs text-dim underline-offset-4 hover:text-accent'
      }
    >
      {Icon && <Icon size={big ? 20 : 16} />}
      {serviceNameFor(href)}
    </a>
  )
}

export type ShotGroup = { key: string; label: string | null; shots: Shot[] }

export default function Lightbox(
  { groups, columns }: { groups: ShotGroup[]; columns: 1 | 2 | 3 },
) {
  // Navigation runs over every image on the page, so the arrows carry on
  // across a month heading instead of stopping at it.
  const shots = groups.flatMap((g) => g.shots)
  // useState holds a value that survives re-renders. `open` is the index of the
  // image being viewed, or null when the lightbox is closed. Calling setOpen
  // re-renders this component with the new value.
  const [open, setOpen] = useState<number | null>(null)

  const close = useCallback(() => setOpen(null), [])
  const step = useCallback(
    (d: number) => setOpen((i) => (i === null ? null : (i + d + shots.length) % shots.length)),
    [shots.length],
  )

  // useEffect runs after render, for things outside React — here, a window-level
  // key listener. The returned function undoes it when the lightbox closes.
  useEffect(() => {
    if (open === null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
      if (e.key === 'ArrowRight') step(1)
      if (e.key === 'ArrowLeft') step(-1)
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, close, step])

  // CSS columns rather than a grid: a masonry flow lets each drawing keep its
  // own proportions. A grid would force one shape on all of them, and a square
  // crop of a tall pencil study keeps the trunk and throws away the tree.
  const cols = columns === 1 ? 'columns-1'
    : columns === 2 ? 'columns-2'
    : 'columns-2 sm:columns-3'

  const current = open === null ? null : shots[open]

  // One look for every control floating over an image: a 44px disc, dark
  // enough to carry a pale glyph, with a hairline so it still separates from a
  // black photograph.
  const control =
    'absolute inline-flex h-11 w-11 items-center justify-center rounded-full ' +
    'bg-black/60 text-[#f4f1ea] ring-1 ring-white/20 backdrop-blur-sm ' +
    'transition-colors hover:bg-black/80 hover:text-accent'

  return (
    <>
      {groups.map((group) => (
        <section key={group.key} className={group.label ? 'mt-8 first:mt-0' : ''}>
          {group.label && (
            <h3 className="eyebrow mb-3 border-t border-rule pt-3">{group.label}</h3>
          )}
          <div className={`${cols} gap-2 sm:gap-3`}>
        {group.shots.map((shot) => {
          // Index within the whole wall, so opening any tile lands the viewer
          // in the right place regardless of which month it sits under.
          const i = shots.indexOf(shot)
          return (
          <figure key={shot.id} className="mb-2 break-inside-avoid sm:mb-3">
          <button
            type="button"
            onClick={() => setOpen(i)}
            className="block w-full cursor-zoom-in overflow-hidden"
            aria-label={shot.caption ?? 'Open image'}
          >
            {shot.width && shot.height ? (
              // Real dimensions: Next reserves the right space, so nothing
              // jumps as the images arrive, and the tile keeps its true shape.
              <Image
                src={shot.url}
                alt={shot.caption ?? ''}
                width={shot.width}
                height={shot.height}
                sizes="(max-width: 640px) 50vw, 33vw"
                className="h-auto w-full transition-opacity hover:opacity-85"
              />
            ) : (
              // No stored size (an older row): fall back to a square.
              <span className="relative block w-full" style={{ aspectRatio: '1 / 1' }}>
                <Image
                  src={shot.url}
                  alt={shot.caption ?? ''}
                  fill
                  sizes="(max-width: 640px) 50vw, 33vw"
                  className="object-cover transition-opacity hover:opacity-85"
                />
              </span>
            )}
          </button>
          {/* Not a title and not a card — a drawing's number, date and where it
              came from. Kept small and quiet so the wall still reads as a wall. */}
          {(shot.caption || shot.linkUrl) && (
            // No min-height here: it would centre a lone caption inside a 44px
            // box and float it away from its picture. The link carries its own
            // tap target, which is where that height belongs.
            <figcaption className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-dim">
              {shot.caption && <span className="tabular-nums">{shot.caption}</span>}
              {shot.linkUrl && <SourceLink href={shot.linkUrl} />}
            </figcaption>
          )}
          </figure>
          )
        })}
          </div>
        </section>
      ))}

      {current && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={close}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/97 p-4 backdrop-blur-sm"
        >
          <div className="relative h-full max-h-[80vh] w-full max-w-5xl">
            <Image
              src={current.url}
              alt={current.caption ?? ''}
              fill
              sizes="100vw"
              className="object-contain"
            />
          </div>
          <div className="mt-4 flex max-w-2xl flex-col items-center gap-2 text-center">
            {current.caption && <p className="text-sm text-[#cfcabf]">{current.caption}</p>}
            {/* A gallery tap opens the lightbox, so an item with a body would
                otherwise have an unreachable detail page. This is its way in. */}
            {current.linkUrl && <SourceLink href={current.linkUrl} big />}
            {current.href && (
              <Link href={current.href} className="text-sm text-accent underline underline-offset-4">
                Read more
              </Link>
            )}
            <p className="text-xs text-[#8a857c]">{open! + 1} / {shots.length}</p>
          </div>

          {/* These sit on top of the picture, and a drawing on white paper
              leaves a bare glyph invisible. Each gets its own dark disc so it
              reads against anything underneath it. */}
          <button type="button" onClick={close} aria-label="Close"
            className={`${control} top-4 right-4 text-2xl`}>×</button>
          <button type="button" onClick={(e) => { e.stopPropagation(); step(-1) }} aria-label="Previous"
            className={`${control} top-1/2 left-3 -translate-y-1/2 pb-0.5 text-3xl`}>‹</button>
          <button type="button" onClick={(e) => { e.stopPropagation(); step(1) }} aria-label="Next"
            className={`${control} top-1/2 right-3 -translate-y-1/2 pb-0.5 text-3xl`}>›</button>
        </div>
      )}
    </>
  )
}
