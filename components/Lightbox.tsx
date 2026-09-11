'use client'
// 'use client' marks this file as running in the browser. Everything else on
// the site renders on the server only; this needs clicks and key presses.

import { useCallback, useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

export type Shot = { id: string; url: string; caption: string | null; href: string | null }

export default function Lightbox({ shots, columns }: { shots: Shot[]; columns: 1 | 2 | 3 }) {
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

  const cols = columns === 1 ? 'grid-cols-1'
    : columns === 2 ? 'grid-cols-2'
    : 'grid-cols-2 sm:grid-cols-3'

  const current = open === null ? null : shots[open]

  return (
    <>
      <ul className={`grid ${cols} gap-2 sm:gap-3`}>
        {shots.map((shot, i) => (
          <li key={shot.id}>
            <button
              type="button"
              onClick={() => setOpen(i)}
              className="relative block w-full cursor-zoom-in overflow-hidden"
              style={{ aspectRatio: '1 / 1' }}
              aria-label={shot.caption ?? 'Open image'}
            >
              <Image
                src={shot.url}
                alt={shot.caption ?? ''}
                fill
                sizes="(max-width: 640px) 50vw, 33vw"
                className="object-cover transition-opacity hover:opacity-85"
              />
            </button>
          </li>
        ))}
      </ul>

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
            {current.href && (
              <Link href={current.href} className="text-sm text-accent underline underline-offset-4">
                Read more
              </Link>
            )}
            <p className="text-xs text-[#8a857c]">{open! + 1} / {shots.length}</p>
          </div>

          <button type="button" onClick={close}
            className="absolute top-4 right-5 text-2xl text-[#cfcabf]" aria-label="Close">×</button>
          <button type="button" onClick={(e) => { e.stopPropagation(); step(-1) }}
            className="absolute top-1/2 left-3 text-3xl text-[#cfcabf]" aria-label="Previous">‹</button>
          <button type="button" onClick={(e) => { e.stopPropagation(); step(1) }}
            className="absolute top-1/2 right-3 text-3xl text-[#cfcabf]" aria-label="Next">›</button>
        </div>
      )}
    </>
  )
}
